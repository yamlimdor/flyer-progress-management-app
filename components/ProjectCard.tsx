
import React from 'react';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case '修正指示あり':
        return 'bg-[#c3d825] text-black';
      default:
        return 'bg-gray-100 text-black';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-black break-words">{project.eventName}</h3>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(project.status)}`}
          >
            {project.status}
          </span>
        </div>
        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <p><strong>開催日:</strong> {formatDate(project.eventDate)} ({project.eventTime})</p>
          <p><strong>開催場所:</strong> {project.eventLocation}</p>
          <p><strong>印刷枚数:</strong> {project.printCount?.toLocaleString()}枚</p>
          <p><strong>希望納品日:</strong> {project.deliveryHopeDate ? formatDate(project.deliveryHopeDate) : '未定'}</p>
          {project.numberOfRecruits && (
            <p><strong>募集人数:</strong> {project.numberOfRecruits.toLocaleString()}人</p>
          )}
          {project.flyerNotNeeded && (
            <p><strong>チラシ:</strong> 不要</p>
          )}
          {project.notes && (
            <div className="pt-2">
              <p><strong>備考:</strong></p>
              <p className="whitespace-pre-wrap bg-gray-50 p-2 rounded-md">{project.notes}</p>
            </div>
          )}
        </div>
      </div>
       <p className="text-xs text-gray-400 mt-4 text-right">
        登録日: {project.createdAt.toLocaleDateString('ja-JP')}
      </p>
    </div>
  );
};

export default ProjectCard;
