import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as productApi from '../api/productApi';
import * as categoryApi from '../api/categoryApi';
import { getImageSrc } from '../utils/config';
import AdminVariantsModal from './AdminVariantsModal';

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
  const [currentProduct, setCurrentProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [multiFiles, setMultiFiles] = useState(null);
  const [multiPreviews, setMultiPreviews] = useState([]);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [reorderingImage, setReorderingImage] = useState(false);
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', categoryId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const prodRes = await productApi.getProductsApi(0, 100);
      setProducts(getArray(prodRes));
      const catRes = await categoryApi.getCategoriesApi();
      setCategories(getArray(catRes));
    } catch (error) { toast.error('\u8CC7\u6599\u8F09\u5165\u5931\u6557'); }
    finally { setLoading(false); }
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleMultiFilesChange = (e) => {
    const files = e.target.files;
    setMultiFiles(files);
    const previews = [];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setMultiPreviews([...previews]);
        }
      };
      reader.readAsDataURL(files[i]);
    }
  };

  const openAddModal = () => {
    setIsEditing(false); setCurrentId(null); setCurrentProduct(null);
    setImageFile(null); setImagePreview(null); setShowEditModal(true);
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: categories.length > 0 ? categories[0].id : '' });
  };
  const openEditModal = (p) => {
    setIsEditing(true); setCurrentId(p.id); setCurrentProduct(p);
    setImageFile(null); setImagePreview(null); setShowEditModal(true);
    setFormData({ name: p.name, description: p.description, price: p.price, stock: p.stock, categoryId: p.category?.id || p.categoryId || '' });
  };
  const openImageModal = (p) => {
    setIsEditing(true); setCurrentId(p.id); setCurrentProduct(p);
    setImageFile(null); setImagePreview(null); setShowImageModal(true);
    setFormData({ name: p.name, description: p.description, price: p.price, stock: p.stock, categoryId: p.category?.id || p.categoryId || '' });
  };
  const openVariantsModal = (p) => {
    setCurrentId(p.id); setCurrentProduct(p); setShowVariantsModal(true);
  };
  const openMultiImageModal = (p) => {
    setCurrentId(p.id); setCurrentProduct(p);
    setMultiFiles(null); setMultiPreviews([]); setShowMultiImageModal(true);
  };
  const closeModal = () => {
    setShowEditModal(false); setShowImageModal(false); setShowMultiImageModal(false); setShowVariantsModal(false);
    setImagePreview(null); setMultiPreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = { name: formData.name, description: formData.description, price: Number(formData.price), stock: Number(formData.stock), categoryId: Number(formData.categoryId) };
      if (isEditing) {
        await productApi.updateProductApi(currentId, productData, imageFile);
        toast.success(showImageModal ? '\u5716\u7247\u4E0A\u50B3\u6210\u529F' : '\u5546\u54C1\u66F4\u65B0\u6210\u529F');
      } else {
        await productApi.createProductApi(productData, imageFile);
        toast.success('\u5546\u54C1\u65B0\u589E\u6210\u529F');
      }
      closeModal(); fetchData();
    } catch (error) { toast.error('\u64CD\u4F5C\u5931\u6557'); }
  };

  const handleMultiUpload = async (e) => {
    e.preventDefault();
    if (!multiFiles || multiFiles.length === 0) { toast.error('\u8ACB\u9078\u64C7\u5716\u7247'); return; }
    try {
      await productApi.uploadProductImagesApi(currentId, multiFiles);
      toast.success(multiFiles.length + ' \u5F35\u5716\u7247\u4E0A\u50B3\u6210\u529F\uFF01');
      closeModal(); fetchData();
    } catch (error) { toast.error('\u591A\u5716\u4E0A\u50B3\u5931\u6557'); }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('\u78BA\u5B9A\u522A\u9664\u9019\u5F35\u5716\u7247\uFF1F')) return;
    setDeletingImageId(imageId);
    try {
      await productApi.deleteProductImageApi(imageId);
      toast.success('\u5716\u7247\u5DF2\u522A\u9664');
      // Refresh product data
      const res = await productApi.getProductByIdApi(currentId);
      const updated = res.data || res;
      setCurrentProduct(updated);
      fetchData();
    } catch (error) {
      toast.error('\u5716\u7247\u522A\u9664\u5931\u6557');
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleMoveImage = async (fromIndex, toIndex) => {
    if (!currentProduct?.imageIds || toIndex < 0 || toIndex >= currentProduct.imageIds.length) return;
    try {
      setReorderingImage(true);
      const newImageIds = [...currentProduct.imageIds];
      const [moved] = newImageIds.splice(fromIndex, 1);
      newImageIds.splice(toIndex, 0, moved);

      await productApi.reorderProductImagesApi(currentId, newImageIds);

      const res = await productApi.getProductByIdApi(currentId);
      const updated = res.data || res;
      setCurrentProduct(updated);
      fetchData();
      toast.success('\u5716\u7247\u9806\u5E8F\u5DF2\u66F4\u65B0');
    } catch (error) {
      toast.error('\u5716\u7247\u9806\u5E8F\u66F4\u65B0\u5931\u6557');
    } finally {
      setReorderingImage(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('\u78BA\u5B9A\u522A\u9664\uFF1F')) {
      try { await productApi.deleteProductApi(id); toast.success('\u5DF2\u522A\u9664'); fetchData(); }
      catch (error) { toast.error('\u522A\u9664\u5931\u6557'); }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex justify-between items-end border-b-2 border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{"\u5546\u54C1\u7BA1\u7406"}</h1>
            <p className="text-amber-600 tracking-widest text-sm">PRODUCT MANAGEMENT</p>
          </div>
          <button onClick={openAddModal} className="bg-slate-900 text-stone-50 px-6 py-2 font-bold hover:bg-amber-600">{"\u65B0\u589E\u5546\u54C1"}</button>
        </div>

        <div className="bg-white border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-stone-50 text-xs tracking-widest">
                <th className="p-4">{"\u5716\u7247"}</th><th className="p-4">{"\u540D\u7A31"}</th><th className="p-4">{"\u5206\u985E"}</th><th className="p-4">{"\u50F9\u683C"}</th><th className="p-4">{"\u5EAB\u5B58"}</th><th className="p-4">{"\u5716\u7247\u6578"}</th><th className="p-4">{"\u64CD\u4F5C"}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (<tr><td colSpan="7" className="p-8 text-center text-slate-400">{"\u5C1A\u7121\u5546\u54C1\u3001\u8ACB\u65B0\u589E\u5546\u54C1"}</td></tr>) : products.map((p, index) => (
                <tr key={p.id} className="border-b hover:bg-stone-50">
                  <td className="p-4">
                    <div className="w-16 h-16 bg-slate-200 rounded overflow-hidden">
                      {p.imageUrl ? <img src={getImageSrc(p.imageUrl)} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No IMG</div>}
                    </div>
                  </td>
                  <td className="p-4 font-bold">{p.name}</td>
                  <td className="p-4 text-sm">{p.categoryName || '\u7121'}</td>
                  <td className="p-4 font-bold text-amber-600">{"\u00A5"}{Number(p.price).toLocaleString()}</td>
                  <td className="p-4 text-sm">
                    {(p.stock ?? p.stockQuantity ?? 0) > 0 ? (
                      <span className="text-green-600 font-bold">{p.stock ?? p.stockQuantity ?? 0}</span>
                    ) : (
                      <span className="text-red-500 font-bold">{"\u5DF2\u552E\u7F44"}</span>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    <span className="bg-slate-100 px-2 py-1 text-xs font-bold rounded">
                      {p.imageUrls ? p.imageUrls.length : (p.imageUrl ? 1 : 0)} {"\u5F35"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 w-28">
                      <button onClick={()=>openEditModal(p)} className="text-xs py-1 bg-slate-100 border border-slate-300 font-bold rounded">{"\u4FEE\u6539"}</button>
                      <button onClick={()=>openImageModal(p)} className="text-xs py-1 bg-amber-50 border border-amber-300 text-amber-700 font-bold rounded">{"\u4E3B\u5716\u4E0A\u50B3"}</button>
                      <button onClick={()=>openMultiImageModal(p)} className="text-xs py-1 bg-blue-50 border border-blue-300 text-blue-700 font-bold rounded">{"\u5716\u7247\u7BA1\u7406"}</button>
                      <button onClick={()=>openVariantsModal(p)} className="text-xs py-1 bg-purple-50 border border-purple-300 text-purple-700 font-bold rounded">{"\u898F\u683C\u7BA1\u7406"}</button>
                      <button onClick={()=>handleDelete(p.id)} className="text-xs py-1 bg-red-50 border border-red-200 text-red-600 font-bold rounded">{"\u522A\u9664"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-lg overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex justify-between"><h2 className="font-bold">{isEditing ? '\u4FEE\u6539\u5546\u54C1' : '\u65B0\u589E\u5546\u54C1'}</h2><button onClick={closeModal} className="text-2xl">{"\u2715"}</button></div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder={"\u540D\u7A31"} required className="w-full p-2 border rounded"/>
                <input name="price" value={formData.price} onChange={handleInputChange} placeholder={"\u50F9\u683C"} type="number" required className="w-full p-2 border rounded"/>
                <input name="stock" value={formData.stock} onChange={handleInputChange} placeholder={"\u5EAB\u5B58"} type="number" required className="w-full p-2 border rounded"/>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="w-full p-2 border rounded">
                  <option value="">{"\u9078\u5206\u985E"}</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder={"\u63CF\u8FF0"} className="w-full p-2 border rounded"></textarea>
                <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded">{"\u53D6\u6D88"}</button><button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded font-bold">{"\u5132\u5B58"}</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Main Image Upload Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-lg overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex justify-between"><h2 className="font-bold">{"\u4E0A\u50B3\u4E3B\u5716"}</h2><button onClick={closeModal} className="text-2xl">{"\u2715"}</button></div>
              <form onSubmit={handleSubmit} className="p-6">
                {/* Current main image preview */}
                {currentProduct?.imageUrl && !imagePreview && (
                  <div className="mb-4">
                    <p className="text-xs text-stone-500 mb-2">{"\u76EE\u524D\u4E3B\u5716:"}</p>
                    <div className="w-32 h-32 border-2 border-slate-200 rounded-lg overflow-hidden">
                      <img src={getImageSrc(currentProduct.imageUrl)} className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {/* New image preview */}
                {imagePreview && (
                  <div className="mb-4">
                    <p className="text-xs text-green-600 mb-2">{"\u2713 \u65B0\u5716\u7247\u9810\u89BD:"}</p>
                    <div className="w-32 h-32 border-2 border-green-400 rounded-lg overflow-hidden">
                      <img src={imagePreview} className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageFileChange} required className="mb-2 w-full"/>
                <p className="text-xs text-amber-600 mb-4">{"\uD83D\uDCA1 \u5EFA\u8B70 1:1 \u6BD4\u4F8B (800x800px)\uFF0C\u4E0D\u8D85\u904E 2MB"}</p>
                <p className="text-xs text-stone-400 mb-4">{"\uD83D\uDCCC \u4E0A\u50B3\u5F8C\u6703\u8986\u84CB\u539F\u4F86\u7684\u4E3B\u5716\uFF0C\u5716\u7247\u5B58\u5132\u65BC Cloudinary \u96F2\u7AEF"}</p>
                <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded">{"\u53D6\u6D88"}</button><button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded font-bold">{"\u4E0A\u50B3"}</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Multi Image Management Modal */}
        {showMultiImageModal && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg">
              <div className="sticky top-0 bg-slate-900 text-white p-4 flex justify-between z-10">
                <h2 className="font-bold">{"\u5716\u7247\u7BA1\u7406"} - {currentProduct?.name}</h2>
                <button onClick={closeModal} className="text-2xl">{"\u2715"}</button>
              </div>
              <div className="p-6">
                {/* Existing Images */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-200">{"\uD83D\uDDBC\uFE0F \u5DF2\u4E0A\u50B3\u5716\u7247"}</h3>
                  {currentProduct?.imageUrls && currentProduct.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {currentProduct.imageUrls.map((url, idx) => {
                        const imageId = currentProduct.imageIds ? currentProduct.imageIds[idx] : null;
                        return (
                          <div key={idx} className="relative group">
                            <div className="aspect-square border-2 border-slate-200 rounded-lg overflow-hidden">
                              <img src={getImageSrc(url)} className="w-full h-full object-cover" />
                            </div>
                            {imageId && (
                              <>
                                <button
                                  onClick={() => handleDeleteImage(imageId)}
                                  disabled={deletingImageId === imageId || reorderingImage}
                                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 disabled:bg-stone-400"
                                >
                                  {deletingImageId === imageId ? "\u2026" : "\u2715"}
                                </button>

                                <div className="mt-2 flex justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, idx - 1)}
                                    disabled={idx === 0 || reorderingImage || deletingImageId === imageId}
                                    className="px-2 py-1 text-xs bg-slate-100 border border-slate-300 rounded disabled:opacity-40"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, idx + 1)}
                                    disabled={idx === currentProduct.imageUrls.length - 1 || reorderingImage || deletingImageId === imageId}
                                    className="px-2 py-1 text-xs bg-slate-100 border border-slate-300 rounded disabled:opacity-40"
                                  >
                                    ↓
                                  </button>
                                </div>
                              </>
                            )}
                            <p className="text-center text-xs text-stone-400 mt-1">#{idx + 1}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-stone-400 text-sm py-4 text-center">{"\u307E\u3060\u5716\u7247\u304C\u3042\u308A\u307E\u305B\u3093"}</p>
                  )}
                  {/* Show main image info */}
                  {currentProduct?.imageUrl && (
                    <p className="text-xs text-stone-400 mt-3">{"\uD83D\uDCCC \u4E3B\u5716: "}{currentProduct.imageUrl.substring(currentProduct.imageUrl.lastIndexOf('/') + 1).substring(0, 30)}...</p>
                  )}
                </div>

                {/* Upload New Images */}
                <form onSubmit={handleMultiUpload}>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-200">{"\u2795 \u65B0\u589E\u5716\u7247"}</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <input type="file" accept="image/*" multiple onChange={handleMultiFilesChange} required className="w-full"/>
                    <p className="text-xs text-blue-600 mt-2">{"\uD83D\uDCA1 \u53EF\u6309\u4F4F Ctrl/Cmd \u9078\u64C7\u591A\u5F35\u5716\u7247"}</p>
                  </div>

                  {/* Multi file previews */}
                  {multiPreviews.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-green-600 mb-2">{"\u2713 \u5DF2\u9078\u64C7 "}{multiPreviews.length}{" \u5F35\u5716\u7247:"}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {multiPreviews.map((preview, idx) => (
                          <div key={idx} className="aspect-square border-2 border-green-300 rounded-lg overflow-hidden">
                            <img src={preview} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded">{"\u95DC\u9589"}</button>
                    <button type="submit" disabled={!multiFiles || multiFiles.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white font-bold rounded disabled:bg-stone-300">{"\u78BA\u8A8D\u4E0A\u50B3"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminProductsPage;
