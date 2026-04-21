import { Link } from "react-router-dom";

const AdminDashboardPage = () => {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/admin/products"
                className="border rounded p-6 text-center hover:shadow-lg transition"
              >
                <p className="text-4xl mb-2">📦</p>
                <p className="text-xl font-bold">Products</p>
                <p className="text-gray-500 mt-1">Manage products</p>
              </Link>

              <Link
                to="/admin/categories"
                className="border rounded p-6 text-center hover:shadow-lg transition"
              >
                <p className="text-4xl mb-2">📂</p>
                <p className="text-xl font-bold">Categories</p>
                <p className="text-gray-500 mt-1">Manage categories</p>
              </Link>

              <Link
                to="/admin/orders"
                className="border rounded p-6 text-center hover:shadow-lg transition"
              >
                <p className="text-4xl mb-2">📋</p>
                <p className="text-xl font-bold">Orders</p>
                <p className="text-gray-500 mt-1">Manage orders</p>
              </Link>
            </div>
          </div>
        );
      };

export default AdminDashboardPage;
