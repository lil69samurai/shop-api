import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";

const Divider = () => (
  <div className="h-5 w-px bg-gray-300" />
);

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully!");
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-extrabold text-blue-600 tracking-tight">
            Sean\'s Shop
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/products" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Products
            </Link>

            <Divider />

            <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 font-medium transition">
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Divider />
                <Link to="/orders" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Orders
                </Link>

                {isAdmin && (
                  <>
                    <Divider />
                    <Link to="/admin" className="text-amber-600 hover:text-amber-700 font-medium transition">
                      Admin
                    </Link>
                  </>
                )}

                <Divider />

                <Link to="/profile" className="text-gray-500 hover:text-blue-600 transition">
                  {user?.username}
                </Link>

                <Divider />

                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Divider />
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Login
                </Link>
                <Divider />
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            <Link to="/products" onClick={closeMenu} className="block text-gray-600 hover:text-blue-600 font-medium">Products</Link>
            <hr className="border-gray-200" />
            <Link to="/cart" onClick={closeMenu} className="block text-gray-600 hover:text-blue-600 font-medium">
              Cart {cartItemCount > 0 && "(" + cartItemCount + ")"}
            </Link>
            {isAuthenticated ? (
              <>
                <hr className="border-gray-200" />
                <Link to="/orders" onClick={closeMenu} className="block text-gray-600 hover:text-blue-600 font-medium">Orders</Link>
                {isAdmin && (
                  <>
                    <hr className="border-gray-200" />
                    <Link to="/admin" onClick={closeMenu} className="block text-amber-600 hover:text-amber-700 font-medium">Admin</Link>
                  </>
                )}
                <hr className="border-gray-200" />
                <Link to="/profile" onClick={closeMenu} className="block text-gray-500 hover:text-blue-600">{user?.username}</Link>
                <hr className="border-gray-200" />
                <button onClick={handleLogout} className="block w-full text-left text-red-600 hover:text-red-700 font-medium">Logout</button>
              </>
            ) : (
              <>
                <hr className="border-gray-200" />
                <Link to="/login" onClick={closeMenu} className="block text-gray-600 hover:text-blue-600 font-medium">Login</Link>
                <hr className="border-gray-200" />
                <Link to="/register" onClick={closeMenu} className="block text-blue-600 hover:text-blue-700 font-medium">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
