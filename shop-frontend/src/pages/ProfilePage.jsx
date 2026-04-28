import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { changePasswordApi } from "../api/authApi";
import { getMyOrdersApi } from "../api/orderApi";
import { toast } from "react-toastify";

const statusMap = {
  PENDING: { label: "\u4FDD\u7559\u4E2D", style: "bg-amber-100 text-amber-700" },
  PAID: { label: "\u652F\u6255\u6E08\u307F", style: "bg-green-100 text-green-700" },
  SHIPPED: { label: "\u767A\u9001\u6E08\u307F", style: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "\u914D\u9054\u6E08\u307F", style: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "\u5B8C\u4E86", style: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "\u30AD\u30E3\u30F3\u30BB\u30EB", style: "bg-red-100 text-red-700" },
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({ total: 0, totalSpent: 0 });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrdersApi();
        const orderList = data.data?.content || data.data || [];
        const orders = Array.isArray(orderList) ? orderList : [];
        setRecentOrders(orders.slice(0, 3));
        const totalSpent = orders
          .filter(o => o.status !== "CANCELLED")
          .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        setOrderStats({ total: orders.length, totalSpent });
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const handleChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("\u65B0\u3057\u3044\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("\u30D1\u30B9\u30EF\u30FC\u30C9\u306F6\u6587\u5B57\u4EE5\u4E0A\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");
      return;
    }
    setSubmitting(true);
    try {
      await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5909\u66F4\u3057\u307E\u3057\u305F");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (error) {
      const message = error.response?.data?.message || "\u30D1\u30B9\u30EF\u30FC\u30C9\u306E\u5909\u66F4\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="max-w-3xl mx-auto pt-8 px-6">

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-amber-400 flex-shrink-0">
              {user.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">{user.username}</h1>
              <p className="text-stone-500 text-sm mt-1">{user.email}</p>
              <span className={"inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium " + (
                user.role === "ROLE_ADMIN" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
              )}>
                {user.role === "ROLE_ADMIN" ? "\u7BA1\u7406\u8005" : "\u4E00\u822C\u30E6\u30FC\u30B6\u30FC"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 text-center">
            <p className="text-3xl font-bold text-slate-800">{orderStats.total}</p>
            <p className="text-xs text-stone-400 mt-1">{"\u7DCF\u6CE8\u6587\u6570"}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 text-center">
            <p className="text-3xl font-bold text-amber-600">{"\u00A5"}{orderStats.totalSpent.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-1">{"\u7D2F\u8A08\u8CFC\u5165\u984D"}</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
            <h2 className="text-lg font-bold text-slate-800">{"\u6700\u8FD1\u306E\u6CE8\u6587"}</h2>
            <Link to="/orders" className="text-sm text-amber-600 hover:text-amber-700 font-medium">{"\u3059\u3079\u3066\u898B\u308B \u2192"}</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-stone-400 text-sm mb-3">{"\u307E\u3060\u6CE8\u6587\u304C\u3042\u308A\u307E\u305B\u3093"}</p>
              <Link to="/products" className="text-amber-600 hover:text-amber-700 underline text-sm">{"\u5546\u54C1\u3092\u898B\u308B"}</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const status = statusMap[order.status] || { label: order.status, style: "bg-stone-100 text-stone-600" };
                return (
                  <Link key={order.id} to={"/orders/" + order.id}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{"\u6CE8\u6587"} #{order.id}</p>
                      <p className="text-xs text-stone-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("ja-JP") : "-"}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + status.style}>{status.label}</span>
                      <span className="font-bold text-amber-600">{"\u00A5"}{Number(order.totalAmount).toLocaleString()}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/orders" className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 text-center hover:shadow-md transition group">
            <div className="text-2xl mb-2">{"\uD83D\uDCCB"}</div>
            <p className="font-bold text-slate-800 group-hover:text-amber-600 transition">{"\u6CE8\u6587\u5C65\u6B74"}</p>
          </Link>
          <Link to="/cart" className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 text-center hover:shadow-md transition group">
            <div className="text-2xl mb-2">{"\uD83D\uDED2"}</div>
            <p className="font-bold text-slate-800 group-hover:text-amber-600 transition">{"\u30AB\u30FC\u30C8"}</p>
          </Link>
        </div>

        {/* Password Change */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
            <h2 className="text-lg font-bold text-slate-800">{"\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3"}</h2>
            <button onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              {showPasswordForm ? "\u9589\u3058\u308B" : "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5909\u66F4"}
            </button>
          </div>

          {showPasswordForm ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">{"\u73FE\u5728\u306E\u30D1\u30B9\u30EF\u30FC\u30C9"}</label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword}
                  autoComplete="current-password" onChange={handleChange} required
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">{"\u65B0\u3057\u3044\u30D1\u30B9\u30EF\u30FC\u30C9"}</label>
                <input type="password" name="newPassword" value={passwordForm.newPassword}
                  autoComplete="new-password" onChange={handleChange} required
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">{"\u65B0\u3057\u3044\u30D1\u30B9\u30EF\u30FC\u30C9\uFF08\u78BA\u8A8D\uFF09"}</label>
                <input type="password" name="confirmPassword" value={passwordForm.confirmPassword}
                  autoComplete="new-password" onChange={handleChange} required
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-700 disabled:bg-stone-300 transition">
                {submitting ? "\u5909\u66F4\u4E2D..." : "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5909\u66F4"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-stone-400">{"\u30D1\u30B9\u30EF\u30FC\u30C9\u306F\u5B9A\u671F\u7684\u306B\u5909\u66F4\u3059\u308B\u3053\u3068\u3092\u304A\u52E7\u3081\u3057\u307E\u3059\u3002"}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
