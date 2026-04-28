import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { createOrderApi } from "../api/orderApi";
import { toast } from "react-toastify";

const CreateOrderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const paymentMethods = [
    { value: "CREDIT_CARD", label: t("paymentMethod.CREDIT_CARD"), icon: "💳", desc: "Visa / Mastercard / JCB" },
    { value: "BANK_TRANSFER", label: t("paymentMethod.BANK_TRANSFER"), icon: "🏦", desc: "" },
    { value: "COD", label: t("paymentMethod.COD"), icon: "🚚", desc: "(+330¥)" },
    { value: "CONVENIENCE", label: t("paymentMethod.CONVENIENCE"), icon: "🏪", desc: "" },
  ];

  const [form, setForm] = useState({ recipientName: "", phone: "", zipCode: "", address: "", paymentMethod: "", note: "" });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.recipientName.trim()) errors.recipientName = t("order.nameRequired");
    if (!form.phone.trim()) errors.phone = t("order.phoneRequired");
    else if (!/^[0-9\-]{10,15}$/.test(form.phone.trim())) errors.phone = t("order.phoneInvalid");
    if (!form.zipCode.trim()) errors.zipCode = t("order.zipRequired");
    else if (!/^\d{3}-?\d{4}$/.test(form.zipCode.trim())) errors.zipCode = t("order.zipInvalid");
    if (!form.address.trim()) errors.address = t("order.addressRequired");
    if (!form.paymentMethod) errors.paymentMethod = t("order.paymentRequired");
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => { if (validateForm()) { setStep(2); window.scrollTo(0, 0); } };

  const handleSubmit = async () => {
    if (cartItems.length === 0) { setError(t("order.emptyCart")); return; }
    setError(""); setSubmitting(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
        recipientName: form.recipientName.trim(), phone: form.phone.trim(),
        zipCode: form.zipCode.trim(), address: form.address.trim(),
        paymentMethod: form.paymentMethod, note: form.note.trim(),
      };
      const res = await createOrderApi(orderData);
      const orderId = res?.data?.id || res?.id;
      clearCart();
      toast.success(t("order.orderSuccess"));
      if (orderId) navigate("/orders/success/" + orderId); else navigate("/orders");
    } catch (err) {
      setError(t("order.orderFailed"));
      console.error("Create order failed", err);
    } finally { setSubmitting(false); }
  };

  const selectedPayment = paymentMethods.find((p) => p.value === form.paymentMethod);
  const codFee = form.paymentMethod === "COD" ? 330 : 0;
  const finalTotal = cartTotal + codFee;

  if (cartItems.length === 0) {
    return (
      <div className="bg-stone-50 min-h-screen"><div className="max-w-2xl mx-auto pt-20 text-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{t("order.emptyCart")}</h2>
          <p className="text-stone-500 mb-6">{t("order.emptyCartDesc")}</p>
          <Link to="/products" className="text-amber-600 hover:text-amber-700 underline font-medium">{t("home.shopNow")}</Link>
        </div></div></div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-12"><div className="max-w-3xl mx-auto pt-8 px-6">
      <div className="flex items-center justify-center mb-8"><div className="flex items-center gap-3">
        <div className={"w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold " + (step >= 1 ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-400")}>1</div>
        <span className={"text-sm font-medium " + (step >= 1 ? "text-slate-800" : "text-stone-400")}>{t("order.step1")}</span>
        <div className="w-12 h-0.5 bg-stone-300"></div>
        <div className={"w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold " + (step >= 2 ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-400")}>2</div>
        <span className={"text-sm font-medium " + (step >= 2 ? "text-slate-800" : "text-stone-400")}>{t("order.step2")}</span>
      </div></div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      {step === 1 && (<div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-stone-100 flex items-center gap-2"><span className="text-amber-500">📦</span> {t("order.shippingInfo")}</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">{t("order.name")} <span className="text-red-500">*</span></label>
              <input type="text" name="recipientName" value={form.recipientName} onChange={handleChange} placeholder={t("order.namePh2")} className={"w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 " + (formErrors.recipientName ? "border-red-400 bg-red-50" : "border-stone-200")} />
              {formErrors.recipientName && <p className="text-red-500 text-xs mt-1">{formErrors.recipientName}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t("order.phone")} <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="090-1234-5678" className={"w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 " + (formErrors.phone ? "border-red-400 bg-red-50" : "border-stone-200")} />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}</div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t("order.zipCode")} <span className="text-red-500">*</span></label>
                <input type="text" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="123-4567" className={"w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 " + (formErrors.zipCode ? "border-red-400 bg-red-50" : "border-stone-200")} />
                {formErrors.zipCode && <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>}</div></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">{t("order.address")} <span className="text-red-500">*</span></label>
              <input type="text" name="address" value={form.address} onChange={handleChange} placeholder={t("order.addressPh2")} className={"w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 " + (formErrors.address ? "border-red-400 bg-red-50" : "border-stone-200")} />
              {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}</div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">{t("order.note")}</label>
              <textarea name="note" value={form.note} onChange={handleChange} rows={2} placeholder={t("order.notePh2")} className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" /></div>
          </div></div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-stone-100 flex items-center gap-2"><span className="text-amber-500">💰</span> {t("order.payment")} <span className="text-red-500 text-sm">*</span></h2>
          <div className="grid grid-cols-2 gap-3">{paymentMethods.map((pm) => (
            <button key={pm.value} type="button" onClick={() => { setForm(prev => ({ ...prev, paymentMethod: pm.value })); if (formErrors.paymentMethod) setFormErrors(prev => ({ ...prev, paymentMethod: "" })); }}
              className={"p-4 border-2 rounded-xl text-left transition-all " + (form.paymentMethod === pm.value ? "border-amber-500 bg-amber-50 shadow-sm" : "border-stone-200 hover:border-stone-300")}>
              <div className="text-2xl mb-1">{pm.icon}</div>
              <div className="font-bold text-sm text-slate-800">{pm.label}</div>
              <div className="text-xs text-stone-500 mt-1">{pm.desc}</div></button>))}</div>
          {formErrors.paymentMethod && <p className="text-red-500 text-xs mt-2">{formErrors.paymentMethod}</p>}</div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-3 border-b border-stone-100">{t("order.cartContent")}</h2>
          <div className="space-y-2">{cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-2">
              <span className="text-slate-700">{item.name} <span className="text-stone-400">x{item.quantity}</span></span>
              <span className="font-medium text-slate-800">¥{(item.price * item.quantity).toFixed(0)}</span></div>))}</div>
          <div className="border-t border-stone-100 mt-3 pt-3 flex justify-between font-bold text-lg">
            <span>{t("order.total")}</span><span className="text-amber-600">¥{cartTotal.toFixed(0)}</span></div></div>

        <div className="flex gap-4">
          <Link to="/cart" className="flex-1 text-center bg-stone-200 text-stone-700 py-3 rounded-lg text-lg font-bold hover:bg-stone-300 transition">← {t("order.backToCart")}</Link>
          <button onClick={handleNextStep} className="flex-1 bg-amber-500 text-white py-3 rounded-lg text-lg font-bold hover:bg-amber-400 transition">{t("order.confirmOrder")} →</button></div>
      </div>)}

      {step === 2 && (<div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-stone-100">📋 {t("order.confirmTitle")}</h2>
          <div className="mb-6"><h3 className="text-sm font-bold text-amber-600 mb-3">{t("order.shippingDest")}</h3>
            <div className="bg-stone-50 rounded-lg p-4 space-y-1 text-sm">
              <p><span className="text-stone-500">{t("order.nameLabel")}:</span> <span className="font-medium text-slate-800">{form.recipientName}</span></p>
              <p><span className="text-stone-500">{t("order.phoneLabel")}:</span> <span className="font-medium text-slate-800">{form.phone}</span></p>
              <p><span className="text-stone-500">{t("order.zipLabel")}:</span> <span className="font-medium text-slate-800">{form.zipCode}</span></p>
              <p><span className="text-stone-500">{t("order.addressLabel")}:</span> <span className="font-medium text-slate-800">{form.address}</span></p>
              {form.note && <p><span className="text-stone-500">{t("order.noteLabel")}:</span> <span className="font-medium text-slate-800">{form.note}</span></p>}</div></div>
          <div className="mb-6"><h3 className="text-sm font-bold text-amber-600 mb-3">{t("order.payMethod")}</h3>
            <div className="bg-stone-50 rounded-lg p-4 flex items-center gap-3"><span className="text-2xl">{selectedPayment?.icon}</span>
              <div><p className="font-bold text-slate-800">{selectedPayment?.label}</p><p className="text-xs text-stone-500">{selectedPayment?.desc}</p></div></div></div>
          <div><h3 className="text-sm font-bold text-amber-600 mb-3">{t("order.orderItems")}</h3>
            <div className="space-y-2">{cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-stone-50 rounded-lg p-3">
                <div><p className="font-medium text-slate-800 text-sm">{item.name}</p>
                  <p className="text-xs text-stone-500">¥{item.price} × {item.quantity}</p></div>
                <p className="font-bold text-slate-800">¥{(item.price * item.quantity).toFixed(0)}</p></div>))}</div></div></div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6"><div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600"><span>{t("order.subtotalLabel")}</span><span>¥{cartTotal.toFixed(0)}</span></div>
          {codFee > 0 && <div className="flex justify-between text-sm text-slate-600"><span>{t("order.codFee")}</span><span>¥{codFee}</span></div>}
          <div className="flex justify-between text-sm text-slate-600"><span>{t("order.shippingLabel")}</span><span className="text-green-600 font-medium">{t("order.freeShipping")}</span></div>
          <div className="border-t border-stone-200 pt-3 mt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-slate-800">{t("order.totalPayment")}</span>
            <span className="text-2xl font-bold text-amber-600">¥{finalTotal.toFixed(0)}</span></div></div></div>

        <div className="flex gap-4">
          <button onClick={() => { setStep(1); window.scrollTo(0, 0); }} className="flex-1 text-center bg-stone-200 text-stone-700 py-3 rounded-lg text-lg font-bold hover:bg-stone-300 transition">← {t("order.goBack")}</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-amber-500 text-white py-3 rounded-lg text-lg font-bold hover:bg-amber-400 disabled:bg-stone-300 disabled:cursor-not-allowed transition">
            {submitting ? t("order.processing") : t("order.placeOrder")}</button></div>
      </div>)}
    </div></div>
  );
};

export default CreateOrderPage;
