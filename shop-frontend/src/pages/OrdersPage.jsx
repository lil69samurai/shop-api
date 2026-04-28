import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMyOrdersApi, deleteOrderApi } from "../api/orderApi";
import { toast } from "react-toastify";

const OrdersPage = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700",
    PAID: "bg-green-100 text-green-700",
    SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const fetchOrders = async () => {
    try {
      const data = await getMyOrdersApi();
      const orderList = data.data?.content || data.data || [];
      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (error) { console.error("Failed to fetch orders", error); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t("orders.cancelConfirm"))) return;
    setError("");
    try { await deleteOrderApi(id); toast.success(t("orders.cancelled")); fetchOrders(); }
    catch (err) { setError(err.response?.data?.message || t("orders.cancelFailed")); }
  };

  if (loading) {
    return (<div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
      <p className="text-stone-400 text-sm">{t("orders.loadingOrders")}</p></div>);
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-12"><div className="max-w-4xl mx-auto pt-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">{t("orders.title")}</h1>
          <p className="text-sm text-stone-400 mt-1">{orders.length}{t("orders.count")}</p></div>
        <Link to="/products" className="bg-amber-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-amber-400 transition text-sm">{t("orders.continueShopping")}</Link>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-10 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-stone-500 text-lg mb-2">{t("orders.emptyTitle")}</p>
          <p className="text-stone-400 text-sm mb-6">{t("orders.emptySubtitle")}</p>
          <Link to="/products" className="inline-block bg-amber-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition">{t("home.shopNow")}</Link>
        </div>
      ) : (
        <div className="space-y-4">{orders.map((order) => {
          const sStyle = statusStyles[order.status] || "bg-stone-100 text-stone-700";
          return (
            <div key={order.id} className="bg-white border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="p-5"><div className="flex justify-between items-start">
                <Link to={"/orders/" + order.id} className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-slate-800 text-lg">{t("order.orderNum")} #{order.id}</p>
                    <span className={"text-xs px-3 py-1 rounded-full font-medium " + sStyle}>{t("status." + order.status)}</span></div>
                  <div className="flex items-center gap-4 text-sm text-stone-400">
                    <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</span>
                    {order.paymentMethod && <span>{t("paymentMethod." + order.paymentMethod)}</span>}
                    {order.recipientName && <span>→ {order.recipientName}</span>}</div>
                  {order.items && order.items.length > 0 && (
                    <p className="text-xs text-stone-400 mt-2">
                      {order.items.slice(0, 3).map(i => i.productName).join(", ")}
                      {order.items.length > 3 ? (" " + t("orders.other") + (order.items.length - 3) + t("orders.items")) : ""}</p>)}
                </Link>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-amber-600 font-bold text-xl">¥{Number(order.totalAmount).toLocaleString()}</p>
                  {order.status === "PENDING" && (
                    <button onClick={() => handleDelete(order.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium mt-2 px-3 py-1 bg-red-50 rounded-lg transition">{t("orders.cancel")}</button>)}
                </div></div></div></div>);})}</div>)}
    </div></div>);
};

export default OrdersPage;
