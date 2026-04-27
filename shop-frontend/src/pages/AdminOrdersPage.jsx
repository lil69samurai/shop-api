import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import orderApi from '../api/orderApi';
import { getImageSrc } from '../utils/config';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getAllOrders();
      setOrders(response.data || response || []);
    } catch (error) {
      toast.error('無法載入訂單列表');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (orderApi.updateOrderStatus) {
        await orderApi.updateOrderStatus(orderId, newStatus);
        toast.success('訂單狀態已更新');
        fetchOrders();
      }
    } catch (error) {
      toast.error('狀態更新失敗');
    }
  };

  const openModal = async (order) => {
    setSelectedOrder(order); // 先顯示基本資訊
    setFetchingDetail(true);
    try {
      // 嘗試抓取完整的訂單明細
      if (typeof orderApi.getOrderById === 'function') {
        const res = await orderApi.getOrderById(order.id);
        if (res && (res.data || res.id)) {
          setSelectedOrder(res.data || res);
        }
      }
    } catch (error) {
      console.log('無法抓取單一訂單明細，使用列表資料');
    } finally {
      setFetchingDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 border-b-2 border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-wider">訂單管理</h1>
          <p className="mt-2 text-sm text-amber-600 font-medium tracking-widest">ORDER MANAGEMENT</p>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-stone-50 uppercase text-xs tracking-widest">
                <th className="p-4 font-medium">訂單 ID</th>
                <th className="p-4 font-medium">日期</th>
                <th className="p-4 font-medium">總金額</th>
                <th className="p-4 font-medium">狀態</th>
                <th className="p-4 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-amber-50">
                  <td className="p-4 font-bold">#{order.id}</td>
                  <td className="p-4 text-sm">{new Date(order.createdAt || order.orderDate).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-amber-600">${order.totalAmount}</td>
                  <td className="p-4">
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs font-bold px-2 py-1 rounded outline-none border border-slate-300">
                      <option value="PENDING">處理中</option>
                      <option value="SHIPPED">已出貨</option>
                      <option value="COMPLETED">已完成</option>
                      <option value="CANCELLED">已取消</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => openModal(order)} className="text-xs font-bold text-white bg-slate-800 px-4 py-2 hover:bg-amber-500 transition-colors">
                      詳細を見る
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 訂單明細 Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
              <div className="sticky top-0 bg-slate-900 text-stone-50 p-6 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold tracking-wider">訂單明細 #{selectedOrder.id}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-white">✕</button>
              </div>
              <div className="p-6">
                {fetchingDetail && <p className="text-amber-600 text-sm mb-4 animate-pulse">正在載入商品明細...</p>}
                
                <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">購買品項</h3>
                <div className="space-y-4">
                  {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                    selectedOrder.orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-stone-50 border border-slate-100">
                        <div className="w-16 h-16 bg-slate-200 flex-shrink-0">
                          {item.product?.imageUrl ? <img src={getImageSrc(item.product.imageUrl)} alt="img" className="w-full h-full object-cover" /> : null}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{item.product?.name || '未知商品'}</h4>
                          <p className="text-xs text-slate-500 mt-1">單價: ${item.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-700 bg-amber-100 px-2 py-1 inline-block mb-1">數量: {item.quantity} 件</p>
                          <p className="text-base font-bold text-amber-600">${item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm py-2">後端未提供商品明細陣列。</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
