import React, { useState, FormEvent } from 'react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  correctPassword?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, correctPassword = 'password' }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setError('');
      onLoginSuccess();
    } else {
      setError('パスワードが間違っています。');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-black">認証が必要です</h2>
        <p className="text-center text-gray-600">
          アプリケーションにアクセスするにはパスワードを入力してください。
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-[#c3d825] focus:border-[#c3d825]"
              placeholder="パスワード"
              required
            />
          </div>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c3d825]"
            >
              ログイン
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;