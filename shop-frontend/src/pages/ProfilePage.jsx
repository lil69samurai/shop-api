import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { changePasswordApi } from "../api/authApi";
import { getMyOrdersApi } from "../api/orderApi";
import { getMyDefaultRecipientApi, updateMyDefaultRecipientApi } from "../api/userApi";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({ total: 0, totalSpent: 0 });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  // 預設收件資訊
  const [recipient, setRecipient] = useState({
    defaultRecipientName: "",
    defaultPhone: "",
    defaultZipCode: "",
    defaultAddress: "",
    defaultNote: "",
  });
  const [showRecipientForm, setShowRecipientForm] = useState(false);
  const [recipientSaving, setRecipientSaving] = useState(false);

  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700", PAID: "bg-green-100 text-green-700",
    SHIPPED: "bg-blue-100 text-blue-700", DELIVERED: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-red-100 text-red-700",
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrdersApi();
        const orderList = data.data?.content || data.data || [];
        const orders = Array.isArray(orderList) ? orderList : [];
        setRecentOrders(orders.slice(0, 3));
        const totalSpent = orders.filter(o => o.status !== "CANCELLED").reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        setOrderStats({ total: orders.length, totalSpent });
      } catch (error) { console.error("Failed to fetch orders", error); }
    };
    const fetchRecipient = async () => {
      try {
        const res = await getMyDefaultRecipientApi();
        const d = res.data || {};
        setRecipient({
          defaultRecipientName: d.defaultRecipientName || "",
          defaultPhone:         d.defaultPhone || "",
          defaultZipCode:       d.defaultZipCode || "",
          defaultAddress:       d.defaultAddress || "",
          defaultNote:          d.defaultNote || "",
        });
      } catch (error) { console.error("Failed to fetch recipient", error); }
    };
    if (user) { fetchOrders(); fetchRecipient(); }
  }, [user]);

  const handleChange = (e) => { setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value }); };

  const handleRecipientChange = (e) => {
    setRecipient({ ...recipient, [e.target.name]: e.target.value });
  };

  const handleSaveRecipient = async (e) => {
    e.preventDefault();
    setRecipientSaving(true);
    try {
      await updateMyDefaultRecipientApi(recipient);
      toast.success(t("profile.recipientSaved"));
      setShowRecipientForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || t("profile.recipientFailed"));
    } finally {
      setRecipientSaving(false);
    }
  };

  const hasRecipient = !!(recipient.defaultRecipientName || recipient.defaultAddress);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error(t("profile.pwMismatch")); return; }
    if (passwordForm.newPassword.length < 6) { toast.error(t("profile.pwTooShort")); return; }
    setSubmitting(true);
    try {
      await changePasswordApi({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success(t("profile.pwChanged"));
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (error) { toast.error(error.response?.data?.message || t("profile.pwFailed")); }
    finally { setSubmitting(false); }
  };

  if (!user) {
    return (<div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div></div>);
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="max-w-3xl mx-auto pt-8 px-6">

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-amber-400 flex-shrink-0">
              {user.username ? user.username.charAt(0).toUpperCase() : "U"}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">{user.username}</h1>
              <p className="text-stone-500 text-sm mt-1">{user.email}</p>
              <span className={"inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium " + (user.role === "ROLE_ADMIN" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600")}>
                {user.role === "ROLE_ADMIN" ? t("profile.admin") : t("profile.user")}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 text-center">
            <p className="text-3xl font-bold text-slate-800">{orderStats.total}</p>
            <p className="text-xs text-stone-400 mt-1">{t("profile.totalOrders")}</p></div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 text-center">
            <p className="text-3xl font-bold text-amber-600">¥{orderStats.totalSpent.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-1">{t("profile.totalSpentLabel")}</p></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
            <h2 className="text-lg font-bold text-slate-800">{t("profile.recentOrders")}</h2>
            <Link to="/orders" className="text-sm text-amber-600 hover:text-amber-700 font-medium">{t("profile.viewAll")}</Link></div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-stone-400 text-sm mb-3">{t("profile.noOrdersYet")}</p>
              <Link to="/products" className="text-amber-600 hover:text-amber-700 underline text-sm">{t("profile.viewProducts")}</Link></div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const sStyle = statusStyles[order.status] || "bg-stone-100 text-stone-600";
                return (
                  <Link key={order.id} to={"/orders/" + order.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{t("order.orderNum")} #{order.id}</p>
                      <p className="text-xs text-stone-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</p></div>
                    <div className="text-right flex items-center gap-3">
                      <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + sStyle}>{t("status." + order.status)}</span>
                      <span className="font-bold text-amber-600">¥{Number(order.totalAmount).toLocaleString()}</span></div>
                  </Link>);})}</div>)}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/orders" className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 text-center hover:shadow-md transition group">
            <div className="text-2xl mb-2">📋</div>
            <p className="font-bold text-slate-800 group-hover:text-amber-600 transition">{t("profile.orderHistory")}</p></Link>
          <Link to="/cart" className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 text-center hover:shadow-md transition group">
            <div className="text-2xl mb-2">🛒</div>
            <p className="font-bold text-slate-800 group-hover:text-amber-600 transition">{t("nav.cart")}</p></Link>
        </div>

        {/* 預設收件資訊 */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
            <h2 className="text-lg font-bold text-slate-800">📮 {t("profile.defaultRecipient")}</h2>
            <button onClick={() => setShowRecipientForm(!showRecipientForm)} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              {showRecipientForm ? t("profile.close") : (hasRecipient ? t("profile.edit") : t("profile.add"))}
            </button>
          </div>

          {showRecipientForm ? (
            <form onSubmit={handleSaveRecipient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">{t("order.name")}</label>
                <input type="text" name="defaultRecipientName" value={recipient.defaultRecipientName} onChange={handleRecipientChange}
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">{t("order.phone")}</label>
                  <input type="tel" name="defaultPhone" value={recipient.defaultPhone} onChange={handleRecipientChange} placeholder="090-1234-5678"
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">{t("order.zipCode")}</label>
                  <input type="text" name="defaultZipCode" value={recipient.defaultZipCode} onChange={handleRecipientChange} placeholder="123-4567"
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">{t("order.address")}</label>
                <input type="text" name="defaultAddress" value={recipient.defaultAddress} onChange={handleRecipientChange}
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">{t("order.note")}</label>
                <textarea name="defaultNote" value={recipient.defaultNote} onChange={handleRecipientChange} rows={2}
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>
              <button type="submit" disabled={recipientSaving} className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-700 disabled:bg-stone-300 transition">
                {recipientSaving ? t("profile.saving") : t("profile.saveRecipient")}
              </button>
            </form>
          ) : hasRecipient ? (
            <div className="bg-stone-50 rounded-lg p-4 space-y-1 text-sm">
              {recipient.defaultRecipientName && <p><span className="text-stone-500">{t("order.nameLabel")}:</span> <span className="font-medium text-slate-800">{recipient.defaultRecipientName}</span></p>}
              {recipient.defaultPhone && <p><span className="text-stone-500">{t("order.phoneLabel")}:</span> <span className="font-medium text-slate-800">{recipient.defaultPhone}</span></p>}
              {recipient.defaultZipCode && <p><span className="text-stone-500">{t("order.zipLabel")}:</span> <span className="font-medium text-slate-800">{recipient.defaultZipCode}</span></p>}
              {recipient.defaultAddress && <p><span className="text-stone-500">{t("order.addressLabel")}:</span> <span className="font-medium text-slate-800 break-all">{recipient.defaultAddress}</span></p>}
              {recipient.defaultNote && <p><span className="text-stone-500">{t("order.noteLabel")}:</span> <span className="font-medium text-slate-800">{recipient.defaultNote}</span></p>}
            </div>
          ) : (
            <p className="text-sm text-stone-400">{t("profile.recipientHint")}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
            <h2 className="text-lg font-bold text-slate-800">{t("profile.security")}</h2>
            <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              {showPasswordForm ? t("profile.close") : t("profile.changePassword")}</button></div>
          {showPasswordForm ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div><label className="block text-sm font-medium text-stone-500 mb-1">{t("profile.currentPw")}</label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword} autoComplete="current-password" onChange={handleChange} required
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <div><label className="block text-sm font-medium text-stone-500 mb-1">{t("profile.newPw")}</label>
                <input type="password" name="newPassword" value={passwordForm.newPassword} autoComplete="new-password" onChange={handleChange} required
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <div><label className="block text-sm font-medium text-stone-500 mb-1">{t("profile.confirmPwLabel")}</label>
                <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} autoComplete="new-password" onChange={handleChange} required
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <button type="submit" disabled={submitting} className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-700 disabled:bg-stone-300 transition">
                {submitting ? t("profile.changingPw") : t("profile.submitPw")}</button></form>
          ) : (<p className="text-sm text-stone-400">{t("profile.pwRecommend")}</p>)}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
