import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import NewProjectForm from './components/NewProjectForm';
import ProjectInfo from './components/ProjectInfo';
import FileManager from './components/FileManager';
import CommentSection from './components/CommentSection';
import StatusUpdater from './components/StatusUpdater';
import { useProjects } from './hooks/useProjects';
import type { Project, ProjectStatus, UserRole } from './types';
import { SITE_PASSWORD } from './lib/config';

const AUTH_KEY = 'flyer-app-auth';

// --- Project Detail Component ---
interface ProjectDetailProps {
  project: Project;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onAddFile: (projectId: string, file: File) => void;
  onAddComment: (projectId: string, commentText: string, userName: string, role: UserRole) => void;
  onUpdateProject: (projectId: string, updatedData: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  onDeleteFile: (projectId: string, fileName: string) => void; // New prop
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onUpdateStatus, onAddFile, onAddComment, onUpdateProject, onDeleteFile }) => {
    return (
        <div>
            <a href="/" className="inline-block mb-6 px-4 py-2 bg-gray-700 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">← ダッシュボードに戻る</a>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-start gap-8">
                
                <div className="flex flex-col gap-8">
                    <ProjectInfo project={project} onUpdateProject={onUpdateProject} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <StatusUpdater 
                            projectId={project.id}
                            currentStatus={project.status}
                            onUpdateStatus={onUpdateStatus}
                        />

                        <FileManager 
                            projectId={project.id}
                            files={project.files || []}
                            onAddFile={onAddFile}
                            onDeleteFile={onDeleteFile} // Pass the new prop
                        />
                    </div>
                </div>

                <CommentSection 
                    projectId={project.id}
                    comments={project.comments || []}
                    onAddComment={onAddComment}
                />
            </div>
        </div>
    );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { 
      projects, 
      error,
      addProject, 
      updateProject,
      updateProjectStatus, 
      addFileToProject, 
      addCommentToProject,
      deleteFileFromProject // Get the new function
  } = useProjects();
  const [locationHash, setLocationHash] = useState(window.location.hash);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem(AUTH_KEY);
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    const handleHashChange = () => {
        setLocationHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
        window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleLoginSuccess = useCallback(() => {
    sessionStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
  }, []);

  const handleAddProject = useCallback((newProjectData: Omit<Project, 'id' | 'status' | 'createdAt'>) => {
    addProject(newProjectData);
    window.location.hash = ''; // Navigate to dashboard
  }, [addProject]);
  
  const handleUpdateProject = useCallback((projectId: string, updatedData: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
      updateProject(projectId, updatedData);
  }, [updateProject]);

  const handleCancelNewProject = useCallback(() => {
    window.location.hash = ''; // Navigate to dashboard
  }, []);
  
  const renderContent = () => {
    if (locationHash.startsWith('#/project/')) {
        const projectId = locationHash.split('/')[2];
        const project = projects.find(p => p.id === projectId);
        if (project) {
            return <ProjectDetail 
                project={project} 
                onUpdateStatus={updateProjectStatus} 
                onAddFile={addFileToProject} 
                onAddComment={addCommentToProject}
                onUpdateProject={handleUpdateProject}
                onDeleteFile={deleteFileFromProject} // Pass the new function
            />;
        }
        return <div className="text-center"><p>案件が見つかりませんでした。</p><a href="/" className="text-black hover:underline hover:text-[#c3d825]">ダッシュボードに戻る</a></div>;
    }
    if (locationHash === '#/new') {
        return <NewProjectForm onAddProject={handleAddProject} onCancel={handleCancelNewProject} />;
    }
    return <Dashboard projects={projects} />;
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} correctPassword={SITE_PASSWORD} />;
  }
  
    if (error) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
                <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>

                <h2 className="text-2xl font-bold text-black">Supabaseへの接続に失敗しました</h2>
                <p className="text-gray-600">
                    アプリケーションはSupabaseサーバーと通信できませんでした。これは通常、コードの問題ではなく、
                    <strong>Supabaseプロジェクトの設定</strong>に原因があります。
                </p>
                
                <div className="text-left bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-2">トラブルシューティング・チェックリスト：</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
                        <li>
                            <strong>テーブルの存在とRLSポリシー:</strong>
                            <p className="pl-4 text-xs text-gray-500">
                                `projects`テーブルが作成され、Row Level Securityが有効になっているか、また適切なポリシーが設定されているか確認してください。
                            </p>
                        </li>
                         <li>
                            <strong>Supabase URLとAnonキー:</strong>
                             <p className="pl-4 text-xs text-gray-500">
                                `.env.local`ファイルに正しいSupabaseのURLと`anon`キーが設定されているか確認してください。
                            </p>
                        </li>
                        <li>
                            <strong>インターネット接続:</strong>
                            <p className="pl-4 text-xs text-gray-500">
                                お使いのデバイスがインターネットに接続されているか確認してください。
                            </p>
                        </li>
                    </ol>
                </div>
                
                <div className="pt-4">
                    <a
                        href="https://supabase.com/dashboard/project/jmedyquclllqoyoippwl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full sm:w-auto px-6 py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition-colors shadow"
                    >
                        1. Supabaseダッシュボードを確認する
                    </a>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 sm:mt-0 sm:ml-4 inline-block w-full sm:w-auto px-6 py-3 bg-gray-200 text-black font-semibold rounded-md hover:bg-gray-300 transition-colors"
                    >
                        2. 設定変更後に再試行
                    </button>
                </div>
                 <p className="text-xs text-gray-400 pt-4">エラー詳細: {error}</p>
            </div>
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-white text-black">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-black">
             <a href="/" className="transition-colors hover:text-[#c3d825]">チラシ進捗管理アプリ</a>
          </h1>
          {locationHash !== '#/new' && (
            <a
              href="#/new"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c3d825]"
            >
              新規案件登録
            </a>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;