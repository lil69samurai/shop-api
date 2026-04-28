import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { getImageSrc } from "../utils/config";

const CartPage = () => {
  const { t } = useTranslation();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.warning(t("cart.loginRequired"));
      navigate("/login");
      return;
    }
    navigate("/orders/create");
  };

  const handleQuantityChange = (id, delta, currentQty, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (maxStock && newQty > maxStock) {
      toast.warning(t("cart.stockLimit"));
      return;
    }
    updateQuantity(id, newQty);
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <div className="max-w-2xl mx-auto pt-20 text-center p-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-10">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{t("cart.empty")}</h2>
            <p className="text-stone-500 mb-6">{t("cart.emptyDesc")}</p>
            <Link to="/products" className="inline-block bg-amber-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-400 transition">
              {t("cart.browse")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="max-w-4xl mx-auto pt-8 px-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t("cart.cartName")}</h1>
            <p className="text-sm text-stone-400 mt-1">{cartItems.length}{t("cart.itemTypes")}</p>
          </div>
          <button onClick={() => { if (window.confirm(t("cart.clearConfirm"))) clearCart(); }}
            className="text-sm text-red-500 hover:text-red-700 px-3 py-1 bg-red-50 rounded-lg transition">
            {t("cart.clearCart")}
          </button>
        </div>

        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="flex items-center p-4 gap-4">
                <Link to={"/products/" + item.id} className="flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={getImageSrc(item.imageUrl)} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center text-stone-300">
                      <span className="text-2xl">🖼️</span>
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={"/products/" + item.id}>
                    <h3 className="text-lg font-bold text-slate-800 hover:text-amber-600 transition truncate">{item.name}</h3>
                  </Link>
                  <p className="text-amber-600 font-bold mt-1">¥{Number(item.price).toLocaleString()}</p>
                  {item.categoryName && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{item.categoryName}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                    className="w-9 h-9 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-slate-700 font-bold transition text-lg">−</button>
                  <input type="number" min="1" value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Math.max(1, Number(e.target.value)))}
                    className="w-14 h-9 border border-stone-200 text-center rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  <button onClick={() => handleQuantityChange(item.id, 1, item.quantity, item.stockQuantity || item.stock)}
                    className="w-9 h-9 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-slate-700 font-bold transition text-lg">+</button>
                </div>
                <div className="w-28 text-right flex-shrink-0">
                  <p className="font-bold text-lg text-slate-800">¥{(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)}
                  className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 hover:text-red-700 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-stone-100 p-6">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-stone-500">
              <span>{t("cart.subtotal")} ({cartItems.length}{t("cart.items")})</span>
              <span>¥{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-500">
              <span>{t("cart.shippingFee")}</span>
              <span className="text-green-600 font-medium">{t("cart.free")}</span>
            </div>
            <div className="border-t border-stone-200 pt-3 flex justify-between items-center">
              <span className="text-xl font-bold text-slate-800">{t("cart.total")}</span>
              <span className="text-2xl font-bold text-amber-600">¥{cartTotal.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Link to="/products" className="flex-1 text-center bg-stone-200 text-stone-700 py-3 rounded-lg font-bold hover:bg-stone-300 transition">
              ← {t("cart.continueShopping")}
            </Link>
            <button onClick={handleCheckout} className="flex-1 bg-amber-500 text-white py-3 rounded-lg text-lg font-bold hover:bg-amber-400 transition">
              {t("cart.checkout")} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
