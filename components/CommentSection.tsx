import React, { useState, useEffect, FormEvent } from 'react';
import type { Comment, UserRole } from '../types';

const USER_NAME_KEY = 'flyer-app-user-name';
const USER_ROLE_KEY = 'flyer-app-user-role';
const FONT_SIZE_KEY = 'flyer-app-font-size';

type FontSize = 'sm' | 'base' | 'lg';

interface CommentSectionProps {
  projectId: string;
  comments: Comment[];
  onAddComment: (projectId: string, commentText: string, userName: string, role: UserRole) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ projectId, comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [commentFontSize, setCommentFontSize] = useState<FontSize>('base');
  
  useEffect(() => {
    const savedName = localStorage.getItem(USER_NAME_KEY);
    const savedRole = localStorage.getItem(USER_ROLE_KEY) as UserRole;
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) as FontSize;
    if (savedName) setUserName(savedName);
    if (savedRole) setUserRole(savedRole);
    if (savedFontSize && ['sm', 'base', 'lg'].includes(savedFontSize)) {
      setCommentFontSize(savedFontSize);
    }
  }, []);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  };

  const handleFontSizeChange = (size: FontSize) => {
    setCommentFontSize(size);
    localStorage.setItem(FONT_SIZE_KEY, size);
  };

  const fontSizeClasses: { [key in FontSize]: string } = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  };

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem(USER_ROLE_KEY, role);
  };

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && userName.trim() && userRole) {
      onAddComment(projectId, newComment.trim(), userName.trim(), userRole);
      localStorage.setItem(USER_NAME_KEY, userName.trim());
      setNewComment('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[500px] lg:min-h-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">コメント</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600" aria-hidden="true">文字サイズ:</span>
          <button onClick={() => handleFontSizeChange('sm')} aria-label="フォントサイズを小にする" className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${commentFontSize === 'sm' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}>小</button>
          <button onClick={() => handleFontSizeChange('base')} aria-label="フォントサイズを中にする" className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${commentFontSize === 'base' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}>中</button>
          <button onClick={() => handleFontSizeChange('lg')} aria-label="フォントサイズを大にする" className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${commentFontSize === 'lg' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}>大</button>
        </div>
      </div>

      {!userRole ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <h4 className="text-lg font-semibold text-black">あなたの立場を選択してください</h4>
          <p className="text-gray-600 mt-2 mb-6">コメントの表示が最適化されます。</p>
          <div className="flex gap-4">
            <button onClick={() => handleRoleSelect('company')} className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">振興会</button>
            <button onClick={() => handleRoleSelect('agency')} className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors">山陽PR</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-grow space-y-6 overflow-y-auto pr-2 mb-4">
            {comments && comments.length > 0 ? (
              comments.map(comment => {
                const isMyComment = comment.role === userRole;
                return (
                  <div key={comment.id} className={`flex ${isMyComment ? 'justify-start' : 'justify-end'}`}>
                    <div className="max-w-xl">
                      <div className={`mb-1 text-xs text-gray-600 ${isMyComment ? 'text-left' : 'text-right'}`}>
                        <span className="font-semibold text-gray-800">{comment.userName} さん</span>
                        <span className="ml-2 pl-2 border-l border-gray-300">{formatDate(comment.timestamp)}</span>
                      </div>
                      <div className={`inline-block p-3 rounded-lg ${fontSizeClasses[commentFontSize]} ${isMyComment ? 'bg-gray-100 text-black' : 'bg-[#c3d825] text-black'}`}>
                        <p className="whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-600">まだコメントはありません。</p>
              </div>
            )}
          </div>
          <form onSubmit={handleCommentSubmit} className="mt-auto pt-4 border-t border-gray-200 space-y-2">
            <div>
              <label htmlFor="userName" className="sr-only">お名前</label>
              <input id="userName" type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="お名前" required className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
            </div>
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="修正指示や連絡事項を入力..." rows={3} required className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]" />
            <button type="submit" className="w-full mt-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">送信</button>
          </form>
        </>
      )}
    </div>
  );
};

export default CommentSection;