import React, { useState, useEffect, ChangeEvent } from 'react';
import type { Project } from '../types';
import { EVENT_NAMES } from '../lib/config';

interface ProjectInfoProps {
  project: Project;
  onUpdateProject: (projectId: string, updatedData: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({ project, onUpdateProject, onDeleteProject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);

  useEffect(() => {
    setEditedProject(project);
  }, [project]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;
    if (target.type === 'number') {
      setEditedProject(prev => ({ ...prev, [name]: target.valueAsNumber || 0 }));
    } else {
      setEditedProject(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditedProject(prev => {
      const newState = { ...prev, [name]: checked };
      if (name === 'flyerNotNeeded' && checked) {
        newState.status = '完了';
      }
      return newState;
    });
  };

  const handleSave = () => {
    const { eventName, eventDate, eventTime, eventLocation, printCount, deliveryHopeDate, notes, isUrgent, numberOfRecruits, flyerNotNeeded, status } = editedProject;
    onUpdateProject(project.id, { eventName, eventDate, eventTime, eventLocation, printCount, deliveryHopeDate, notes, isUrgent, numberOfRecruits, flyerNotNeeded, status });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  const confirmDelete = () => {
    onDeleteProject(project.id);
    setShowConfirmDelete(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <h2 className="text-2xl font-bold text-black">案件情報の編集</h2>
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-800">イベント名</label>
            <select name="eventName" id="eventName" value={editedProject.eventName} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]">
              <option value="">選択してください</option>
              {EVENT_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-800">開催日</label>
              <input type="date" name="eventDate" id="eventDate" value={editedProject.eventDate} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
            </div>
            <div>
              <label htmlFor="eventTime" className="block text-sm font-medium text-gray-800">開催時間</label>
              <input type="text" name="eventTime" id="eventTime" value={editedProject.eventTime} onChange={handleInputChange} placeholder="10:00-17:00" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
            </div>
          </div>
          <div>
            <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-800">開催場所</label>
            <input type="text" name="eventLocation" id="eventLocation" value={editedProject.eventLocation} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:focus:border-[#c3d825]" />
          </div>
          <div>
            <label htmlFor="numberOfRecruits" className="block text-sm font-medium text-gray-800">募集人数</label>
            <input type="number" name="numberOfRecruits" id="numberOfRecruits" value={editedProject.numberOfRecruits || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="printCount" className="block text-sm font-medium text-gray-800">印刷枚数</label>
              <input type="number" name="printCount" id="printCount" value={editedProject.printCount} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
            </div>
            <div>
              <label htmlFor="deliveryHopeDate" className="block text-sm font-medium text-gray-800">希望納品日</label>
              <input type="date" name="deliveryHopeDate" id="deliveryHopeDate" value={editedProject.deliveryHopeDate} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-800">備考</label>
            <textarea name="notes" id="notes" value={editedProject.notes} onChange={handleInputChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]"></textarea>
          </div>
          <div className="pt-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="isUrgent" name="isUrgent" type="checkbox" checked={editedProject.isUrgent} onChange={handleCheckboxChange} className="focus:ring-[#c3d825] h-4 w-4 text-[#c3d825] border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isUrgent" className="font-medium text-gray-800">早期納品を希望する (急ぎ案件)</label>
                <p className="text-gray-600">ダッシュボードで案件がハイライト表示されます。</p>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="flyerNotNeeded" name="flyerNotNeeded" type="checkbox" checked={editedProject.flyerNotNeeded} onChange={handleCheckboxChange} className="focus:ring-[#c3d825] h-4 w-4 text-[#c3d825] border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="flyerNotNeeded" className="font-medium text-gray-800">チラシ不要</label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors">キャンセル</button>
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">保存する</button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-start mb-6 gap-4">
            <h2 className="text-3xl font-bold text-black flex-1 break-words">{project.eventName}</h2>
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors border border-gray-300">編集</button>
            <button onClick={() => setShowConfirmDelete(true)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">削除</button>
          </div>
          {project.isUrgent && (
            <div className="mb-4 inline-flex items-center gap-2 bg-[#e2041b] text-white text-sm font-bold px-3 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <span>急ぎ案件</span>
            </div>
          )}
          <dl className="grid grid-cols-1 sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-4 text-lg">
            <dt className="font-semibold text-gray-600">開催日:</dt>
            <dd className="text-black">{project.eventDate}</dd>
            <dt className="font-semibold text-gray-600">開催時間:</dt>
            <dd className="text-black">{project.eventTime}</dd>
            <dt className="font-semibold text-gray-600">開催場所:</dt>
            <dd className="text-black">{project.eventLocation}</dd>
            <dt className="font-semibold text-gray-600">印刷枚数:</dt>
            <dd className="text-black">{project.printCount?.toLocaleString()}枚</dd>
            <dt className="font-semibold text-gray-600">希望納品日:</dt>
            <dd className="text-black">{project.deliveryHopeDate || '未定'}</dd>
            {project.numberOfRecruits && (
              <>
                <dt className="font-semibold text-gray-600">募集人数:</dt>
                <dd className="text-black">{project.numberOfRecruits.toLocaleString()}人</dd>
              </>
            )}
            {project.flyerNotNeeded && (
              <>
                <dt className="font-semibold text-gray-600">チラシ:</dt>
                <dd className="text-black">不要</dd>
              </>
            )}
          </dl>
          {project.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-lg text-gray-600">備考:</h3>
              <p className="text-lg text-black whitespace-pre-wrap mt-2">{project.notes}</p>
            </div>
          )}
        </>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <p className="text-lg font-semibold text-black mb-4">本当にこの案件を削除しますか？</p>
            <p className="text-sm text-gray-600 mb-6">この操作は元に戻せません。</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowConfirmDelete(false)} className="px-6 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors">キャンセル</button>
              <button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectInfo;
