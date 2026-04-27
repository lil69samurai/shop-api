import React, { useState, useEffect } from 'react';
import * as categoryApi from '../api/categoryApi';

const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.content && Array.isArray(res.content)) return res.content;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data?.content && Array.isArray(res.data.content)) return res.data.content;
  return [];
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCat = async () => {
      try {
        const catCall = categoryApi.getAllCategoriesApi ? categoryApi.getAllCategoriesApi() : 
                       (categoryApi.getAllCategories ? categoryApi.getAllCategories() : null);
        if (catCall) {
          const res = await catCall;
          setCategories(getArray(res));
        }
      } catch(e){}
    };
    fetchCat();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900 border-b-2 border-slate-800 pb-4">分類管理</h1>
        <table className="w-full bg-white text-left border">
          <thead><tr className="bg-slate-900 text-white"><th className="p-4">ID</th><th className="p-4">名稱</th></tr></thead>
          <tbody>
            {categories.map(c => <tr key={c.id} className="border-b"><td className="p-4">#{c.id}</td><td className="p-4 font-bold">{c.name}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminCategoriesPage;
