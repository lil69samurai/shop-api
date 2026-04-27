import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.warning("ログインしてください");
      navigate("/login");
      return;
    }
    navigate("/orders/create");
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <div className="max-w-2xl mx-auto pt-20 text-center p-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-10">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">カートは空です</h2>
            <p className="text-stone-500 mb-6">商品を追加してお買い物を始めましょう</p>
            <Link to="/products" className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition font-medium">
              商品を見る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto pt-8 px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b border-stone-200">買い物かご</h1>

        <div className="flex flex-col gap-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white border border-stone-100 p-4 rounded-xl shadow-sm">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">{item.name}</h3>
                <p className="text-stone-500">単価: <span className="text-amber-600 font-bold">¥{item.price}</span></p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-stone-500">数量:</label>
                  <input
                    type="number"
                    min="1"
                    max={item.stockQuantity}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                    className="border border-stone-200 p-1 w-16 text-center rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="w-24 text-right">
                  <p className="font-bold text-lg text-slate-800">
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 font-medium px-3 py-1 bg-red-50 rounded-lg transition"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            合計: <span className="text-amber-600">¥{cartTotal.toFixed(2)}</span>
          </h2>
          <button
            onClick={handleCheckout}
            className="bg-amber-500 text-slate-900 px-8 py-3 rounded-lg text-lg font-bold hover:bg-amber-400 transition"
          >
            レジに進む
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
