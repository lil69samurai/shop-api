import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrderApi } from "../api/orderApi";
import { toast } from "react-toastify";

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      setError("カートが空です");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };
      await createOrderApi(orderData);
      clearCart();
      toast.success("注文が完了しました");
      navigate("/orders");
    } catch (err) {
      setError("注文に失敗しました。もう一度お試しください。");
      console.error("Create order failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <div className="max-w-2xl mx-auto pt-20 text-center p-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">カートが空です</h2>
            <p className="text-stone-500 mb-6">先に商品を選んでください</p>
            <Link to="/products" className="text-amber-600 hover:text-amber-700 underline font-medium">商品を見る</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-3xl mx-auto pt-8 px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b border-stone-200">注文確認</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white border border-stone-100 p-4 rounded-xl shadow-sm">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{item.name}</h3>
                <p className="text-stone-500">単価: ¥{item.price} × {item.quantity}</p>
              </div>
              <p className="text-lg font-bold text-amber-600">
                ¥{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              合計: <span className="text-amber-600">¥{cartTotal.toFixed(2)}</span>
            </h2>
          </div>

          <div className="flex gap-4">
            <Link
              to="/cart"
              className="flex-1 text-center bg-stone-200 text-stone-700 py-3 rounded-lg text-lg font-bold hover:bg-stone-300 transition"
            >
              ← カートに戻る
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-amber-500 text-slate-900 py-3 rounded-lg text-lg font-bold hover:bg-amber-400 disabled:bg-stone-300 disabled:cursor-not-allowed transition"
            >
              {submitting ? "処理中..." : "注文を確定する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
