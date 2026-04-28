import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as categoryApi from '../api/categoryApi';

const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.content && Array.isArray(res.content)) return res.content;
  if (res.data && Array.isArray(res.data)) return res.data;
  return [];
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategoriesApi();
      setCategories(getArray(res));
    } catch (error) {
      toast.error('無法載入分類');
    } finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAddModal = () => {
    setIsEditing(false); setCurrentId(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setIsEditing(true); setCurrentId(cat.id);
    setFormData({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await categoryApi.updateCategoryApi(currentId, formData);
        toast.success('分類更新成功');
      } else {
        await categoryApi.createCategoryApi(formData);
        toast.success('分類新增成功');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(isEditing ? '更新失敗' : '新增失敗');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('確定刪除？若分類下有商品可能會失敗。')) {
      try {
        await categoryApi.deleteCategoryApi(id);
        toast.success('分類已刪除');
        fetchCategories();
      } catch (error) {
        toast.error('刪除失敗');
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 border-b-2 border-slate-800 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-wider">分類管理</h1>
            <p className="mt-2 text-sm text-amber-600 font-medium tracking-widest">CATEGORY MANAGEMENT</p>
          </div>
          <button onClick={openAddModal} className="bg-slate-900 text-stone-50 px-6 py-3 font-bold tracking-wider hover:bg-amber-600 transition-colors shadow-md">
            新增分類
          </button>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-stone-50 uppercase text-xs tracking-widest">
                <th className="p-4 w-16">ID</th>
                <th className="p-4">分類名稱</th>
                <th className="p-4">描述</th>
                <th className="p-4 text-center w-32">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {categories.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">尚無分類資料</td></tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="border-b border-slate-100 hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">#{cat.id}</td>
                    <td className="p-4 font-bold text-slate-900">{cat.name}</td>
                    <td className="p-4 text-sm text-slate-500">{cat.description || '-'}</td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => openEditModal(cat)} className="text-xs font-bold px-3 py-1 bg-slate-200 text-slate-800 hover:bg-slate-300">編輯</button>
                      <button onClick={() => handleDelete(cat.id)} className="text-xs font-bold px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200">刪除</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 新增/編輯 Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md shadow-2xl">
              <div className="bg-slate-900 text-stone-50 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">{isEditing ? '編輯分類' : '新增分類'}</h2>
                <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-white text-2xl">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">分類名稱 <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                    className="w-full p-2 border border-slate-300 focus:border-amber-500 outline-none bg-stone-50" placeholder="例如：竹劍、劍道服..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">分類描述</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"
                    className="w-full p-2 border border-slate-300 focus:border-amber-500 outline-none bg-stone-50"></textarea>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-bold text-slate-600 bg-slate-200 hover:bg-slate-300">取消</button>
                  <button type="submit" className="px-6 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700">{isEditing ? '儲存' : '新增'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminCategoriesPage;
