import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as orderApi from '../api/orderApi';

const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.content && Array.isArray(res.content)) return res.content;
  if (res.data?.content && Array.isArray(res.data.content)) return res.data.content;
  if (res.data && Array.isArray(res.data)) return res.data;
  return [];
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAllOrdersApi();
      setOrders(getArray(res));
    } catch (error) {
      toast.error('訂單載入失敗');
    } finally { setLoading(false); }
  };

  const openModal = async (order) => {
    setDetailLoading(true);
    try {
      const res = await orderApi.getOrderByIdApi(order.id);
      const detail = res?.data || res;
      setSelectedOrder(detail);
    } catch (error) {
      toast.error('無法載入訂單明細，嘗試使用列表資料');
      setSelectedOrder(order);
    } finally { setDetailLoading(false); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success('狀態已更新');
      fetchOrders();
    } catch (error) {
      toast.error('狀態更新失敗');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 border-b-2 border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-wider">訂單管理</h1>
          <p className="mt-2 text-sm text-amber-600 font-medium tracking-widest">ORDER MANAGEMENT</p>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-stone-50 uppercase text-xs tracking-widest">
                <th className="p-4">ID</th>
                <th className="p-4">會員</th>
                <th className="p-4">日期</th>
                <th className="p-4">總金額</th>
                <th className="p-4">狀態</th>
                <th className="p-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {orders.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">尚無訂單</td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-amber-50 transition-colors">
                    <td className="p-4 font-bold">#{o.id}</td>
                    <td className="p-4 text-sm">{o.username || 'N/A'}</td>
                    <td className="p-4 text-sm">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="p-4 font-bold text-amber-600">${o.totalAmount}</td>
                    <td className="p-4">
                      <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                        className="text-xs font-bold px-2 py-1 border border-slate-300 outline-none">
                        <option value="PENDING">處理中</option>
                        <option value="SHIPPED">已出貨</option>
                        <option value="COMPLETED">已完成</option>
                        <option value="CANCELLED">已取消</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => openModal(o)} className="text-xs font-bold text-white bg-slate-800 px-4 py-2 hover:bg-amber-500 transition-colors">
                        詳細を見る
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 訂單明細 Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              <div className="sticky top-0 bg-slate-900 text-stone-50 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-xl font-bold">訂單明細 #{selectedOrder.id}</h2>
                  <p className="text-xs text-amber-400 mt-1">訂購人: {selectedOrder.username || 'N/A'}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-white text-2xl">✕</button>
              </div>
              <div className="p-6">
                {detailLoading ? (
                  <p className="text-amber-600 text-sm animate-pulse">正在載入明細...</p>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">購買品項 (Items)</h3>
                    <div className="space-y-3">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 border border-slate-100">
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900">{item.productName || '未知商品'}</h4>
                              <p className="text-xs text-slate-500 mt-1">單價: ${item.priceAtPurchase}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold bg-amber-100 text-amber-800 px-2 py-1 inline-block mb-1">
                                數量: {item.quantity} 件
                              </p>
                              <p className="text-base font-bold text-amber-600">${item.subtotal}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm py-4 text-center">無商品明細</p>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-slate-800 flex justify-between items-end">
                      <span className="font-bold text-slate-700">總計</span>
                      <span className="text-2xl font-bold text-amber-600">${selectedOrder.totalAmount}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminOrdersPage;
