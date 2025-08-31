import React from 'react';
import type { Project, ProjectStatus } from '../types';

interface DashboardProps {
  projects: Project[];
}

const getStatusPhase = (status: ProjectStatus): 1 | 2 | 3 | 4 | 5 | 6 | 7 => {
  switch (status) {
    case '未定':
    case '不要':
      return 1;
    case '依頼準備中':
      return 2;
    case '制作中':
      return 3;
    case '振興会確認中':
      return 4;
    case '修正指示あり':
      return 5;
    case '印刷・納品待ち':
      return 6;
    case '完了':
      return 7;
    default:
      return 1;
  }
};

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case '修正指示あり':
      return 'bg-[#c3d825] text-black';
    default:
      return 'bg-gray-100 text-black';
  }
};

const StatusButton: React.FC<{ status: ProjectStatus }> = ({ status }) => (
    <span className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap ${getStatusColor(status)}`}>
        {status}
    </span>
);

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  const navigateToProject = (id: string) => {
    window.location.hash = `#/project/${id}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  };

  const handleDownloadCsv = () => {
    if (!projects || projects.length === 0) {
      alert("出力する案件がありません。");
      return;
    }

    // Define headers - ensure all possible keys are included
    const headers = [
      "id", "eventName", "eventDate", "eventTime", "eventLocation",
      "printCount", "deliveryHopeDate", "notes", "status", "createdAt",
      "isUrgent", "files", "comments"
    ];

    // Create CSV rows
    const csvRows = projects.map(project => {
      return headers.map(header => {
        let value = project[header as keyof Project];
        if (header === "files" || header === "comments") {
          // Stringify arrays for CSV
          value = JSON.stringify(value || []);
        } else if (value instanceof Date) {
          // Format Date objects
          value = value.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (value === null || value === undefined) {
          value = '';
        }
        // Escape double quotes and wrap in double quotes if value contains comma or double quote
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Create a Blob and download link
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'projects.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6"> {/* Flex container for heading and button */}
        <h2 className="text-3xl font-bold text-black">案件一覧</h2>
        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          CSVダウンロード
        </button>
      </div>
      
      {/* Desktop Matrix View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-800 uppercase bg-gray-50 border-b">
            <tr>
              <th scope="col" className="px-6 py-3 font-bold min-w-[300px]">案件情報</th>
              <th scope="col" className="px-6 py-3 font-bold min-w-[160px]">① 未定・不要</th>
              <th scope="col" className="px-6 py-3 font-bold min-w-[160px]">② 依頼準備</th>
              <th scope="col" className="px-6 py-3 font-bold min-w-[160px]">③ 制作</th>
              <th scope="col" className="px-6 py-3 font-bold min-w-[160px]">④ 振興会確認</th>
              <th scope="col" className="px-6 py-3 font-bold min-w-[160px]">⑤ 修正指示</th>
              <th scope="col" className="px-6 py-3 font-bold min-w-[160px]">⑥ 印刷・納品</th>
              <th scope="col" className="px-6 py-3 font-bold min-w-[160px]">⑦ 完了</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => {
                const phase = getStatusPhase(project.status);
                return (
                  <tr 
                    key={project.id} 
                    className="bg-white border-b hover:bg-gray-100 transition-colors duration-150 cursor-pointer group"
                    onClick={() => navigateToProject(project.id)}
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && navigateToProject(project.id)}
                    aria-label={`案件「${project.eventName}」の詳細を見る`}
                  >
                    <td className="px-6 py-4 font-medium text-black">
                      <div className="flex items-center gap-3">
                         {project.isUrgent && (
                           <span className="px-2 py-0.5 text-xs rounded-full bg-[#e2041b] text-white font-bold" aria-label="急ぎ案件">急ぎ</span>
                         )}
                         <span className="font-bold text-base text-black group-hover:text-[#c3d825] transition-colors">{project.eventName}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 font-normal">
                        開催日: {formatDate(project.eventDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">{phase === 1 ? <StatusButton status={project.status} /> : null}</td>
                    <td className="px-6 py-4">{phase === 2 ? <StatusButton status={project.status} /> : null}</td>
                    <td className="px-6 py-4">{phase === 3 ? <StatusButton status={project.status} /> : null}</td>
                    <td className="px-6 py-4">{phase === 4 ? <StatusButton status={project.status} /> : null}</td>
                    <td className="px-6 py-4">{phase === 5 ? <StatusButton status={project.status} /> : null}</td>
                    <td className="px-6 py-4">{phase === 6 ? <StatusButton status={project.status} /> : null}</td>
                    <td className="px-6 py-4">{phase === 7 ? <StatusButton status={project.status} /> : null}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-16 px-6">
                  <p className="text-gray-600">現在登録されている案件はありません。</p>
                  <p className="mt-2 text-gray-600">「新規案件登録」ボタンから新しい案件を追加してください。</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow p-4 cursor-pointer active:bg-gray-200 transition-colors"
              onClick={() => navigateToProject(project.id)}
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && navigateToProject(project.id)}
              aria-label={`案件「${project.eventName}」の詳細を見る`}
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-black pr-2 break-words">
                  {project.isUrgent && <span className="px-2 py-0.5 text-xs rounded-full bg-[#e2041b] text-white font-bold mr-2" aria-label="急ぎ案件">急ぎ</span>}
                  {project.eventName}
                </h3>
                <div className="flex-shrink-0">
                    <StatusButton status={project.status} />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                開催日: {formatDate(project.eventDate)}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
              <p className="text-gray-600">現在登録されている案件はありません。</p>
              <p className="mt-2 text-gray-600">「新規案件登録」ボタンから新しい案件を追加してください。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
