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
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategoriesApi();
      setCategories(getArray(res));
    } catch (error) {
      toast.error('\u7121\u6CD5\u8F09\u5165\u5206\u985E');
    } finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAddModal = () => {
    setIsEditing(false); setCurrentId(null);
    setFormData({ name: '', code: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setIsEditing(true); setCurrentId(cat.id);
    setFormData({ name: cat.name, code: cat.code || '', description: cat.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const categoryData = {
      name: formData.name,
      code: formData.code.trim() || null,
      description: formData.description,
    };

    try {
      if (isEditing) {
        await categoryApi.updateCategoryApi(currentId, categoryData);
        toast.success('\u5206\u985E\u66F4\u65B0\u6210\u529F');
      } else {
        await categoryApi.createCategoryApi(categoryData);
        toast.success('\u5206\u985E\u65B0\u589E\u6210\u529F');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(isEditing ? '\u66F4\u65B0\u5931\u6557' : '\u65B0\u589E\u5931\u6557');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('\u78BA\u5B9A\u522A\u9664\uFF1F\u82E5\u5206\u985E\u4E0B\u6709\u5546\u54C1\u53EF\u80FD\u6703\u5931\u6557\u3002')) {
      try {
        await categoryApi.deleteCategoryApi(id);
        toast.success('\u5206\u985E\u5DF2\u522A\u9664');
        fetchCategories();
      } catch (error) {
        toast.error('\u522A\u9664\u5931\u6557');
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-wider">{"\u5206\u985E\u7BA1\u7406"}</h1>
            <p className="mt-2 text-sm text-amber-600 font-medium tracking-widest">CATEGORY MANAGEMENT</p>
          </div>
          <button onClick={openAddModal} className="bg-slate-900 text-stone-50 px-6 py-3 font-bold tracking-wider hover:bg-amber-600 transition-colors shadow-md">
            {"\u65B0\u589E\u5206\u985E"}
          </button>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-stone-50 uppercase text-xs tracking-widest">
                <th className="p-4 w-16">{"\u5E8F\u865F"}</th>
                <th className="p-4">{"\u5206\u985E\u540D\u7A31"}</th>
                <th className="p-4">Code</th>
                <th className="p-4">{"\u63CF\u8FF0"}</th>
                <th className="p-4 w-40 text-center">{"\u64CD\u4F5C"}</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {categories.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">{"\u5C1A\u7121\u5206\u985E\u8CC7\u6599"}</td></tr>
              ) : (
                categories.map((cat, index) => (
                  <tr key={cat.id} className="border-b border-slate-100 hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">#{index + 1}</td>
                    <td className="p-4 font-bold text-slate-900">{cat.name}</td>
                    <td className="p-4 text-sm font-mono text-slate-700">{cat.code || '-'}</td>
                    <td className="p-4 text-sm text-slate-500">{cat.description || '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(cat)}
                          className="text-xs font-bold px-4 py-1.5 bg-slate-200 text-slate-800 hover:bg-slate-300 rounded transition">{"\u7DE8\u8F2F"}</button>
                        <button onClick={() => handleDelete(cat.id)}
                          className="text-xs font-bold px-4 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded transition">{"\u522A\u9664"}</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md shadow-2xl rounded-lg overflow-hidden">
              <div className="bg-slate-900 text-stone-50 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">{isEditing ? '\u7DE8\u8F2F\u5206\u985E' : '\u65B0\u589E\u5206\u985E'}</h2>
                <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-white text-2xl">{"\u2715"}</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{"\u5206\u985E\u540D\u7A31"} <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                    className="w-full p-2.5 border border-slate-300 rounded focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-stone-50" placeholder={"\u4F8B\u5982\uFF1A\u7AF9\u528D\u3001\u5263\u9053\u670D..."} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Code</label>
                  <input type="text" name="code" value={formData.code} onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-stone-50 font-mono uppercase" placeholder={"例：BG。留空則自動生成"} />
                  <p className="mt-1 text-xs text-slate-400">分類代碼需唯一，未填時後端會自動生成。</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{"\u5206\u985E\u63CF\u8FF0"}</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"
                    className="w-full p-2.5 border border-slate-300 rounded focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-stone-50"></textarea>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded">{"\u53D6\u6D88"}</button>
                  <button type="submit" className="px-6 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded">{isEditing ? '\u5132\u5B58' : '\u65B0\u589E'}</button>
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
