import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";

const Divider = () => (
  <div className="h-5 w-px bg-slate-600" />
);

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info("\u30ed\u30b0\u30a2\u30a6\u30c8\u3057\u307e\u3057\u305f");
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-extrabold text-amber-400 tracking-tight">
            \u2694\ufe0f \u6b66\u58eb\u306e\u9053
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/products" className="text-slate-300 hover:text-amber-400 font-medium transition">
              \u5546\u54c1\u4e00\u89a7
            </Link>

            <Divider />

            <Link to="/cart" className="relative text-slate-300 hover:text-amber-400 font-medium transition">
              \u8cb7\u3044\u7269\u304b\u3054
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Divider />
                <Link to="/orders" className="text-slate-300 hover:text-amber-400 font-medium transition">
                  \u6ce8\u6587\u5c65\u6b74
                </Link>

                {isAdmin && (
                  <>
                    <Divider />
                    <Link to="/admin" className="text-amber-400 hover:text-amber-300 font-medium transition">
                      \u2699 \u7ba1\u7406
                    </Link>
                  </>
                )}

                <Divider />

                <Link to="/profile" className="text-slate-400 hover:text-amber-400 transition">
                  \u2694\ufe0f {user?.username}
                </Link>

                <Divider />

                <button
                  onClick={handleLogout}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg hover:bg-red-900 hover:text-red-300 font-medium transition"
                >
                  \u30ed\u30b0\u30a2\u30a6\u30c8
                </button>
              </>
            ) : (
              <>
                <Divider />
                <Link to="/login" className="text-slate-300 hover:text-amber-400 font-medium transition">
                  \u30ed\u30b0\u30a4\u30f3
                </Link>
                <Divider />
                <Link to="/register" className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-amber-400 font-bold transition">
                  \u4f1a\u54e1\u767b\u9332
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-amber-400"
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
          <div className="md:hidden border-t border-slate-700 py-4 space-y-3">
            <Link to="/products" onClick={closeMenu} className="block text-slate-300 hover:text-amber-400 font-medium">\u5546\u54c1\u4e00\u89a7</Link>
            <hr className="border-slate-700" />
            <Link to="/cart" onClick={closeMenu} className="block text-slate-300 hover:text-amber-400 font-medium">
              \u8cb7\u3044\u7269\u304b\u3054 {cartItemCount > 0 && "(" + cartItemCount + ")"}
            </Link>
            {isAuthenticated ? (
              <>
                <hr className="border-slate-700" />
                <Link to="/orders" onClick={closeMenu} className="block text-slate-300 hover:text-amber-400 font-medium">\u6ce8\u6587\u5c65\u6b74</Link>
                {isAdmin && (
                  <>
                    <hr className="border-slate-700" />
                    <Link to="/admin" onClick={closeMenu} className="block text-amber-400 hover:text-amber-300 font-medium">\u2699 \u7ba1\u7406</Link>
                  </>
                )}
                <hr className="border-slate-700" />
                <Link to="/profile" onClick={closeMenu} className="block text-slate-400 hover:text-amber-400">\u2694\ufe0f {user?.username}</Link>
                <hr className="border-slate-700" />
                <button onClick={handleLogout} className="block w-full text-left text-red-400 hover:text-red-300 font-medium">\u30ed\u30b0\u30a2\u30a6\u30c8</button>
              </>
            ) : (
              <>
                <hr className="border-slate-700" />
                <Link to="/login" onClick={closeMenu} className="block text-slate-300 hover:text-amber-400 font-medium">\u30ed\u30b0\u30a4\u30f3</Link>
                <hr className="border-slate-700" />
                <Link to="/register" onClick={closeMenu} className="block text-amber-400 hover:text-amber-300 font-bold">\u4f1a\u54e1\u767b\u9332</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
