import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as orderApi from '../api/orderApi';
import { getImageSrc } from '../utils/config';

const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.content && Array.isArray(res.content)) return res.content;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data?.content && Array.isArray(res.data.content)) return res.data.content;
  return [];
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAllOrdersApi();
      setOrders(getArray(res));
    } catch (error) { toast.error('載入失敗'); } finally { setLoading(false); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (orderApi.updateOrderStatus) {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success('狀態已更新'); fetchOrders();
    }
  };

  const openModal = async (order) => {
    setSelectedOrder(order);
    try {
      const res = await orderApi.getOrderByIdApi(order.id);
      if (res) setSelectedOrder(res.data || res);
    } catch (e) {}
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 border-b-2 border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-slate-900">訂單管理</h1>
        </div>
        <div className="bg-white border border-slate-200 overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-slate-900 text-stone-50 text-xs"><th className="p-4">ID</th><th className="p-4">總金額</th><th className="p-4">狀態</th><th className="p-4">操作</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b"><td className="p-4">#{o.id}</td><td className="p-4 font-bold text-amber-600">${o.totalAmount}</td>
                  <td className="p-4">
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)} className="p-1 border">
                      <option value="PENDING">處理中</option><option value="SHIPPED">已出貨</option><option value="COMPLETED">已完成</option>
                    </select>
                  </td>
                  <td className="p-4"><button onClick={()=>openModal(o)} className="bg-slate-800 text-white px-3 py-1 text-xs">詳細</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl p-6 relative max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between border-b pb-4 mb-4"><h2 className="text-xl font-bold">訂單 #{selectedOrder.id}</h2><button onClick={()=>setSelectedOrder(null)}>✕</button></div>
              {getArray(selectedOrder.orderItems).map((item, idx) => (
                <div key={idx} className="flex gap-4 p-2 border-b">
                  <div className="w-16 h-16 bg-slate-200">{item.product?.imageUrl && <img src={getImageSrc(item.product.imageUrl)} className="w-full h-full object-cover"/>}</div>
                  <div><h4 className="font-bold">{item.product?.name}</h4><p className="text-sm">單價: ${item.price} x {item.quantity}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminOrdersPage;
