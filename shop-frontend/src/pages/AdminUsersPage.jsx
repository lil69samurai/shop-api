import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as userApi from '../api/userApi';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      setUsers(response.data || response || []);
    } catch (error) {
      toast.error('無法載入會員列表');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 border-b-2 border-slate-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-wider">
              會員管理
            </h1>
            <p className="mt-2 text-sm md:text-base text-amber-600 font-medium tracking-widest">
              会員管理 <span className="text-slate-400">| USER MANAGEMENT</span>
            </p>
          </div>
          <div className="bg-slate-900 text-stone-50 px-4 py-2 font-bold tracking-widest shadow-md">
            總會員數: <span className="text-amber-500 text-lg">{users.length}</span>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-900 text-stone-50 uppercase text-xs tracking-widest">
                <th className="p-4 font-medium w-16">ID</th>
                <th className="p-4 font-medium">帳號 (Username)</th>
                <th className="p-4 font-medium">電子郵件 (Email)</th>
                <th className="p-4 font-medium">角色 (Role)</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">尚無會員資料</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">#{user.id}</td>
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                        {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                      </div>
                      {user.username}
                    </td>
                    <td className="p-4 text-sm font-medium">{user.email}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wider ${
                        user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role || 'USER'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminUsersPage;
