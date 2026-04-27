import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as productApi from '../api/productApi';
import * as categoryApi from '../api/categoryApi';
import { getImageSrc } from '../utils/config';

// 終極防呆：強制抽出陣列
const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.content && Array.isArray(res.content)) return res.content;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data?.content && Array.isArray(res.data.content)) return res.data.content;
  return [];
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', categoryId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 安全呼叫商品
      const prodRes = await productApi.getProductsApi(0, 100);
      setProducts(getArray(prodRes));

      // 安全呼叫分類 (相容不同命名)
      const catCall = categoryApi.getAllCategoriesApi ? categoryApi.getAllCategoriesApi() : 
                      (categoryApi.getAllCategories ? categoryApi.getAllCategories() : null);
      if (catCall) {
        const catRes = await catCall;
        setCategories(getArray(catRes));
      }
    } catch (error) {
      toast.error('資料載入失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openAddModal = () => {
    setIsEditing(false); setCurrentId(null); setImageFile(null); setShowEditModal(true);
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: categories.length > 0 ? categories[0].id : '' });
  };

  const openEditModal = (product) => {
    setIsEditing(true); setCurrentId(product.id); setImageFile(null); setShowEditModal(true);
    setFormData({ name: product.name, description: product.description, price: product.price, stock: product.stock, categoryId: product.category?.id || product.categoryId || '' });
  };

  const openImageModal = (product) => {
    setIsEditing(true); setCurrentId(product.id); setImageFile(null); setShowImageModal(true);
    setFormData({ name: product.name, description: product.description, price: product.price, stock: product.stock, categoryId: product.category?.id || product.categoryId || '' });
  };

  const closeModal = () => { setShowEditModal(false); setShowImageModal(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name, description: formData.description,
        price: Number(formData.price), stock: Number(formData.stock),
        categoryId: Number(formData.categoryId)
      };

      if (isEditing) {
        await productApi.updateProductApi(currentId, productData, imageFile);
        toast.success(showImageModal ? '圖片上傳成功' : '商品更新成功');
      } else {
        await productApi.createProductApi(productData, imageFile);
        toast.success('商品新增成功');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除嗎？')) {
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
                <th className="p-4">圖片</th><th className="p-4">名稱</th><th className="p-4">分類</th><th className="p-4">價格</th><th className="p-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-stone-50">
                  <td className="p-4"><div className="w-16 h-16 bg-slate-200">{p.imageUrl && <img src={getImageSrc(p.imageUrl)} className="w-full h-full object-cover"/>}</div></td>
                  <td className="p-4 font-bold">{p.name}</td>
                  <td className="p-4">{p.category?.name || '無'}</td>
                  <td className="p-4 font-bold text-amber-600">${p.price}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 w-24">
                      <button onClick={()=>openEditModal(p)} className="text-xs py-1 bg-slate-100 border border-slate-300">修改</button>
                      <button onClick={()=>openImageModal(p)} className="text-xs py-1 bg-amber-50 border border-amber-300 text-amber-700">圖片</button>
                      <button onClick={()=>handleDelete(p.id)} className="text-xs py-1 bg-red-50 border border-red-200 text-red-600">刪除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal 區塊保持簡易 */}
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-md p-6 relative">
              <h2 className="text-xl font-bold mb-4">{isEditing ? '修改商品' : '新增商品'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
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

        {showImageModal && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-sm p-6">
              <h2 className="text-xl font-bold mb-4">上傳圖片</h2>
              <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required className="mb-4"/>
                <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-200">取消</button><button type="submit" className="px-4 py-2 bg-amber-600 text-white">上傳</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminProductsPage;
