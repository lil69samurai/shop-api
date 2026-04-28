import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as userApi from '../api/userApi';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      const data = response.data || response;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('無法載入會員列表');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('密碼至少需 6 個字元');
      return;
    }
    try {
      await userApi.resetUserPassword(resetModal.id, newPassword);
      toast.success('密碼已重設: ' + resetModal.username);
      setResetModal(null);
      setNewPassword('');
    } catch (error) {
      toast.error('重設失敗');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 border-b-2 border-slate-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-wider">會員管理</h1>
            <p className="mt-2 text-sm text-amber-600 font-medium tracking-widest">USER MANAGEMENT</p>
          </div>
          <div className="bg-slate-900 text-stone-50 px-4 py-2 font-bold shadow-md">
            總會員數: <span className="text-amber-500 text-lg">{users.length}</span>
          </div>
        </div>

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-sm text-amber-700">
          💡 密碼為加密儲存 (BCrypt)，管理員無法查看原始密碼。若會員忘記密碼，請點擊「重設密碼」為其設定新密碼。
        </div>

        <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-stone-50 uppercase text-xs tracking-widest">
                <th className="p-4 w-16">ID</th>
                <th className="p-4">帳號</th>
                <th className="p-4">Email</th>
                <th className="p-4">角色</th>
                <th className="p-4">註冊時間</th>
                <th className="p-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-bold text-slate-400">#{user.id}</td>
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm">
                      {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    {user.username}
                  </td>
                  <td className="p-4 text-sm">{user.email}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wider ${
                      user.role === 'ROLE_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => { setResetModal(user); setNewPassword(''); }}
                      className="text-xs font-bold px-3 py-1 bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100">
                      重設密碼
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 重設密碼 Modal */}
        {resetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm shadow-2xl">
              <div className="bg-slate-900 text-stone-50 p-6 flex justify-between items-center">
                <h2 className="text-lg font-bold">重設密碼</h2>
                <button onClick={() => setResetModal(null)} className="text-stone-400 hover:text-white text-2xl">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600">
                  為 <span className="font-bold text-slate-900">{resetModal.username}</span> ({resetModal.email}) 設定新密碼：
                </p>
                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="輸入新密碼 (至少6碼)" className="w-full p-2 border border-slate-300 outline-none bg-stone-50 focus:border-amber-500" />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setResetModal(null)} className="px-4 py-2 font-bold bg-slate-200 text-slate-600 hover:bg-slate-300">取消</button>
                  <button onClick={handleResetPassword} className="px-4 py-2 font-bold bg-amber-600 text-white hover:bg-amber-700">確認重設</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminUsersPage;
