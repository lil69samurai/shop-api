import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          🛒 Shop
        </Link>

        <div className="flex gap-4 items-center">
          <Link to="/products" className="hover:text-gray-300">
            Products
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/orders" className="hover:text-gray-300">
                My Orders
              </Link>

              {isAdmin && (
                <Link to="/admin" className="text-yellow-400 hover:text-yellow-300">
                  Admin
                </Link>
              )}

              <span className="text-gray-400 text-sm">
                👤 {user?.username}
              </span>

              <button
                onClick={logout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;