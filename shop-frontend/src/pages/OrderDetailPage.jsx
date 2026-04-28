import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderByIdApi } from "../api/orderApi";

const statusMap = {
  PENDING: { label: "保留中", style: "bg-amber-100 text-amber-700" },
  PAID: { label: "支払済み", style: "bg-green-100 text-green-700" },
  SHIPPED: { label: "発送済み", style: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "配達済み", style: "bg-purple-100 text-purple-700" },
  CANCELLED: { label: "キャンセル", style: "bg-red-100 text-red-700" },
  COMPLETED: { label: "完了", style: "bg-emerald-100 text-emerald-700" },
};

const paymentMethodMap = {
  CREDIT_CARD: { label: "クレジットカード", icon: "\uD83D\uDCB3" },
  BANK_TRANSFER: { label: "銀行振込", icon: "\uD83C\uDFE6" },
  COD: { label: "代金引換", icon: "\uD83D\uDE9A" },
  CONVENIENCE: { label: "コンビニ払い", icon: "\uD83C\uDFEA" },
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
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center mt-10 text-red-500">{"\u6CE8\u6587\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F"}</div>;
  }

  const status = statusMap[order.status] || { label: order.status, style: "bg-stone-100 text-stone-700" };
  const payment = paymentMethodMap[order.paymentMethod];

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="max-w-3xl mx-auto pt-8 px-6">
        <Link to="/orders" className="text-amber-600 hover:text-amber-700 font-medium">
          {"\u2190 \u6CE8\u6587\u5C65\u6B74\u306B\u623B\u308B"}
        </Link>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-stone-100 p-8">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-slate-800">{"\u6CE8\u6587"} #{order.id}</h1>
            <span className={"text-sm px-3 py-1 rounded-full font-medium " + status.style}>
              {status.label}
            </span>
          </div>

          <div className="mt-4 text-sm text-stone-500">
            {"\u6CE8\u6587\u65E5:"} {order.createdAt ? new Date(order.createdAt).toLocaleString("ja-JP") : "-"}
          </div>

          {/* Shipping Info */}
          {order.recipientName && (
            <div className="mt-6 pt-6 border-t border-stone-100">
              <h2 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
                <span>{"\uD83D\uDCE6"}</span> {"\u304A\u5C4A\u3051\u5148\u60C5\u5831"}
              </h2>
              <div className="bg-stone-50 rounded-lg p-4 space-y-1 text-sm">
                <p><span className="text-stone-500">{"\u304A\u540D\u524D:"}</span> <span className="font-medium text-slate-800">{order.recipientName}</span></p>
                <p><span className="text-stone-500">{"\u96FB\u8A71:"}</span> <span className="font-medium text-slate-800">{order.phone}</span></p>
                <p><span className="text-stone-500">{"\u90F5\u4FBF\u756A\u53F7:"}</span> <span className="font-medium text-slate-800">{order.zipCode}</span></p>
                <p><span className="text-stone-500">{"\u4F4F\u6240:"}</span> <span className="font-medium text-slate-800">{order.address}</span></p>
                {order.note && <p><span className="text-stone-500">{"\u5099\u8003:"}</span> <span className="font-medium text-slate-800">{order.note}</span></p>}
              </div>
            </div>
          )}

          {/* Payment Info */}
          {payment && (
            <div className="mt-6 pt-6 border-t border-stone-100">
              <h2 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
                <span>{"\uD83D\uDCB0"}</span> {"\u304A\u652F\u6255\u3044\u65B9\u6CD5"}
              </h2>
              <div className="bg-stone-50 rounded-lg p-4 flex items-center gap-3">
                <span className="text-2xl">{payment.icon}</span>
                <span className="font-medium text-slate-800">{payment.label}</span>
              </div>
            </div>
          )}

          {/* Order Items */}
          <h2 className="text-sm font-bold text-amber-600 mt-6 mb-3 pt-6 border-t border-stone-100 flex items-center gap-2">
            <span>{"\uD83D\uDED2"}</span> {"\u6CE8\u6587\u5185\u5BB9"}
          </h2>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-stone-50 border border-stone-100 rounded-lg p-4">
                <div>
                  <p className="font-medium text-slate-800">{item.productName}</p>
                  <p className="text-sm text-stone-500">
                    {item.quantity} {"\u00D7"} {"\u00A5"}{item.priceAtPurchase || item.price}
                  </p>
                </div>
                <p className="font-bold text-slate-800">{"\u00A5"}{item.subtotal}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t-2 border-slate-800 flex justify-between items-center">
            <span className="text-lg font-bold text-slate-800">{"\u5408\u8A08"}</span>
            <span className="text-2xl font-bold text-amber-600">{"\u00A5"}{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
