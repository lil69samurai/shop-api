import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersApi, deleteOrderApi } from "../api/orderApi";

const statusMap = {
  PENDING: { label: "保留中", style: "bg-amber-100 text-amber-700" },
  PAID: { label: "支払済み", style: "bg-green-100 text-green-700" },
  SHIPPED: { label: "発送済み", style: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "配達済み", style: "bg-purple-100 text-purple-700" },
  CANCELLED: { label: "キャンセル", style: "bg-red-100 text-red-700" },
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("この注文をキャンセルしますか？")) return;
    setError("");
    try {
      await deleteOrderApi(id);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "キャンセルに失敗しました。保留中の注文のみキャンセル可能です。");
    }
  };

  if (loading) return <div className="text-center mt-10 text-stone-400">読み込み中...</div>;

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto pt-8 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">注文履歴</h1>
          <Link to="/orders/create" className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-amber-400 transition">
            + 新規注文
          </Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-10 text-center">
            <p className="text-stone-400 text-lg">注文履歴はまだありません</p>
            <Link to="/products" className="text-amber-600 hover:text-amber-700 underline mt-4 inline-block">商品を見る</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusMap[order.status] || { label: order.status, style: "bg-stone-100 text-stone-700" };
              return (
                <div key={order.id} className="bg-white border border-stone-100 rounded-xl shadow-sm p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-center">
                    <Link to={"/orders/" + order.id} className="flex-1">
                      <p className="font-bold text-slate-800">注文 #{order.id}</p>
                      <p className="text-sm text-stone-400 mt-1">{new Date(order.createdAt).toLocaleDateString("ja-JP")}</p>
                    </Link>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-amber-600 font-bold text-lg">¥{order.totalAmount}</p>
                        <span className={"text-xs px-2 py-1 rounded-full font-medium " + status.style}>
                          {status.label}
                        </span>
                      </div>
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-500 hover:text-red-700 font-medium px-3 py-1 bg-red-50 rounded-lg transition text-sm"
                        >
                          キャンセル
                        </button>
                      )}
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
