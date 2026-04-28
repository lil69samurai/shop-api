import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStatsApi } from '../api/statsApi';

const paymentMethodMap = {
  CREDIT_CARD: "\uD83D\uDCB3 \u30AF\u30EC\u30B8\u30C3\u30C8",
  BANK_TRANSFER: "\uD83C\uDFE6 \u632F\u8FBC",
  COD: "\uD83D\uDE9A \u4EE3\u5F15",
  CONVENIENCE: "\uD83C\uDFEA \u30B3\u30F3\u30D3\u30CB",
};

const statusStyleMap = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const statusLabelMap = {
  PENDING: "\u8655\u7406\u4E2D",
  PAID: "\u5DF2\u4ED8\u6B3E",
  SHIPPED: "\u5DF2\u51FA\u8CA8",
  DELIVERED: "\u5DF2\u9001\u9054",
  COMPLETED: "\u5DF2\u5B8C\u6210",
  CANCELLED: "\u5DF2\u53D6\u6D88",
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStatsApi();
        setStats(res.data || res);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const adminModules = [
    {
      title: "\u5546\u54C1\u7BA1\u7406",
      jp: "\u5546\u54C1\u7BA1\u7406 (Products)",
      desc: "\u65B0\u589E\u3001\u4FEE\u6539\u3001\u522A\u9664\u5546\u54C1\uFF0C\u4E26\u7BA1\u7406\u5546\u54C1\u5716\u7247\u8207\u5EAB\u5B58\u72C0\u614B\u3002",
      link: "/admin/products",
      btnText: "\u9032\u5165\u5546\u54C1\u7BA1\u7406",
      icon: "\uD83D\uDCE6",
    },
    {
      title: "\u5206\u985E\u7BA1\u7406",
      jp: "\u30AB\u30C6\u30B4\u30EA\u7BA1\u7406 (Categories)",
      desc: "\u5EFA\u7ACB\u8207\u7DAD\u8B77\u5546\u54C1\u5206\u985E\u7D50\u69CB\uFF0C\u4FDD\u6301\u76EE\u9304\u6E05\u6670\u3002",
      link: "/admin/categories",
      btnText: "\u9032\u5165\u5206\u985E\u7BA1\u7406",
      icon: "\uD83D\uDDC2\uFE0F",
    },
    {
      title: "\u8A02\u55AE\u7BA1\u7406",
      jp: "\u6CE8\u6587\u7BA1\u7406 (Orders)",
      desc: "\u6AA2\u8996\u5BA2\u6236\u8A02\u55AE\u3001\u8655\u7406\u51FA\u8CA8\u9032\u5EA6\u8207\u67E5\u770B\u8A02\u55AE\u660E\u7D30\u3002",
      link: "/admin/orders",
      btnText: "\u9032\u5165\u8A02\u55AE\u7BA1\u7406",
      icon: "\uD83D\uDCCB",
    },
    {
      title: "\u6703\u54E1\u7BA1\u7406",
      jp: "\u4F1A\u54E1\u7BA1\u7406 (Users)",
      desc: "\u6AA2\u8996\u6240\u6709\u8A3B\u518A\u6703\u54E1\u8CC7\u6599\uFF0C\u638C\u63E1\u5E73\u53F0\u4F7F\u7528\u8005\u72C0\u6CC1\u3002",
      link: "/admin/users",
      btnText: "\u9032\u5165\u6703\u54E1\u7BA1\u7406",
      icon: "\uD83D\uDC65",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b-2 border-slate-800 pb-6 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-wider">{"\u7BA1\u7406\u4E2D\u6A1E"}</h1>
          <p className="mt-2 text-sm md:text-base text-amber-600 font-medium tracking-widest">
            {"\u7BA1\u7406\u8005\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9"} <span className="text-slate-400">| ADMIN DASHBOARD</span>
          </p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-slate-200 p-6 shadow-sm">
                <p className="text-xs text-stone-500 font-medium tracking-widest mb-1">{"\u7E3D\u71DF\u6536"}</p>
                <p className="text-2xl md:text-3xl font-bold text-amber-600">{"\u00A5"}{Number(stats.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-stone-400 mt-1">TOTAL REVENUE</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 shadow-sm">
                <p className="text-xs text-stone-500 font-medium tracking-widest mb-1">{"\u8A02\u55AE\u6578"}</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-800">{stats.totalOrders || 0}</p>
                <p className="text-xs text-stone-400 mt-1">TOTAL ORDERS</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 shadow-sm">
                <p className="text-xs text-stone-500 font-medium tracking-widest mb-1">{"\u5546\u54C1\u6578"}</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-800">{stats.totalProducts || 0}</p>
                <p className="text-xs text-stone-400 mt-1">PRODUCTS</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 shadow-sm">
                <p className="text-xs text-stone-500 font-medium tracking-widest mb-1">{"\u6703\u54E1\u6578"}</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-800">{stats.totalUsers || 0}</p>
                <p className="text-xs text-stone-400 mt-1">MEMBERS</p>
              </div>
            </div>

            {/* Order Status + Recent Orders Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Order Status Breakdown */}
              <div className="bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">{"\uD83D\uDCCA \u8A02\u55AE\u72C0\u614B\u5206\u4F48"}</h3>
                {stats.ordersByStatus && Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-2">
                    <span className={"text-xs font-bold px-3 py-1 rounded-full " + (statusStyleMap[status] || "bg-stone-100 text-stone-600")}>
                      {statusLabelMap[status] || status}
                    </span>
                    <span className="font-bold text-slate-800">{count}</span>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">{"\uD83D\uDD50 \u6700\u65B0\u8A02\u55AE"}</h3>
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-slate-800">#{order.id} <span className="font-normal text-stone-500">{order.username}</span></p>
                          <p className="text-xs text-stone-400">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                            {order.paymentMethod && (" \u30FB " + (paymentMethodMap[order.paymentMethod] || order.paymentMethod))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-600">{"\u00A5"}{Number(order.totalAmount).toLocaleString()}</p>
                          <span className={"text-xs px-2 py-0.5 rounded-full " + (statusStyleMap[order.status] || "bg-stone-100")}>
                            {statusLabelMap[order.status] || order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 text-sm text-center py-4">{"\u5C1A\u7121\u8A02\u55AE"}</p>
                )}
                <Link to="/admin/orders" className="block text-center text-xs text-amber-600 hover:text-amber-700 font-medium mt-4 pt-3 border-t border-stone-100">
                  {"\u67E5\u770B\u6240\u6709\u8A02\u55AE \u2192"}
                </Link>
              </div>
            </div>

            {/* Low Stock Alert */}
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
              <div className="bg-white border border-red-200 shadow-sm p-6 mb-8">
                <h3 className="text-sm font-bold text-red-700 mb-4 pb-2 border-b border-red-100">{"\u26A0\uFE0F \u4F4E\u5EAB\u5B58\u8B66\u544A (\u5EAB\u5B58 \u2264 5)"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stats.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{product.name}</p>
                        <p className="text-xs text-stone-500">{"\u00A5"}{Number(product.price).toLocaleString()}</p>
                      </div>
                      <span className={"text-sm font-bold px-3 py-1 rounded-full " + (product.stock === 0 ? "bg-red-200 text-red-800" : "bg-amber-100 text-amber-800")}>
                        {product.stock === 0 ? "\u5DF2\u552E\u7F44" : ("\u5269\u4F59 " + product.stock + " \u4EF6")}
                      </span>
                    </div>
                  ))}
                </div>
                <Link to="/admin/products" className="block text-center text-xs text-red-600 hover:text-red-700 font-medium mt-4 pt-3 border-t border-red-100">
                  {"\u524D\u5F80\u5546\u54C1\u7BA1\u7406\u88DC\u8CA8 \u2192"}
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-8 text-center">
            <p className="text-amber-700 text-sm">{"\u7D71\u8A08\u8CC7\u6599\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66"}</p>
          </div>
        )}

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {adminModules.map((module, index) => (
            <div key={index} className="bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-3xl p-3 bg-slate-50 rounded-lg group-hover:bg-amber-50 transition-colors">
                    {module.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Module 0{index + 1}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{module.title}</h2>
                <p className="text-xs text-amber-600 font-medium mb-4 tracking-widest">{module.jp}</p>
                <p className="text-slate-600 text-sm mb-8 leading-relaxed min-h-[3rem]">{module.desc}</p>
                <Link to={module.link}
                  className="inline-flex items-center justify-center w-full bg-slate-900 text-white py-3 px-4 font-medium tracking-wider hover:bg-amber-600 transition-colors duration-300">
                  {module.btnText}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
