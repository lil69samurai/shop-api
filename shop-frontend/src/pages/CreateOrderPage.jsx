import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrderApi } from "../api/orderApi";
import { toast } from "react-toastify";

const paymentMethods = [
  { value: "CREDIT_CARD", label: "クレジットカード", icon: "\uD83D\uDCB3", desc: "Visa / Mastercard / JCB" },
  { value: "BANK_TRANSFER", label: "銀行振込", icon: "\uD83C\uDFE6", desc: "ご注文後にお振込先をご案内" },
  { value: "COD", label: "代金引換", icon: "\uD83D\uDE9A", desc: "商品お届け時にお支払い (+330\u5186)" },
  { value: "CONVENIENCE", label: "コンビニ払い", icon: "\uD83C\uDFEA", desc: "ローソン / セブン / ファミマ" },
];

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    recipientName: "",
    phone: "",
    zipCode: "",
    address: "",
    paymentMethod: "",
    note: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.recipientName.trim()) errors.recipientName = "\u304A\u540D\u524D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
    if (!form.phone.trim()) {
      errors.phone = "\u96FB\u8A71\u756A\u53F7\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
    } else if (!/^[0-9\-]{10,15}$/.test(form.phone.trim())) {
      errors.phone = "\u6B63\u3057\u3044\u96FB\u8A71\u756A\u53F7\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
    }
    if (!form.zipCode.trim()) {
      errors.zipCode = "\u90F5\u4FBF\u756A\u53F7\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
    } else if (!/^\d{3}-?\d{4}$/.test(form.zipCode.trim())) {
      errors.zipCode = "\u90F5\u4FBF\u756A\u53F7\u306E\u5F62\u5F0F: 000-0000";
    }
    if (!form.address.trim()) errors.address = "\u4F4F\u6240\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
    if (!form.paymentMethod) errors.paymentMethod = "\u304A\u652F\u6255\u3044\u65B9\u6CD5\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      setError("\u30AB\u30FC\u30C8\u304C\u7A7A\u3067\u3059");
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
        recipientName: form.recipientName.trim(),
        phone: form.phone.trim(),
        zipCode: form.zipCode.trim(),
        address: form.address.trim(),
        paymentMethod: form.paymentMethod,
        note: form.note.trim(),
      };
      await createOrderApi(orderData);
      clearCart();
      toast.success("\u6CE8\u6587\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F");
      navigate("/orders");
    } catch (err) {
      setError("\u6CE8\u6587\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
      console.error("Create order failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPayment = paymentMethods.find((p) => p.value === form.paymentMethod);
  const codFee = form.paymentMethod === "COD" ? 330 : 0;
  const finalTotal = cartTotal + codFee;

  if (cartItems.length === 0) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <div className="max-w-2xl mx-auto pt-20 text-center p-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{"\u30AB\u30FC\u30C8\u304C\u7A7A\u3067\u3059"}</h2>
            <p className="text-stone-500 mb-6">{"\u5148\u306B\u5546\u54C1\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044"}</p>
            <Link to="/products" className="text-amber-600 hover:text-amber-700 underline font-medium">{"\u5546\u54C1\u3092\u898B\u308B"}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="max-w-3xl mx-auto pt-8 px-6">

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-400"}`}>1</div>
            <span className={`text-sm font-medium ${step >= 1 ? "text-slate-800" : "text-stone-400"}`}>{"\u304A\u5C4A\u3051\u5148\u30FB\u304A\u652F\u6255\u3044"}</span>
            <div className="w-12 h-0.5 bg-stone-300"></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-400"}`}>2</div>
            <span className={`text-sm font-medium ${step >= 2 ? "text-slate-800" : "text-stone-400"}`}>{"\u6CE8\u6587\u78BA\u8A8D"}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* Step 1: Shipping + Payment */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-stone-100 flex items-center gap-2">
                <span className="text-amber-500">{"\uD83D\uDCE6"}</span> {"\u304A\u5C4A\u3051\u5148\u60C5\u5831"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{"\u304A\u540D\u524D"} <span className="text-red-500">*</span></label>
                  <input type="text" name="recipientName" value={form.recipientName} onChange={handleChange}
                    placeholder={"\u4F8B: \u5C71\u7530\u592A\u90CE"} className={"w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 " + (formErrors.recipientName ? "border-red-400 bg-red-50" : "border-stone-200")} />
                  {formErrors.recipientName && <p className="text-red-500 text-xs mt-1">{formErrors.recipientName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{"\u96FB\u8A71\u756A\u53F7"} <span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                      placeholder="090-1234-5678" className={"w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 " + (formErrors.phone ? "border-red-400 bg-red-50" : "border-stone-200")} />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{"\u90F5\u4FBF\u756A\u53F7"} <span className="text-red-500">*</span></label>
                    <input type="text" name="zipCode" value={form.zipCode} onChange={handleChange}
                      placeholder="123-4567" className={"w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 " + (formErrors.zipCode ? "border-red-400 bg-red-50" : "border-stone-200")} />
                    {formErrors.zipCode && <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{"\u4F4F\u6240"} <span className="text-red-500">*</span></label>
                  <input type="text" name="address" value={form.address} onChange={handleChange}
                    placeholder={"\u4F8B: \u6771\u4EAC\u90FD\u6E0B\u8C37\u533A\u795E\u5BAE\u524D1-2-3"} className={"w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 " + (formErrors.address ? "border-red-400 bg-red-50" : "border-stone-200")} />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{"\u5099\u8003"}</label>
                  <textarea name="note" value={form.note} onChange={handleChange} rows={2}
                    placeholder={"\u914D\u9001\u306B\u95A2\u3059\u308B\u3054\u8981\u671B\u306A\u3069"} className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-stone-100 flex items-center gap-2">
                <span className="text-amber-500">{"\uD83D\uDCB0"}</span> {"\u304A\u652F\u6255\u3044\u65B9\u6CD5"} <span className="text-red-500 text-sm">*</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((pm) => (
                  <button key={pm.value} type="button"
                    onClick={() => { setForm(prev => ({ ...prev, paymentMethod: pm.value })); if (formErrors.paymentMethod) setFormErrors(prev => ({ ...prev, paymentMethod: "" })); }}
                    className={"p-4 border-2 rounded-xl text-left transition-all " + (form.paymentMethod === pm.value ? "border-amber-500 bg-amber-50 shadow-sm" : "border-stone-200 hover:border-stone-300")}>
                    <div className="text-2xl mb-1">{pm.icon}</div>
                    <div className="font-bold text-sm text-slate-800">{pm.label}</div>
                    <div className="text-xs text-stone-500 mt-1">{pm.desc}</div>
                  </button>
                ))}
              </div>
              {formErrors.paymentMethod && <p className="text-red-500 text-xs mt-2">{formErrors.paymentMethod}</p>}
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 pb-3 border-b border-stone-100">{"\u30AB\u30FC\u30C8\u5185\u5BB9"}</h2>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-2">
                    <span className="text-slate-700">{item.name} <span className="text-stone-400">x{item.quantity}</span></span>
                    <span className="font-medium text-slate-800">{"\u00A5"}{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-100 mt-3 pt-3 flex justify-between font-bold text-lg">
                <span>{"\u5408\u8A08"}</span>
                <span className="text-amber-600">{"\u00A5"}{cartTotal.toFixed(0)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link to="/cart" className="flex-1 text-center bg-stone-200 text-stone-700 py-3 rounded-lg text-lg font-bold hover:bg-stone-300 transition">
                {"\u2190 \u30AB\u30FC\u30C8\u306B\u623B\u308B"}
              </Link>
              <button onClick={handleNextStep}
                className="flex-1 bg-amber-500 text-white py-3 rounded-lg text-lg font-bold hover:bg-amber-400 transition">
                {"\u6CE8\u6587\u5185\u5BB9\u3092\u78BA\u8A8D \u2192"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-stone-100">{"\uD83D\uDCCB \u6CE8\u6587\u5185\u5BB9\u306E\u78BA\u8A8D"}</h2>

              {/* Shipping Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-amber-600 mb-3">{"\u304A\u5C4A\u3051\u5148"}</h3>
                <div className="bg-stone-50 rounded-lg p-4 space-y-1 text-sm">
                  <p><span className="text-stone-500">{"\u304A\u540D\u524D:"}</span> <span className="font-medium text-slate-800">{form.recipientName}</span></p>
                  <p><span className="text-stone-500">{"\u96FB\u8A71:"}</span> <span className="font-medium text-slate-800">{form.phone}</span></p>
                  <p><span className="text-stone-500">{"\u90F5\u4FBF\u756A\u53F7:"}</span> <span className="font-medium text-slate-800">{form.zipCode}</span></p>
                  <p><span className="text-stone-500">{"\u4F4F\u6240:"}</span> <span className="font-medium text-slate-800">{form.address}</span></p>
                  {form.note && <p><span className="text-stone-500">{"\u5099\u8003:"}</span> <span className="font-medium text-slate-800">{form.note}</span></p>}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-amber-600 mb-3">{"\u304A\u652F\u6255\u3044\u65B9\u6CD5"}</h3>
                <div className="bg-stone-50 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-2xl">{selectedPayment?.icon}</span>
                  <div>
                    <p className="font-bold text-slate-800">{selectedPayment?.label}</p>
                    <p className="text-xs text-stone-500">{selectedPayment?.desc}</p>
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h3 className="text-sm font-bold text-amber-600 mb-3">{"\u6CE8\u6587\u5546\u54C1"}</h3>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-stone-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-stone-500">{"\u00A5"}{item.price} {"\u00D7"} {item.quantity}</p>
                      </div>
                      <p className="font-bold text-slate-800">{"\u00A5"}{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{"\u5C0F\u8A08"}</span>
                  <span>{"\u00A5"}{cartTotal.toFixed(0)}</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{"\u4EE3\u5F15\u304D\u624B\u6570\u6599"}</span>
                    <span>{"\u00A5"}{codFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{"\u9001\u6599"}</span>
                  <span className="text-green-600 font-medium">{"\u7121\u6599"}</span>
                </div>
                <div className="border-t border-stone-200 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800">{"\u304A\u652F\u6255\u3044\u5408\u8A08"}</span>
                  <span className="text-2xl font-bold text-amber-600">{"\u00A5"}{finalTotal.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={() => { setStep(1); window.scrollTo(0, 0); }}
                className="flex-1 text-center bg-stone-200 text-stone-700 py-3 rounded-lg text-lg font-bold hover:bg-stone-300 transition">
                {"\u2190 \u4FEE\u6B63\u3059\u308B"}
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-amber-500 text-white py-3 rounded-lg text-lg font-bold hover:bg-amber-400 disabled:bg-stone-300 disabled:cursor-not-allowed transition">
                {submitting ? "\u51E6\u7406\u4E2D..." : "\u6CE8\u6587\u3092\u78BA\u5B9A\u3059\u308B"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateOrderPage;
