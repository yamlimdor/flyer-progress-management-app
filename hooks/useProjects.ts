import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, ProjectStatus, ProjectFile, Comment, UserRole } from '../types';
import { EVENT_NAMES } from '../lib/config';

export interface UseProjectsReturn {
  projects: Project[];
  error: string | null;
  addProject: (newProjectData: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (projectId: string, updatedData: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<void>;
  updateProjectStatus: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
  addFileToProject: (projectId: string, file: File) => Promise<void>;
  addCommentToProject: (projectId: string, commentText: string, userName: string, role: UserRole) => Promise<void>;
  deleteFileFromProject: (projectId: string, fileName: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('eventDate', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      setError(`データの取得に失敗しました: ${error.message}`);
    } else {
      const sortedData = (data as Project[]).sort((a, b) => {
        // Primary sort by eventDate
        if (a.eventDate < b.eventDate) return -1;
        if (a.eventDate > b.eventDate) return 1;

        // Secondary sort by eventName based on EVENT_NAMES order
        const indexA = EVENT_NAMES.indexOf(a.eventName);
        const indexB = EVENT_NAMES.indexOf(b.eventName);

        if (indexA === -1 && indexB === -1) return 0; // Both not in list, maintain original order
        if (indexA === -1) return 1; // A not in list, B is, so B comes first
        if (indexB === -1) return -1; // B not in list, A is, so A comes first

        return indexA - indexB;
      });
      setProjects(sortedData);
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    const channel = supabase.channel('realtime projects');
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProjects]);

  const addProject = useCallback(async (newProjectData: Omit<Project, 'id' | 'status' | 'createdAt'>) => {
    const { error } = await supabase.from('projects').insert([
      {
        ...newProjectData,
        files: [],
        comments: [],
      },
    ]);
    if (error) {
      console.error('Error adding project:', error);
    }
  }, []);

  const updateProject = useCallback(async (projectId: string, updatedData: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    const { error } = await supabase
      .from('projects')
      .update(updatedData)
      .eq('id', projectId);
    if (error) {
      console.error('Error updating project:', error);
    }
  }, []);

  const updateProjectStatus = useCallback(async (projectId: string, newStatus: ProjectStatus) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);
    if (error) {
      console.error('Error updating project status:', error);
    }
  }, []);

  const addFileToProject = useCallback(async (projectId: string, file: File) => {
    if (!projectId) return;
    
    const filePath = `${projectId}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('flyer-uploads')
      .upload(filePath, file, {
        upsert: true, // 既存のファイルを上書きする
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('flyer-uploads')
      .getPublicUrl(filePath);

    const newFile: ProjectFile = {
      name: file.name,
      url: publicUrlData.publicUrl,
      uploadedAt: new Date(),
    };

    const { error: rpcError } = await supabase.rpc('add_file_to_project', {
      project_id: projectId,
      new_file: newFile,
    });

    if (rpcError) {
      console.error('Error adding file to project:', rpcError);
    }
  }, []);

  const addCommentToProject = useCallback(async (projectId: string, commentText: string, userName: string, role: UserRole) => {
    const newComment: Comment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      text: commentText,
      userName: userName,
      role: role,
      timestamp: new Date(),
    };

    const { error } = await supabase.rpc('add_comment_to_project', {
      project_id: projectId,
      new_comment: newComment,
    });

    if (error) {
      console.error('Error adding comment:', error);
    }
  }, []);

  const deleteFileFromProject = useCallback(async (projectId: string, fileName: string) => {
    if (!projectId || !fileName) return;

    // 1. Delete from Storage
    const filePath = `${projectId}/${fileName}`;
    const { error: storageError } = await supabase.storage
      .from('flyer-uploads')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }

    // 2. Delete from Database via RPC
    const { error: rpcError } = await supabase.rpc('delete_file_from_project', {
      project_id: projectId,
      file_name: fileName,
    });

    if (rpcError) {
      console.error('Error deleting file from project:', rpcError);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    // Fetch the project to get file names
    const { data: projectData, error: fetchError } = await supabase
      .from('projects')
      .select('files')
      .eq('id', projectId)
      .single();

    if (fetchError) {
      console.error('Error fetching project for deletion:', fetchError);
      return;
    }

    // Delete associated files from storage
    if (projectData && projectData.files && projectData.files.length > 0) {
      const filePaths = projectData.files.map((file: ProjectFile) => `${projectId}/${file.name}`);
      const { error: storageError } = await supabase.storage
        .from('flyer-uploads')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
      }
    }

    // Delete the project from the database
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
    }
  }, []);

  return { projects, error, addProject, updateProject, updateProjectStatus, addFileToProject, addCommentToProject, deleteFileFromProject, deleteProject };
};