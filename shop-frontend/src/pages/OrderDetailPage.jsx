import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getOrderByIdApi } from "../api/orderApi";

const OrderDetailPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700", PAID: "bg-green-100 text-green-700",
    SHIPPED: "bg-blue-100 text-blue-700", DELIVERED: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-red-100 text-red-700",
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try { const data = await getOrderByIdApi(id); setOrder(data.data || data); }
      catch (error) { console.error("Failed to fetch order", error); }
      finally { setLoading(false); }
    }; fetchOrder();
  }, [id]);

  if (loading) {
    return (<div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div></div>);
  }
  if (!order) { return <div className="text-center mt-10 text-red-500">{t("orders.orderNotFound")}</div>; }

  const sStyle = statusStyles[order.status] || "bg-stone-100 text-stone-700";

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="max-w-3xl mx-auto pt-8 px-6">
        <Link to="/orders" className="text-amber-600 hover:text-amber-700 font-medium">← {t("order.backToOrders")}</Link>
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-stone-100 p-8">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-slate-800">{t("order.orderNum")} #{order.id}</h1>
            <span className={"text-sm px-3 py-1 rounded-full font-medium " + sStyle}>{t("status." + order.status)}</span>
          </div>
          <div className="mt-4 text-sm text-stone-500">{t("order.orderDate")}: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div>

          {order.recipientName && (
            <div className="mt-6 pt-6 border-t border-stone-100">
              <h2 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2"><span>📦</span> {t("order.shippingInfo")}</h2>
              <div className="bg-stone-50 rounded-lg p-4 space-y-1 text-sm">
                <p><span className="text-stone-500">{t("order.nameLabel")}:</span> <span className="font-medium text-slate-800">{order.recipientName}</span></p>
                <p><span className="text-stone-500">{t("order.phoneLabel")}:</span> <span className="font-medium text-slate-800">{order.phone}</span></p>
                <p><span className="text-stone-500">{t("order.zipLabel")}:</span> <span className="font-medium text-slate-800">{order.zipCode}</span></p>
                <p><span className="text-stone-500">{t("order.addressLabel")}:</span> <span className="font-medium text-slate-800">{order.address}</span></p>
                {order.note && <p><span className="text-stone-500">{t("order.noteLabel")}:</span> <span className="font-medium text-slate-800">{order.note}</span></p>}
              </div>
            </div>)}

          {order.paymentMethod && (
            <div className="mt-6 pt-6 border-t border-stone-100">
              <h2 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2"><span>💰</span> {t("order.payMethod")}</h2>
              <div className="bg-stone-50 rounded-lg p-4">
                <span className="font-medium text-slate-800">{t("paymentMethod." + order.paymentMethod)}</span>
              </div>
            </div>)}

          <h2 className="text-sm font-bold text-amber-600 mt-6 mb-3 pt-6 border-t border-stone-100 flex items-center gap-2"><span>🛒</span> {t("order.orderItems")}</h2>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-stone-50 border border-stone-100 rounded-lg p-4">
                <div>
                  <p className="font-medium text-slate-800">{item.productName}</p>
                  <p className="text-sm text-stone-500">{item.quantity} × ¥{item.priceAtPurchase || item.price}</p>
                </div>
                <p className="font-bold text-slate-800">¥{item.subtotal}</p>
              </div>))}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-slate-800 flex justify-between items-center">
            <span className="text-lg font-bold text-slate-800">{t("order.total")}</span>
            <span className="text-2xl font-bold text-amber-600">¥{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
