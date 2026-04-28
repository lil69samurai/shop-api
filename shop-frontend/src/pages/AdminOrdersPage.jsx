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

const paymentMethodMap = {
  CREDIT_CARD: { label: "\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9", icon: "\uD83D\uDCB3" },
  BANK_TRANSFER: { label: "\u9280\u884C\u632F\u8FBC", icon: "\uD83C\uDFE6" },
  COD: { label: "\u4EE3\u91D1\u5F15\u63DB", icon: "\uD83D\uDE9A" },
  CONVENIENCE: { label: "\u30B3\u30F3\u30D3\u30CB\u6255\u3044", icon: "\uD83C\uDFEA" },
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
      toast.error('\u8A02\u55AE\u8F09\u5165\u5931\u6557');
    } finally { setLoading(false); }
  };

  const openModal = async (order) => {
    setDetailLoading(true);
    setSelectedOrder(order);
    try {
      const res = await orderApi.getOrderByIdApi(order.id);
      const detail = res?.data || res;
      setSelectedOrder(detail);
    } catch (error) {
      toast.error('\u7121\u6CD5\u8F09\u5165\u8A02\u55AE\u660E\u7D30');
    } finally { setDetailLoading(false); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success('\u72C0\u614B\u5DF2\u66F4\u65B0');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error('\u72C0\u614B\u66F4\u65B0\u5931\u6557');
    }
  };

  const payment = selectedOrder ? paymentMethodMap[selectedOrder.paymentMethod] : null;

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 border-b-2 border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-wider">{"\u8A02\u55AE\u7BA1\u7406"}</h1>
          <p className="mt-2 text-sm text-amber-600 font-medium tracking-widest">ORDER MANAGEMENT</p>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-stone-50 uppercase text-xs tracking-widest">
                <th className="p-4">ID</th>
                <th className="p-4">{"\u6703\u54E1"}</th>
                <th className="p-4">{"\u6536\u4EF6\u4EBA"}</th>
                <th className="p-4">{"\u65E5\u671F"}</th>
                <th className="p-4">{"\u4ED8\u6B3E\u65B9\u5F0F"}</th>
                <th className="p-4">{"\u7E3D\u91D1\u984D"}</th>
                <th className="p-4">{"\u72C0\u614B"}</th>
                <th className="p-4 text-center">{"\u64CD\u4F5C"}</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {orders.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">{"\u5C1A\u7121\u8A02\u55AE"}</td></tr>
              ) : (
                orders.map(o => {
                  const pm = paymentMethodMap[o.paymentMethod];
                  return (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-amber-50 transition-colors">
                      <td className="p-4 font-bold">#{o.id}</td>
                      <td className="p-4 text-sm">{o.username || 'N/A'}</td>
                      <td className="p-4 text-sm">{o.recipientName || '-'}</td>
                      <td className="p-4 text-sm">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="p-4 text-sm">{pm ? `${pm.icon} ${pm.label}` : (o.paymentMethod || '-')}</td>
                      <td className="p-4 font-bold text-amber-600">{"\u00A5"}{o.totalAmount}</td>
                      <td className="p-4">
                        <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                          className="text-xs font-bold px-2 py-1 border border-slate-300 outline-none">
                          <option value="PENDING">{"\u8655\u7406\u4E2D"}</option>
                          <option value="PAID">{"\u5DF2\u4ED8\u6B3E"}</option>
                          <option value="SHIPPED">{"\u5DF2\u51FA\u8CA8"}</option>
                          <option value="DELIVERED">{"\u5DF2\u9001\u9054"}</option>
                          <option value="COMPLETED">{"\u5DF2\u5B8C\u6210"}</option>
                          <option value="CANCELLED">{"\u5DF2\u53D6\u6D88"}</option>
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => openModal(o)} className="text-xs font-bold text-white bg-slate-800 px-4 py-2 hover:bg-amber-500 transition-colors">
                          {"\u8A73\u7D30\u3092\u898B\u308B"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              <div className="sticky top-0 bg-slate-900 text-stone-50 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-xl font-bold">{"\u8A02\u55AE\u660E\u7D30"} #{selectedOrder.id}</h2>
                  <p className="text-xs text-amber-400 mt-1">{"\u8A02\u8CFC\u4EBA"}: {selectedOrder.username || 'N/A'}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-white text-2xl">{"\u2715"}</button>
              </div>
              <div className="p-6">
                {detailLoading ? (
                  <p className="text-amber-600 text-sm animate-pulse">{"\u6B63\u5728\u8F09\u5165\u660E\u7D30..."}</p>
                ) : (
                  <>
                    {/* Shipping Info */}
                    {selectedOrder.recipientName && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">{"\uD83D\uDCE6 \u6536\u4EF6\u8CC7\u8A0A"}</h3>
                        <div className="bg-stone-50 rounded-lg p-4 space-y-1 text-sm">
                          <p><span className="text-stone-500">{"\u6536\u4EF6\u4EBA:"}</span> <span className="font-medium">{selectedOrder.recipientName}</span></p>
                          <p><span className="text-stone-500">{"\u96FB\u8A71:"}</span> <span className="font-medium">{selectedOrder.phone}</span></p>
                          <p><span className="text-stone-500">{"\u90F5\u905E\u5340\u865F:"}</span> <span className="font-medium">{selectedOrder.zipCode}</span></p>
                          <p><span className="text-stone-500">{"\u5730\u5740:"}</span> <span className="font-medium">{selectedOrder.address}</span></p>
                          {selectedOrder.note && <p><span className="text-stone-500">{"\u5099\u8A3B:"}</span> <span className="font-medium">{selectedOrder.note}</span></p>}
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    {payment && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">{"\uD83D\uDCB0 \u4ED8\u6B3E\u65B9\u5F0F"}</h3>
                        <div className="bg-stone-50 rounded-lg p-3 flex items-center gap-3">
                          <span className="text-2xl">{payment.icon}</span>
                          <span className="font-medium text-slate-800">{payment.label}</span>
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">{"\uD83D\uDED2 \u8CFC\u8CB7\u54C1\u9805"}</h3>
                    <div className="space-y-3">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 border border-slate-100">
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900">{item.productName || '\u672A\u77E5\u5546\u54C1'}</h4>
                              <p className="text-xs text-slate-500 mt-1">{"\u55AE\u50F9"}: {"\u00A5"}{item.priceAtPurchase}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold bg-amber-100 text-amber-800 px-2 py-1 inline-block mb-1">
                                {"\u6578\u91CF"}: {item.quantity} {"\u4EF6"}
                              </p>
                              <p className="text-base font-bold text-amber-600">{"\u00A5"}{item.subtotal}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm py-4 text-center">{"\u7121\u5546\u54C1\u660E\u7D30"}</p>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-slate-800 flex justify-between items-end">
                      <span className="font-bold text-slate-700">{"\u7E3D\u8A08"}</span>
                      <span className="text-2xl font-bold text-amber-600">{"\u00A5"}{selectedOrder.totalAmount}</span>
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
