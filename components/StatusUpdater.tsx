import React, { useState, useEffect } from 'react';
import type { ProjectStatus } from '../types';

interface StatusUpdaterProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

const StatusUpdater: React.FC<StatusUpdaterProps> = ({ projectId, currentStatus, onUpdateStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(currentStatus);
  const availableStatuses: ProjectStatus[] = ['未定', '依頼準備中', '制作中', '振興会確認中', '修正指示あり', '印刷・納品待ち', '完了'];

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusUpdate = () => {
    if (selectedStatus !== currentStatus) {
      onUpdateStatus(projectId, selectedStatus);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-black mb-4">ステータス更新</h3>
      <div className="flex items-center gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus)}
          className="flex-grow block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]"
        >
          {availableStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button
          onClick={handleStatusUpdate}
          disabled={selectedStatus === currentStatus}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          更新
        </button>
      </div>
    </div>
  );
};

export default StatusUpdater;
