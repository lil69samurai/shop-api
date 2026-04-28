import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as productApi from '../api/productApi';
import * as categoryApi from '../api/categoryApi';
import { getImageSrc } from '../utils/config';

const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.content && Array.isArray(res.content)) return res.content;
  if (res.data?.content) return res.data.content;
  if (res.data && Array.isArray(res.data)) return res.data;
  return [];
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMultiImageModal, setShowMultiImageModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [multiFiles, setMultiFiles] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', categoryId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const prodRes = await productApi.getProductsApi(0, 100);
      setProducts(getArray(prodRes));
      const catRes = await categoryApi.getCategoriesApi();
      setCategories(getArray(catRes));
    } catch (error) { toast.error('資料載入失敗'); }
    finally { setLoading(false); }
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openAddModal = () => {
    setIsEditing(false); setCurrentId(null); setImageFile(null); setShowEditModal(true);
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: categories.length > 0 ? categories[0].id : '' });
  };
  const openEditModal = (p) => {
    setIsEditing(true); setCurrentId(p.id); setImageFile(null); setShowEditModal(true);
    setFormData({ name: p.name, description: p.description, price: p.price, stock: p.stock, categoryId: p.category?.id || p.categoryId || '' });
  };
  const openImageModal = (p) => {
    setIsEditing(true); setCurrentId(p.id); setImageFile(null); setShowImageModal(true);
    setFormData({ name: p.name, description: p.description, price: p.price, stock: p.stock, categoryId: p.category?.id || p.categoryId || '' });
  };
  const openMultiImageModal = (p) => {
    setCurrentId(p.id); setMultiFiles(null); setShowMultiImageModal(true);
  };
  const closeModal = () => { setShowEditModal(false); setShowImageModal(false); setShowMultiImageModal(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = { name: formData.name, description: formData.description, price: Number(formData.price), stock: Number(formData.stock), categoryId: Number(formData.categoryId) };
      if (isEditing) {
        await productApi.updateProductApi(currentId, productData, imageFile);
        toast.success(showImageModal ? '圖片上傳成功' : '商品更新成功');
      } else {
        await productApi.createProductApi(productData, imageFile);
        toast.success('商品新增成功');
      }
      closeModal(); fetchData();
    } catch (error) { toast.error('操作失敗'); }
  };

  const handleMultiUpload = async (e) => {
    e.preventDefault();
    if (!multiFiles || multiFiles.length === 0) { toast.error('請選擇圖片'); return; }
    try {
      await productApi.uploadProductImagesApi(currentId, multiFiles);
      toast.success(multiFiles.length + ' 張圖片上傳成功！');
      closeModal(); fetchData();
    } catch (error) { toast.error('多圖上傳失敗'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('確定刪除？')) {
      try { await productApi.deleteProductApi(id); toast.success('已刪除'); fetchData(); }
      catch (error) { toast.error('刪除失敗'); }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex justify-between items-end border-b-2 border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">商品管理</h1>
            <p className="text-amber-600 tracking-widest text-sm">PRODUCT MANAGEMENT</p>
          </div>
          <button onClick={openAddModal} className="bg-slate-900 text-stone-50 px-6 py-2 font-bold hover:bg-amber-600">新增商品</button>
        </div>

        <div className="bg-white border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-stone-50 text-xs tracking-widest">
                <th className="p-4">圖片</th><th className="p-4">名稱</th><th className="p-4">分類</th><th className="p-4">價格</th><th className="p-4">圖片數</th><th className="p-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-stone-50">
                  <td className="p-4"><div className="w-16 h-16 bg-slate-200">{p.imageUrl && <img src={getImageSrc(p.imageUrl)} className="w-full h-full object-cover"/>}</div></td>
                  <td className="p-4 font-bold">{p.name}</td>
                  <td className="p-4 text-sm">{p.categoryName || '無'}</td>
                  <td className="p-4 font-bold text-amber-600">${p.price}</td>
                  <td className="p-4 text-sm">
                    <span className="bg-slate-100 px-2 py-1 text-xs font-bold">
                      {p.imageUrls ? p.imageUrls.length : (p.imageUrl ? 1 : 0)} 張
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 w-28">
                      <button onClick={()=>openEditModal(p)} className="text-xs py-1 bg-slate-100 border border-slate-300 font-bold">修改</button>
                      <button onClick={()=>openImageModal(p)} className="text-xs py-1 bg-amber-50 border border-amber-300 text-amber-700 font-bold">主圖上傳</button>
                      <button onClick={()=>openMultiImageModal(p)} className="text-xs py-1 bg-blue-50 border border-blue-300 text-blue-700 font-bold">多圖上傳</button>
                      <button onClick={()=>handleDelete(p.id)} className="text-xs py-1 bg-red-50 border border-red-200 text-red-600 font-bold">刪除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 編輯 Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-md">
              <div className="bg-slate-900 text-white p-4 flex justify-between"><h2 className="font-bold">{isEditing ? '修改商品' : '新增商品'}</h2><button onClick={closeModal} className="text-2xl">✕</button></div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="名稱" required className="w-full p-2 border"/>
                <input name="price" value={formData.price} onChange={handleInputChange} placeholder="價格" type="number" required className="w-full p-2 border"/>
                <input name="stock" value={formData.stock} onChange={handleInputChange} placeholder="庫存" type="number" required className="w-full p-2 border"/>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="w-full p-2 border">
                  <option value="">選分類</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="描述" className="w-full p-2 border"></textarea>
                <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-200">取消</button><button type="submit" className="px-4 py-2 bg-amber-600 text-white">儲存</button></div>
              </form>
            </div>
          </div>
        )}

        {/* 主圖上傳 Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-sm">
              <div className="bg-slate-900 text-white p-4 flex justify-between"><h2 className="font-bold">上傳主圖</h2><button onClick={closeModal} className="text-2xl">✕</button></div>
              <form onSubmit={handleSubmit} className="p-6">
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required className="mb-2 w-full"/>
                <p className="text-xs text-amber-600 mb-4">💡 建議 1:1 比例 (800x800px)，不超過 2MB</p>
                <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-200">取消</button><button type="submit" className="px-4 py-2 bg-amber-600 text-white">上傳</button></div>
              </form>
            </div>
          </div>
        )}

        {/* 多圖上傳 Modal */}
        {showMultiImageModal && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-md">
              <div className="bg-slate-900 text-white p-4 flex justify-between"><h2 className="font-bold">多圖上傳 (幻燈片)</h2><button onClick={closeModal} className="text-2xl">✕</button></div>
              <form onSubmit={handleMultiUpload} className="p-6">
                <div className="p-4 bg-blue-50 border border-blue-200 mb-4">
                  <p className="text-sm font-bold text-slate-800 mb-2">選擇多張圖片一次上傳</p>
                  <input type="file" accept="image/*" multiple onChange={e => setMultiFiles(e.target.files)} required className="w-full"/>
                  <p className="text-xs text-blue-600 mt-2">💡 可按住 Ctrl/Cmd 選擇多張圖片。上傳後會在商品詳情頁以幻燈片方式展示。</p>
                </div>
                {multiFiles && <p className="text-sm text-slate-600 mb-4">已選擇 <span className="font-bold text-amber-600">{multiFiles.length}</span> 張圖片</p>}
                <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-200">取消</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold">確認上傳</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminProductsPage;
