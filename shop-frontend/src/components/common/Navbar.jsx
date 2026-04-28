import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { t } = useTranslation();
  const { cartItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info(t("nav.logout") + " \u2714");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navLinkClass = (path) =>
    "font-medium transition text-sm " + (isActive(path)
      ? "text-amber-400"
      : "text-slate-300 hover:text-amber-400");

  return (
    <nav className={"sticky top-0 z-50 transition-all duration-300 " + (scrolled ? "bg-slate-900 shadow-lg" : "bg-slate-900 border-b border-slate-700")}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-amber-400 tracking-tight">\u7AF6\u9053</span>
            <span className="text-sm text-slate-500 font-medium hidden sm:block">CHIKUDO</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            <LanguageSwitcher />
            <div className="h-4 w-px bg-slate-700"></div>
            <Link to="/products" className={navLinkClass("/products")}>{t("nav.products")}</Link>

            <div className="h-4 w-px bg-slate-700"></div>

            <Link to="/cart" className="relative text-slate-300 hover:text-amber-400 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-amber-500 text-slate-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <div className="h-4 w-px bg-slate-700"></div>
                <Link to="/orders" className={navLinkClass("/orders")}>{t("nav.orders")}</Link>

                {isAdmin && (
                  <>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <Link to="/admin" className={"font-medium transition text-sm " + (isActive("/admin") ? "text-amber-300" : "text-amber-500 hover:text-amber-300")}>
                      {"\u2699 "}{t("nav.admin")}
                    </Link>
                  </>
                )}

                <div className="h-4 w-px bg-slate-700"></div>

                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-900 transition">
                    {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-amber-400 transition hidden lg:block">{user?.username}</span>
                </Link>

                <button onClick={handleLogout}
                  className="text-slate-500 hover:text-red-400 transition text-sm font-medium ml-1">
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <div className="h-4 w-px bg-slate-700"></div>
                <Link to="/login" className={navLinkClass("/login")}>{t("nav.login")}</Link>
                <Link to="/register" className="bg-amber-500 text-slate-900 px-4 py-1.5 rounded-lg hover:bg-amber-400 font-bold text-sm transition">
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/cart" className="relative text-slate-300 hover:text-amber-400 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-amber-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-4 space-y-1 animate-in">
            <div className="py-2 px-3"><LanguageSwitcher /></div>
            <Link to="/products" className={"block py-2 px-3 rounded-lg font-medium " + (isActive("/products") ? "bg-slate-800 text-amber-400" : "text-slate-300 hover:bg-slate-800")}>{t("nav.products")}</Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders" className={"block py-2 px-3 rounded-lg font-medium " + (isActive("/orders") ? "bg-slate-800 text-amber-400" : "text-slate-300 hover:bg-slate-800")}>{t("nav.orders")}</Link>
                <Link to="/profile" className={"block py-2 px-3 rounded-lg font-medium " + (isActive("/profile") ? "bg-slate-800 text-amber-400" : "text-slate-300 hover:bg-slate-800")}>
                  {"\u2694\uFE0F "}{user?.username}
                </Link>
                {isAdmin && (
                  <Link to="/admin" className={"block py-2 px-3 rounded-lg font-medium " + (isActive("/admin") ? "bg-slate-800 text-amber-300" : "text-amber-500 hover:bg-slate-800")}>{"\u2699 "}{t("nav.admin")}</Link>
                )}
                <div className="pt-2 mt-2 border-t border-slate-700">
                  <button onClick={handleLogout} className="block w-full text-left py-2 px-3 rounded-lg text-red-400 hover:bg-red-900/30 font-medium">{t("nav.logout")}</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={"block py-2 px-3 rounded-lg font-medium " + (isActive("/login") ? "bg-slate-800 text-amber-400" : "text-slate-300 hover:bg-slate-800")}>{t("nav.login")}</Link>
                <Link to="/register" className="block py-2 px-3 rounded-lg font-bold text-amber-400 hover:bg-slate-800">{t("nav.register")}</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
