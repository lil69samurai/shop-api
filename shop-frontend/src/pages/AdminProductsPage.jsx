import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi';
import { getImageSrc } from '../utils/config';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productApi.getAllProducts(),
        categoryApi.getAllCategories()
      ]);
      setProducts(prodRes.data || prodRes || []);
      setCategories(catRes.data || catRes || []);
    } catch (error) {
      toast.error('資料載入失敗');
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
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: categories.length > 0 ? categories[0].id : '' });
    setImageFile(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category?.id || product.categoryId || ''
    });
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 構建 FormData 以支援 Cloudinary 圖片上傳
      const submitData = new FormData();
      
      const productJson = JSON.stringify({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryId: Number(formData.categoryId)
      });
      submitData.append('product', new Blob([productJson], { type: 'application/json' }));
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (isEditing) {
        await productApi.updateProduct(currentId, submitData);
        toast.success('商品更新成功');
      } else {
        await productApi.createProduct(submitData);
        toast.success('商品新增成功');
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? '更新失敗' : '新增失敗');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除此商品嗎？')) {
      try {
        await productApi.deleteProduct(id);
        toast.success('商品已刪除');
        fetchData();
      } catch (error) {
        toast.error('刪除失敗');
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
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Add Button */}
        <div className="mb-10 border-b-2 border-slate-800 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-wider">
              商品管理
            </h1>
            <p className="mt-2 text-sm md:text-base text-amber-600 font-medium tracking-widest">
              商品管理 <span className="text-slate-400">| PRODUCT MANAGEMENT</span>
            </p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-slate-900 text-stone-50 px-6 py-3 font-bold tracking-wider hover:bg-amber-600 transition-colors shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            新增商品
          </button>
        </div>

        {/* Product Table */}
        <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-900 text-stone-50 uppercase text-xs tracking-widest">
                <th className="p-4 font-medium w-20">圖片</th>
                <th className="p-4 font-medium">商品名稱</th>
                <th className="p-4 font-medium">分類</th>
                <th className="p-4 font-medium">價格</th>
                <th className="p-4 font-medium">庫存</th>
                <th className="p-4 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">尚無商品資料</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                        {product.imageUrl ? (
                          <img src={getImageSrc(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400">無</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{product.name}</td>
                    <td className="p-4 text-sm">{product.category?.name || '無分類'}</td>
                    <td className="p-4 font-bold text-amber-600">${product.price}</td>
                    <td className="p-4 text-sm">{product.stock}</td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => openEditModal(product)} className="text-xs font-bold px-3 py-1 bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors">編輯</button>
                      <button onClick={() => handleDelete(product.id)} className="text-xs font-bold px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 transition-colors">刪除</button>
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
            <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
              <div className="sticky top-0 bg-slate-900 text-stone-50 p-6 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold tracking-wider">{isEditing ? '編輯商品' : '新增商品'}</h2>
                <button onClick={closeModal} className="text-stone-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">商品名稱</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none bg-stone-50" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">價格 (Price)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" className="w-full p-2 border border-slate-300 focus:border-amber-500 outline-none bg-stone-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">庫存 (Stock)</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" className="w-full p-2 border border-slate-300 focus:border-amber-500 outline-none bg-stone-50" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">分類 (Category)</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="w-full p-2 border border-slate-300 focus:border-amber-500 outline-none bg-stone-50">
                    <option value="" disabled>請選擇分類</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">商品描述</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-2 border border-slate-300 focus:border-amber-500 outline-none bg-stone-50"></textarea>
                </div>

                {/* 圖片上傳區塊（包含規格提醒） */}
                <div className="p-4 bg-amber-50 border border-amber-200">
                  <label className="block text-sm font-bold text-slate-900 mb-2">商品圖片上傳 (Cloudinary)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setImageFile(e.target.files[0])} 
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                  />
                  <p className="text-xs text-amber-700 mt-3 font-medium flex items-start">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    💡 建議上傳 1:1 比例之圖片 (如 800x800px)，檔案大小不超過 2MB，以維持前台版面美觀。
                  </p>
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

export default AdminProductsPage;
