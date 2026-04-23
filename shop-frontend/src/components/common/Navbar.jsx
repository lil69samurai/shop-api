import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import { toast } from 'react-toastify';


const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully!");
  };
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
         Shop
        </Link>

        <div className="flex gap-4 items-center">
          <Link to="/products" className="hover:text-gray-300">
            Products
          </Link>

        <Link to="/cart" className="relative hover:text-gray-300">
            🛒 Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
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
                onClick={handleLogout}
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