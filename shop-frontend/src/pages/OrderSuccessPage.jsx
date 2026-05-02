import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderByIdApi } from "../api/orderApi";

const paymentMethodMap = {
  CREDIT_CARD: { label: "\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9", icon: "\uD83D\uDCB3" },
  BANK_TRANSFER: { label: "\u92F8\u884C\u632F\u8FBC", icon: "\uD83C\uDFE6" },
  COD: { label: "\u4EE3\u91D1\u5F15\u63DB", icon: "\uD83D\uDE9A" },
  CONVENIENCE: { label: "\u30B3\u30F3\u30D3\u30CB\u6255\u3044", icon: "\uD83C\uDFEA" },
};

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderByIdApi(id);
        setOrder(res.data || res);
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

  const payment = order ? paymentMethodMap[order.paymentMethod] : null;

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="max-w-2xl mx-auto pt-12 px-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{"\u3054\u6CE8\u6587\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059"}</h1>
          <p className="text-stone-500">{"\u3054\u6CE8\u6587\u304C\u6B63\u5E38\u306B\u53D7\u3051\u4ED8\u3051\u3089\u308C\u307E\u3057\u305F"}</p>
        </div>

        {order ? (
          <div className="space-y-6">
            {/* Order Number */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 text-center">
              <p className="text-sm text-stone-500 mb-1">{"\u6CE8\u6587\u756A\u53F7"}</p>
              <p className="text-4xl font-bold text-amber-600">#{order.id}</p>
              <p className="text-xs text-stone-400 mt-2">
                {order.createdAt ? new Date(order.createdAt).toLocaleString("ja-JP") : ""}
              </p>
            </div>

            {/* Shipping + Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shipping */}
              {order.recipientName && (
                <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5">
                  <h3 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
                    <span>{"\uD83D\uDCE6"}</span> {"\u304A\u5C4A\u3051\u5148"}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-slate-800">{order.recipientName}</p>
                    <p className="text-stone-500">{"\u3012"}{order.zipCode}</p>
                    <p className="text-stone-500">{order.address}</p>
                    <p className="text-stone-500">{"\u2706"} {order.phone}</p>
                    {order.note && <p className="text-stone-400 text-xs mt-2">{"\u5099\u8003: "}{order.note}</p>}
                  </div>
                </div>
              )}

              {/* Payment */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5">
                <h3 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
                  <span>{"\uD83D\uDCB0"}</span> {"\u304A\u652F\u6255\u3044"}
                </h3>
                {payment ? (
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{payment.icon}</span>
                    <span className="font-medium text-slate-800">{payment.label}</span>
                  </div>
                ) : null}
                <div className="border-t border-stone-100 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">{"\u5408\u8A08\u91D1\u984D"}</span>
                    <span className="text-2xl font-bold text-amber-600">{"\u00A5"}{Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5">
              <h3 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
                <span>{"\uD83D\uDED2"}</span> {"\u6CE8\u6587\u5185\u5BB9"}
              </h3>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm font-medium text-slate-800">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.variantName}</p>
                      )}
                      {item.sku && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                      )}
                      <p className="text-xs text-stone-400 mt-0.5">{"\u00A5"}{item.priceAtPurchase || item.price} {"\u00D7"} {item.quantity}</p>
                    </div>
                    <p className="font-bold text-slate-800 flex-shrink-0">{"\u00A5"}{Number(item.subtotal).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Instructions */}
            {order.paymentMethod === "BANK_TRANSFER" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-blue-800 mb-2">{"\uD83C\uDFE6 \u304A\u632F\u8FBC\u5148\u60C5\u5831"}</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>{"\u9280\u884C\u540D: \u4E09\u4E95\u4F4F\u53CB\u9280\u884C \u6E0B\u8C37\u652F\u5E97"}</p>
                  <p>{"\u53E3\u5EA7\u756A\u53F7: \u666E\u901A 1234567"}</p>
                  <p>{"\u53E3\u5EA7\u540D\u7FA9: \u30AB\uFF09\u30B1\u30F3\u30C9\u30A6\u30B7\u30E7\u30C3\u30D7"}</p>
                  <p className="text-xs text-blue-500 mt-2">{"* 3\u65E5\u4EE5\u5185\u306B\u304A\u632F\u8FBC\u304F\u3060\u3055\u3044"}</p>
                </div>
              </div>
            )}
            {order.paymentMethod === "CONVENIENCE" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-green-800 mb-2">{"\uD83C\uDFEA \u30B3\u30F3\u30D3\u30CB\u6255\u3044\u306E\u3054\u6848\u5185"}</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>{"\u304A\u652F\u6255\u3044\u756A\u53F7: "}<span className="font-bold text-lg">{String(order.id).padStart(10, "0")}</span></p>
                  <p className="text-xs text-green-500 mt-2">{"* \u304A\u8FD1\u304F\u306E\u30B3\u30F3\u30D3\u30CB\u306E\u7AEF\u672B\u3067\u4E0A\u8A18\u756A\u53F7\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044"}</p>
                </div>
              </div>
            )}
            {order.paymentMethod === "COD" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-amber-800 mb-2">{"\uD83D\uDE9A \u4EE3\u91D1\u5F15\u63DB\u306E\u3054\u6848\u5185"}</h3>
                <p className="text-sm text-amber-700">{"\u5546\u54C1\u304A\u5C4A\u3051\u6642\u306B\u3001\u914D\u9054\u54E1\u306B\u304A\u652F\u6255\u3044\u304F\u3060\u3055\u3044\u3002\u4EE3\u5F15\u304D\u624B\u6570\u6599 \u00A5330 \u304C\u5225\u9014\u304B\u304B\u308A\u307E\u3059\u3002"}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link to="/orders" className="flex-1 text-center bg-stone-200 text-stone-700 py-3 rounded-lg text-lg font-bold hover:bg-stone-300 transition">
                {"\u6CE8\u6587\u5C65\u6B74\u3092\u898B\u308B"}
              </Link>
              <Link to="/products" className="flex-1 text-center bg-amber-500 text-white py-3 rounded-lg text-lg font-bold hover:bg-amber-400 transition">
                {"\u304A\u8CB7\u3044\u7269\u3092\u7D9A\u3051\u308B"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-10 text-center">
            <p className="text-stone-500">{"\u6CE8\u6587\u60C5\u5831\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F"}</p>
            <Link to="/orders" className="text-amber-600 hover:text-amber-700 underline mt-4 inline-block">{"\u6CE8\u6587\u5C65\u6B74\u3078"}</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;
