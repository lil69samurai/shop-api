import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductsApi } from "../api/productApi";
import { getCategoriesApi } from "../api/categoryApi";
import { getAllOrdersApi } from "../api/orderApi";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    paidOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsData, categoriesData, ordersData] = await Promise.all([
          getProductsApi(0, 1),
          getCategoriesApi(),
          getAllOrdersApi(),
        ]);

        console.log("productsData:", productsData);
        console.log("categoriesData:", categoriesData);
        console.log("ordersData:", ordersData);
        const products = productsData.data;
        const categories = categoriesData.data || categoriesData || [];
        const orders = ordersData.data?.content || ordersData.data || ordersData || [];

        const totalRevenue = orders.reduce((sum, order) => {
          return sum + (parseFloat(order.totalAmount) || 0);
        }, 0);

        setStats({
          totalProducts: products.totalElements || 0,
          totalCategories: categories.length || 0,
          totalOrders: orders.length || 0,
          totalRevenue,
          pendingOrders: orders.filter((o) => o.status === "PENDING").length,
          paidOrders: orders.filter((o) => o.status === "PAID").length,
          deliveredOrders: orders.filter((o) => o.status === "DELIVERED").length,
          cancelledOrders: orders.filter((o) => o.status === "CANCELLED").length,
        });

        const sorted = [...orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentOrders(sorted.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-500 text-white rounded-lg p-6 shadow">
          <p className="text-sm opacity-80">Total Products</p>
          <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
        </div>
        <div className="bg-green-500 text-white rounded-lg p-6 shadow">
          <p className="text-sm opacity-80">Total Orders</p>
          <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
        </div>
        <div className="bg-yellow-500 text-white rounded-lg p-6 shadow">
          <p className="text-sm opacity-80">Total Revenue</p>
          <p className="text-3xl font-bold mt-2">${stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-purple-500 text-white rounded-lg p-6 shadow">
          <p className="text-sm opacity-80">Categories</p>
          <p className="text-3xl font-bold mt-2">{stats.totalCategories}</p>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Order Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.paidOrders}</p>
            <p className="text-sm text-gray-600 mt-1">Paid</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
            <p className="text-sm text-gray-600 mt-1">Delivered</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</p>
            <p className="text-sm text-gray-600 mt-1">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-blue-600 hover:underline text-sm">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Order ID</th>
                <th className="border p-2 text-left">Amount</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border p-2">#{order.id}</td>
                  <td className="border p-2">${parseFloat(order.totalAmount).toLocaleString()}</td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "PAID"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="border p-2 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/products"
          className="border rounded-lg p-6 text-center hover:shadow-lg transition bg-white">
          <p className="text-4xl mb-2">📦</p>
          <p className="text-xl font-bold">Products</p>
          <p className="text-gray-500 mt-1">Manage products</p>
        </Link>
        <Link to="/admin/categories"
          className="border rounded-lg p-6 text-center hover:shadow-lg transition bg-white">
          <p className="text-4xl mb-2">📂</p>
          <p className="text-xl font-bold">Categories</p>
          <p className="text-gray-500 mt-1">Manage categories</p>
        </Link>
        <Link to="/admin/orders"
          className="border rounded-lg p-6 text-center hover:shadow-lg transition bg-white">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-xl font-bold">Orders</p>
          <p className="text-gray-500 mt-1">Manage orders</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;