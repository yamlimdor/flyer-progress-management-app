import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, ProjectStatus, ProjectFile, Comment, UserRole } from '../types';

export interface UseProjectsReturn {
  projects: Project[];
  error: string | null;
  addProject: (newProjectData: Omit<Project, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateProject: (projectId: string, updatedData: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<void>;
  updateProjectStatus: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
  addFileToProject: (projectId: string, file: File) => Promise<void>;
  addCommentToProject: (projectId: string, commentText: string, userName: string, role: UserRole) => Promise<void>;
  deleteFileFromProject: (projectId: string, fileName: string) => Promise<void>;
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
      setProjects(data as Project[]);
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
        status: '未定',
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

  return { projects, error, addProject, updateProject, updateProjectStatus, addFileToProject, addCommentToProject, deleteFileFromProject };
};