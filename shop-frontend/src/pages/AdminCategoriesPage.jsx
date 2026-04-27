import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as categoryApi from '../api/categoryApi';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAllCategories();
      setCategories(response.data || response || []);
    } catch (error) {
      toast.error('無法載入分類列表');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await categoryApi.updateCategory(currentId, formData);
        toast.success('分類更新成功');
      } else {
        await categoryApi.createCategory(formData);
        toast.success('分類新增成功');
      }
      closeModal();
      fetchCategories();
    } catch (error) {
      toast.error(isEditing ? '更新失敗' : '新增失敗');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除此分類嗎？（警告：若該分類下有商品可能會刪除失敗）')) {
      try {
        await categoryApi.deleteCategory(id);
        toast.success('分類已刪除');
        fetchCategories();
      } catch (error) {
        toast.error('刪除失敗，請確認該分類下是否還有商品');
      }
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
      <div className="max-w-4xl mx-auto">
        
        {/* Header & Add Button */}
        <div className="mb-10 border-b-2 border-slate-800 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-wider">
              分類管理
            </h1>
            <p className="mt-2 text-sm md:text-base text-amber-600 font-medium tracking-widest">
              カテゴリ管理 <span className="text-slate-400">| CATEGORY MANAGEMENT</span>
            </p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-slate-900 text-stone-50 px-6 py-3 font-bold tracking-wider hover:bg-amber-600 transition-colors shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            新增分類
          </button>
        </div>

        {/* Category Table */}
        <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-stone-50 uppercase text-xs tracking-widest">
                <th className="p-4 font-medium w-16">ID</th>
                <th className="p-4 font-medium">分類名稱</th>
                <th className="p-4 font-medium">描述</th>
                <th className="p-4 font-medium text-center w-32">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">尚無分類資料</td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-b border-slate-100 hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">#{category.id}</td>
                    <td className="p-4 font-bold text-slate-900">{category.name}</td>
                    <td className="p-4 text-sm text-slate-500">{category.description || '-'}</td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => openEditModal(category)} className="text-xs font-bold px-3 py-1 bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors">編輯</button>
                      <button onClick={() => handleDelete(category.id)} className="text-xs font-bold px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 transition-colors">刪除</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md shadow-2xl relative flex flex-col">
              <div className="bg-slate-900 text-stone-50 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-wider">{isEditing ? '編輯分類' : '新增分類'}</h2>
                <button onClick={closeModal} className="text-stone-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">分類名稱 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full p-2 border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none bg-stone-50" 
                    placeholder="例如：劍道服、竹劍..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">分類描述</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows="3" 
                    className="w-full p-2 border border-slate-300 focus:border-amber-500 outline-none bg-stone-50"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                  <button type="button" onClick={closeModal} className="px-4 py-2 font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors">取消</button>
                  <button type="submit" className="px-6 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors">{isEditing ? '儲存變更' : '確認新增'}</button>
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
