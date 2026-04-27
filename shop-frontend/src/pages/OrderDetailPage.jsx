import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderByIdApi } from "../api/orderApi";

const statusMap = {
  PENDING: { label: "保留中", style: "bg-amber-100 text-amber-700" },
  PAID: { label: "支払済み", style: "bg-green-100 text-green-700" },
  SHIPPED: { label: "発送済み", style: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "配達済み", style: "bg-purple-100 text-purple-700" },
  CANCELLED: { label: "キャンセル", style: "bg-red-100 text-red-700" },
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderByIdApi(id);
        setOrder(data.data || data);
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-10 text-stone-400">読み込み中...</div>;
  }

  if (!order) {
    return <div className="text-center mt-10 text-red-500">注文が見つかりませんでした</div>;
  }

  const status = statusMap[order.status] || { label: order.status, style: "bg-stone-100 text-stone-700" };

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-3xl mx-auto pt-8 px-6">
        <Link to="/orders" className="text-amber-600 hover:text-amber-700 font-medium">
          ← 注文履歴に戻る
        </Link>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-stone-100 p-8">
          <h1 className="text-2xl font-bold text-slate-800">注文 #{order.id}</h1>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-medium text-stone-500">ステータス:</span>
              <span className={"text-sm px-3 py-1 rounded-full font-medium " + status.style}>
                {status.label}
              </span>
            </div>
            <div>
              <span className="font-medium text-stone-500">注文日:</span>
              <span className="ml-2 text-slate-700">{new Date(order.createdAt).toLocaleString("ja-JP")}</span>
            </div>
            <div>
              <span className="font-medium text-stone-500">合計:</span>
              <span className="ml-2 text-2xl text-amber-600 font-bold">¥{order.totalAmount}</span>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-800 mt-8 mb-4 pt-6 border-t border-stone-100">注文内容</h2>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-stone-50 border border-stone-100 rounded-lg p-4">
                <div>
                  <p className="font-medium text-slate-800">{item.productName}</p>
                  <p className="text-sm text-stone-500">
                    {item.quantity} × ¥{item.price}
                  </p>
                </div>
                <p className="font-bold text-slate-800">¥{item.subtotal}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
