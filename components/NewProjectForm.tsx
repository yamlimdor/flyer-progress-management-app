import React, { useState, FormEvent } from 'react';
import type { Project } from '../types';

interface NewProjectFormProps {
  onAddProject: (projectData: Omit<Project, 'id' | 'status' | 'createdAt'>) => void;
  onCancel: () => void;
}

const NewProjectForm: React.FC<NewProjectFormProps> = ({ onAddProject, onCancel }) => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [printCount, setPrintCount] = useState<number | ''>('');
  const [deliveryHopeDate, setDeliveryHopeDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventDate || !deliveryHopeDate || printCount === '') return;

    onAddProject({
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      printCount: Number(printCount),
      deliveryHopeDate,
      notes,
      isUrgent,
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-black">新規案件登録</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="eventName" className="block text-sm font-medium text-gray-800">イベント名</label>
          <input type="text" id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-800">開催日</label>
            <input type="date" id="eventDate" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
          </div>
          <div>
            <label htmlFor="eventTime" className="block text-sm font-medium text-gray-800">開催時間 (例: 10:00-17:00)</label>
            <input type="text" id="eventTime" value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="10:00-17:00" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
          </div>
        </div>

        <div>
          <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-800">開催場所</label>
          <input type="text" id="eventLocation" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="printCount" className="block text-sm font-medium text-gray-800">印刷枚数</label>
            <input type="number" id="printCount" value={printCount} onChange={(e) => setPrintCount(e.target.value === '' ? '' : parseInt(e.target.value))} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
          </div>
          <div>
            <label htmlFor="deliveryHopeDate" className="block text-sm font-medium text-gray-800">希望納品日</label>
            <input type="date" id="deliveryHopeDate" value={deliveryHopeDate} onChange={(e) => setDeliveryHopeDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-800">備考</label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]"></textarea>
        </div>

        <div className="pt-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isUrgent"
                  name="isUrgent"
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="focus:ring-[#c3d825] h-4 w-4 text-[#c3d825] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isUrgent" className="font-medium text-gray-800">
                  早期納品を希望する (急ぎ案件)
                </label>
                <p className="text-gray-600">ダッシュボードで案件がハイライト表示されます。</p>
              </div>
            </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors">
            キャンセル
          </button>
          <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
            登録する
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectForm;