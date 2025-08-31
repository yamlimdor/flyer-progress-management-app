import React, { ChangeEvent } from 'react';
import type { ProjectFile as FileData } from '../types';

interface FileManagerProps {
  projectId: string;
  files: FileData[];
  onAddFile: (projectId: string, file: File) => void;
  onDeleteFile: (projectId: string, fileName: string) => void; // New prop
}

const FileManager: React.FC<FileManagerProps> = ({ projectId, files, onAddFile, onDeleteFile }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddFile(projectId, e.target.files[0]);
      e.target.value = '';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-black mb-4">ファイル管理</h3>
      <div className="mb-4">
        <label htmlFor="file-upload" className="w-full cursor-pointer px-4 py-2 text-center bg-gray-100 text-black rounded-md hover:bg-gray-200 transition-colors border border-dashed border-gray-300 block">
          ファイルをアップロード
        </label>
        <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
      </div>
      <ul className="space-y-3">
        {files && files.length > 0 ? (
          files.map((file, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
              <div>
                <a href={file.url} download={file.name} className="font-medium text-black hover:underline hover:text-[#c3d825]">{file.name}</a>
                <p className="text-xs text-gray-600 mt-1">アップロード日時: {formatDate(file.uploadedAt)}</p>
              </div>
              <div className="flex items-center gap-2"> {/* Added a div to group download and delete buttons */}
                <a href={file.url} download={file.name} className="text-gray-400 hover:text-[#c3d825]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </a>
                <button
                  onClick={() => onDeleteFile(projectId, file.name)}
                  className="text-gray-400 hover:text-red-600" // Using red for delete action
                  aria-label={`Delete ${file.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm-1 3a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-600 text-center py-4">アップロードされたファイルはありません。</p>
        )}
      </ul>
    </div>
  );
};

export default FileManager;
