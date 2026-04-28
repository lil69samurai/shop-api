import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersApi, deleteOrderApi } from "../api/orderApi";
import { toast } from "react-toastify";

const statusMap = {
  PENDING: { label: "\u4FDD\u7559\u4E2D", style: "bg-amber-100 text-amber-700" },
  PAID: { label: "\u652F\u6255\u6E08\u307F", style: "bg-green-100 text-green-700" },
  SHIPPED: { label: "\u767A\u9001\u6E08\u307F", style: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "\u914D\u9054\u6E08\u307F", style: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "\u5B8C\u4E86", style: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "\u30AD\u30E3\u30F3\u30BB\u30EB", style: "bg-red-100 text-red-700" },
};

const paymentMethodMap = {
  CREDIT_CARD: "\uD83D\uDCB3",
  BANK_TRANSFER: "\uD83C\uDFE6",
  COD: "\uD83D\uDE9A",
  CONVENIENCE: "\uD83C\uDFEA",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const data = await getMyOrdersApi();
      const orderList = data.data?.content || data.data || [];
      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("\u3053\u306E\u6CE8\u6587\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3059\u304B\uFF1F")) return;
    setError("");
    try {
      await deleteOrderApi(id);
      toast.success("\u6CE8\u6587\u304C\u30AD\u30E3\u30F3\u30BB\u30EB\u3055\u308C\u307E\u3057\u305F");
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "\u30AD\u30E3\u30F3\u30BB\u30EB\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u4FDD\u7559\u4E2D\u306E\u6CE8\u6587\u306E\u307F\u30AD\u30E3\u30F3\u30BB\u30EB\u53EF\u80FD\u3067\u3059\u3002");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-stone-400 text-sm">{"\u6CE8\u6587\u5C65\u6B74\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D..."}</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="max-w-4xl mx-auto pt-8 px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{"\u6CE8\u6587\u5C65\u6B74"}</h1>
            <p className="text-sm text-stone-400 mt-1">{orders.length}{"\u4EF6\u306E\u6CE8\u6587"}</p>
          </div>
          <Link to="/products" className="bg-amber-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-amber-400 transition text-sm">
            {"\u304A\u8CB7\u3044\u7269\u3092\u7D9A\u3051\u308B"}
          </Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-10 text-center">
            <div className="text-5xl mb-4">{"\uD83D\uDCE6"}</div>
            <p className="text-stone-500 text-lg mb-2">{"\u6CE8\u6587\u5C65\u6B74\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093"}</p>
            <p className="text-stone-400 text-sm mb-6">{"\u304A\u6C17\u306B\u5165\u308A\u306E\u5546\u54C1\u3092\u898B\u3064\u3051\u307E\u3057\u3087\u3046"}</p>
            <Link to="/products" className="inline-block bg-amber-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition">
              {"\u5546\u54C1\u3092\u898B\u308B"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusMap[order.status] || { label: order.status, style: "bg-stone-100 text-stone-700" };
              const pmIcon = paymentMethodMap[order.paymentMethod] || "";
              return (
                <div key={order.id} className="bg-white border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <Link to={"/orders/" + order.id} className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-slate-800 text-lg">{"\u6CE8\u6587"} #{order.id}</p>
                          <span className={"text-xs px-3 py-1 rounded-full font-medium " + status.style}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-stone-400">
                          <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("ja-JP") : "-"}</span>
                          {order.paymentMethod && <span>{pmIcon} {order.paymentMethod === "CREDIT_CARD" ? "\u30AB\u30FC\u30C9" : order.paymentMethod === "BANK_TRANSFER" ? "\u632F\u8FBC" : order.paymentMethod === "COD" ? "\u4EE3\u5F15" : "\u30B3\u30F3\u30D3\u30CB"}</span>}
                          {order.recipientName && <span>{"\u2192"} {order.recipientName}</span>}
                        </div>
                        {order.items && order.items.length > 0 && (
                          <p className="text-xs text-stone-400 mt-2">
                            {order.items.slice(0, 3).map(i => i.productName).join("\u3001")}
                            {order.items.length > 3 ? (" \u4ED6" + (order.items.length - 3) + "\u70B9") : ""}
                          </p>
                        )}
                      </Link>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-amber-600 font-bold text-xl">{"\u00A5"}{Number(order.totalAmount).toLocaleString()}</p>
                        {order.status === "PENDING" && (
                          <button onClick={() => handleDelete(order.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium mt-2 px-3 py-1 bg-red-50 rounded-lg transition">
                            {"\u30AD\u30E3\u30F3\u30BB\u30EB"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
