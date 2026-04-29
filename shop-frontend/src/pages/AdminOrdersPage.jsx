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

const STATUS_CONFIG = {
  PENDING:   { label: "處理中",   color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: "⏳", next: ["PAID", "CANCELLED"] },
  PAID:      { label: "已付款",   color: "bg-blue-100 text-blue-800 border-blue-300",       icon: "💳", next: ["SHIPPED", "CANCELLED"] },
  SHIPPED:   { label: "已出貨",   color: "bg-indigo-100 text-indigo-800 border-indigo-300", icon: "🚚", next: ["DELIVERED"] },
  DELIVERED: { label: "已送達",   color: "bg-teal-100 text-teal-800 border-teal-300",       icon: "📦", next: ["COMPLETED"] },
  COMPLETED: { label: "已完成",   color: "bg-green-100 text-green-800 border-green-300",    icon: "✅", next: [] },
  CANCELLED: { label: "已取消",   color: "bg-red-100 text-red-800 border-red-300",          icon: "❌", next: [] },
};

const PAYMENT_CONFIG = {
  CREDIT_CARD:   { label: "クレジットカード", icon: "💳" },
  BANK_TRANSFER: { label: "銀行振込",       icon: "🏦" },
  COD:           { label: "代金引換",       icon: "🚚" },
  CONVENIENCE:   { label: "コンビニ払い",   icon: "🏪" },
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);

  const [editingInfo, setEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [editForm, setEditForm] = useState({
    recipientName: "",
    phone: "",
    zipCode: "",
    address: "",
    note: "",
  });

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAllOrdersApi();
      setOrders(getArray(res));
    } catch (error) {
      toast.error('訂單載入失敗');
    } finally {
      setLoading(false);
    }
  };

  const canEditOrderInfo = (status) => status === "PENDING" || status === "PAID";

  const startEditInfo = (order) => {
    setEditForm({
      recipientName: order.recipientName || "",
      phone: order.phone || "",
      zipCode: order.zipCode || "",
      address: order.address || "",
      note: order.note || "",
    });
    setEditingInfo(true);
  };

  const cancelEditInfo = () => {
    setEditingInfo(false);
    setSavingInfo(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveOrderInfo = async () => {
    if (!selectedOrder) return;

    const payload = {
      recipientName: editForm.recipientName.trim(),
      phone: editForm.phone.trim(),
      zipCode: editForm.zipCode.trim(),
      address: editForm.address.trim(),
      note: editForm.note?.trim() || "",
    };

    if (!payload.recipientName || !payload.phone || !payload.zipCode || !payload.address) {
      toast.error("收件人、電話、郵遞區號、地址不可為空");
      return;
    }

    try {
      setSavingInfo(true);
      const res = await orderApi.updateOrderInfoForAdminApi(selectedOrder.id, payload);
      const updated = res?.data || res;
      setSelectedOrder(updated);
      setEditingInfo(false);
      toast.success("訂單收件資訊已更新");
      fetchOrders();
    } catch (error) {
      const msg = error.response?.data?.message || "更新訂單資訊失敗";
      toast.error(msg);
    } finally {
      setSavingInfo(false);
    }
  };

  const openModal = async (order) => {
    setDetailLoading(true);
    setEditingInfo(false);
    setSelectedOrder(order);
    try {
      const res = await orderApi.getOrderByIdForAdminApi(order.id);
      const detail = res?.data || res;
      setSelectedOrder(detail);
    } catch (error) {
      toast.error('無法載入訂單明細');
    } finally {
      setDetailLoading(false);
    }
  };

  const requestStatusChange = (orderId, currentStatus, newStatus) => {
    const currentCfg = STATUS_CONFIG[currentStatus] || {};
    const newCfg = STATUS_CONFIG[newStatus] || {};
    setConfirmDialog({
      orderId,
      currentStatus,
      newStatus,
      message: `確定要將訂單狀態從「${currentCfg.icon || ""} ${currentCfg.label || currentStatus}」變更為「${newCfg.icon || ""} ${newCfg.label || newStatus}」嗎？`,
      warning: newStatus === "CANCELLED" ? "⚠️ 取消訂單後庫存將自動回補，此操作不可逆！" : null,
    });
  };

  const confirmStatusChange = async () => {
    if (!confirmDialog) return;
    const { orderId, newStatus } = confirmDialog;
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success(`狀態已更新為「${STATUS_CONFIG[newStatus]?.label || newStatus}」`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      const msg = error.response?.data?.message || '狀態更新失敗';
      toast.error(msg);
    }
    setConfirmDialog(null);
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      const matchId = String(o.id).includes(kw);
      const matchUser = (o.username || "").toLowerCase().includes(kw);
      const matchName = (o.recipientName || "").toLowerCase().includes(kw);
      if (!matchId && !matchUser && !matchName) return false;
    }
    return true;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "PENDING").length,
    paid: orders.filter(o => o.status === "PAID").length,
    shipped: orders.filter(o => o.status === "SHIPPED").length,
    completed: orders.filter(o => o.status === "COMPLETED").length,
    cancelled: orders.filter(o => o.status === "CANCELLED").length,
    totalRevenue: orders.filter(o => o.status !== "CANCELLED").reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <p className="text-xs text-stone-500 mb-1">總訂單</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <p className="text-xs text-stone-500 mb-1">營收總額（不含取消）</p>
            <p className="text-2xl font-bold text-amber-600">¥{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <p className="text-xs text-stone-500 mb-1">⏳ 待處理</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <p className="text-xs text-stone-500 mb-1">✅ 已完成</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 搜尋訂單 ID / 會員 / 收件人..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            className="flex-1 w-full border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter("")}
              className={"px-3 py-1.5 rounded-full text-xs font-bold border transition " + (!statusFilter ? "bg-slate-800 text-white border-slate-800" : "bg-white text-stone-500 border-stone-200 hover:border-slate-400")}
            >
              全部 ({stats.total})
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = orders.filter(o => o.status === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
                  className={"px-3 py-1.5 rounded-full text-xs font-bold border transition " + (statusFilter === key ? cfg.color + " border-current" : "bg-white text-stone-500 border-stone-200 hover:border-slate-400")}
                >
                  {cfg.icon} {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-stone-400 mb-3">
          {filteredOrders.length} 筆訂單{statusFilter ? `（篩選: ${STATUS_CONFIG[statusFilter]?.label}）` : ""}
        </p>

        <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-stone-50 uppercase text-xs tracking-widest">
                <th className="p-4">ID</th>
                <th className="p-4">會員</th>
                <th className="p-4">收件人</th>
                <th className="p-4">日期</th>
                <th className="p-4">付款方式</th>
                <th className="p-4">總金額</th>
                <th className="p-4">狀態</th>
                <th className="p-4">下一步</th>
                <th className="p-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="9" className="p-8 text-center text-slate-400">尚無訂單</td></tr>
              ) : (
                filteredOrders.map((o) => {
                  const pm = PAYMENT_CONFIG[o.paymentMethod];
                  const sc = STATUS_CONFIG[o.status] || {};
                  const nextStatuses = sc.next || [];
                  return (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-amber-50/50 transition-colors">
                      <td className="p-4 font-bold text-sm">#{o.id}</td>
                      <td className="p-4 text-sm">{o.username || 'N/A'}</td>
                      <td className="p-4 text-sm">{o.recipientName || '-'}</td>
                      <td className="p-4 text-sm text-stone-500">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="p-4 text-sm">{pm ? `${pm.icon} ${pm.label}` : (o.paymentMethod || '-')}</td>
                      <td className="p-4 font-bold text-amber-600">¥{Number(o.totalAmount).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={"inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border " + sc.color}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="p-4">
                        {nextStatuses.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {nextStatuses.map(ns => {
                              const nsCfg = STATUS_CONFIG[ns] || {};
                              const isCancelBtn = ns === "CANCELLED";
                              return (
                                <button
                                  key={ns}
                                  onClick={() => requestStatusChange(o.id, o.status, ns)}
                                  className={"text-xs font-bold px-2.5 py-1 rounded border transition " +
                                    (isCancelBtn
                                      ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                      : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-400")}
                                >
                                  {nsCfg.icon} → {nsCfg.label}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openModal(o)}
                          className="text-xs font-bold text-white bg-slate-800 px-4 py-2 hover:bg-amber-500 transition-colors rounded"
                        >
                          詳細を見る
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">📋 訂單狀態流程</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">⏳ 處理中</span>
            <span className="text-stone-400">→</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">💳 已付款</span>
            <span className="text-stone-400">→</span>
            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-bold">🚚 已出貨</span>
            <span className="text-stone-400">→</span>
            <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full font-bold">📦 已送達</span>
            <span className="text-stone-400">→</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">✅ 已完成</span>
            <span className="text-stone-400 ml-4">|</span>
            <span className="text-stone-400 ml-2">處理中/已付款 可</span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">❌ 取消</span>
          </div>
        </div>

        {confirmDialog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden">
              <div className="bg-slate-900 text-white p-4">
                <h3 className="font-bold">⚡ 確認狀態變更</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-700 mb-3">{confirmDialog.message}</p>
                {confirmDialog.warning && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg mb-4">
                    {confirmDialog.warning}
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-300"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmStatusChange}
                    className={"px-4 py-2 text-white rounded-lg text-sm font-bold " +
                      (confirmDialog.newStatus === "CANCELLED" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700")}
                  >
                    確認變更
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col rounded-lg">
              <div className="sticky top-0 bg-slate-900 text-stone-50 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-xl font-bold">訂單明細 #{selectedOrder.id}</h2>
                  <p className="text-xs text-amber-400 mt-1">訂購人: {selectedOrder.username || 'N/A'}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setEditingInfo(false);
                  }}
                  className="text-stone-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {detailLoading ? (
                  <p className="text-amber-600 text-sm animate-pulse">正在載入明細...</p>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">📊 訂單狀態</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={"inline-flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full border " + (STATUS_CONFIG[selectedOrder.status]?.color || "")}>
                          {STATUS_CONFIG[selectedOrder.status]?.icon} {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                        </span>
                        {(STATUS_CONFIG[selectedOrder.status]?.next || []).length > 0 && (
                          <>
                            <span className="text-stone-400 text-sm">→</span>
                            {(STATUS_CONFIG[selectedOrder.status]?.next || []).map(ns => {
                              const nsCfg = STATUS_CONFIG[ns] || {};
                              const isCancelBtn = ns === "CANCELLED";
                              return (
                                <button
                                  key={ns}
                                  onClick={() => requestStatusChange(selectedOrder.id, selectedOrder.status, ns)}
                                  className={"text-xs font-bold px-3 py-1.5 rounded-full border transition " +
                                    (isCancelBtn
                                      ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                      : "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100")}
                                >
                                  {nsCfg.icon} {nsCfg.label}
                                </button>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>

                    {selectedOrder.recipientName && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-200 pb-2">
                          <h3 className="text-sm font-bold text-slate-800">📦 收件資訊</h3>
                          {canEditOrderInfo(selectedOrder.status) && !editingInfo && (
                            <button
                              onClick={() => startEditInfo(selectedOrder)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition"
                            >
                              編輯收件資訊
                            </button>
                          )}
                        </div>

                        {!editingInfo ? (
                          <div className="bg-stone-50 rounded-lg p-4 space-y-1 text-sm">
                            <p><span className="text-stone-500">收件人:</span> <span className="font-medium">{selectedOrder.recipientName}</span></p>
                            <p><span className="text-stone-500">電話:</span> <span className="font-medium">{selectedOrder.phone}</span></p>
                            <p><span className="text-stone-500">郵遞區號:</span> <span className="font-medium">{selectedOrder.zipCode}</span></p>
                            <p><span className="text-stone-500">地址:</span> <span className="font-medium">{selectedOrder.address}</span></p>
                            {selectedOrder.note && <p><span className="text-stone-500">備註:</span> <span className="font-medium">{selectedOrder.note}</span></p>}
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">收件人</label>
                              <input
                                type="text"
                                name="recipientName"
                                value={editForm.recipientName}
                                onChange={handleEditFormChange}
                                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">電話</label>
                              <input
                                type="text"
                                name="phone"
                                value={editForm.phone}
                                onChange={handleEditFormChange}
                                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">郵遞區號</label>
                              <input
                                type="text"
                                name="zipCode"
                                value={editForm.zipCode}
                                onChange={handleEditFormChange}
                                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">地址</label>
                              <textarea
                                name="address"
                                value={editForm.address}
                                onChange={handleEditFormChange}
                                rows="3"
                                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">備註</label>
                              <textarea
                                name="note"
                                value={editForm.note}
                                onChange={handleEditFormChange}
                                rows="3"
                                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                              <button
                                onClick={cancelEditInfo}
                                disabled={savingInfo}
                                className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-300 disabled:opacity-50"
                              >
                                取消
                              </button>
                              <button
                                onClick={saveOrderInfo}
                                disabled={savingInfo}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 disabled:opacity-50"
                              >
                                {savingInfo ? "儲存中..." : "儲存修改"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {PAYMENT_CONFIG[selectedOrder.paymentMethod] && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">💰 付款方式</h3>
                        <div className="bg-stone-50 rounded-lg p-3 flex items-center gap-3">
                          <span className="text-2xl">{PAYMENT_CONFIG[selectedOrder.paymentMethod].icon}</span>
                          <span className="font-medium text-slate-800">{PAYMENT_CONFIG[selectedOrder.paymentMethod].label}</span>
                        </div>
                      </div>
                    )}

                    <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">🛒 購買品項</h3>
                    <div className="space-y-3">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 border border-slate-100 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900">{item.productName || '未知商品'}</h4>
                              <p className="text-xs text-slate-500 mt-1">單價: ¥{Number(item.priceAtPurchase).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold bg-amber-100 text-amber-800 px-2 py-1 inline-block mb-1 rounded">
                                數量: {item.quantity} 件
                              </p>
                              <p className="text-base font-bold text-amber-600">¥{Number(item.subtotal).toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm py-4 text-center">無商品明細</p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-slate-800 flex justify-between items-end">
                      <span className="font-bold text-slate-700">總計</span>
                      <span className="text-2xl font-bold text-amber-600">¥{Number(selectedOrder.totalAmount).toLocaleString()}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between text-xs text-stone-400">
                      <span>建立: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'}</span>
                      <span>更新: {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : '-'}</span>
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
