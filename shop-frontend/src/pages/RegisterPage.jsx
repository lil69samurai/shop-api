import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as authApi from "../api/authApi";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", confirmPassword: ""
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = t("register.validation.usernameRequired");
    } else if (formData.username.trim().length < 3 || formData.username.trim().length > 20 || !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = t("register.validation.usernameFormat");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = t("register.validation.emailRequired");
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t("register.validation.emailFormat");
    }
    if (!formData.password) {
      newErrors.password = t("register.validation.passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("register.validation.passwordLength");
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("register.validation.confirmRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("register.validation.confirmMismatch");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      await authApi.registerApi({
        username: formData.username, email: formData.email, password: formData.password
      });
      toast.success(t("register.success"));
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || t("register.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 border border-slate-200 shadow-xl relative overflow-hidden rounded-xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 tracking-widest">{t("register.title")}</h2>
          <p className="mt-2 text-sm text-slate-500 tracking-wider">{t("register.subtitle")}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t("register.username")} <span className="text-red-500">*</span></label>
            <input name="username" type="text" required value={formData.username} onChange={handleInputChange}
              placeholder={t("register.usernamePh")}
              className={"w-full p-3 border outline-none bg-stone-50 rounded-lg " + (errors.username ? "border-red-500" : "border-slate-300 focus:border-amber-500")} />
            {errors.username && <p className="mt-1 text-xs text-red-500 font-medium">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t("register.email")} <span className="text-red-500">*</span></label>
            <input name="email" type="email" required value={formData.email} onChange={handleInputChange}
              placeholder={t("register.emailPh")}
              className={"w-full p-3 border outline-none bg-stone-50 rounded-lg " + (errors.email ? "border-red-500" : "border-slate-300 focus:border-amber-500")} />
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t("register.password")} <span className="text-red-500">*</span></label>
            <input name="password" type="password" required value={formData.password} onChange={handleInputChange}
              placeholder={t("register.passwordPh")}
              className={"w-full p-3 border outline-none bg-stone-50 rounded-lg " + (errors.password ? "border-red-500" : "border-slate-300 focus:border-amber-500")} />
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t("register.confirmPassword")} <span className="text-red-500">*</span></label>
            <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleInputChange}
              placeholder={t("register.confirmPasswordPh")}
              className={"w-full p-3 border outline-none bg-stone-50 rounded-lg " + (errors.confirmPassword ? "border-red-500" : "border-slate-300 focus:border-amber-500")} />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading}
            className={"w-full py-4 px-4 font-bold text-white tracking-widest transition-all rounded-lg " + (loading ? "bg-slate-400" : "bg-slate-900 hover:bg-amber-600")}>
            {loading ? t("register.loading") : t("register.submit")}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-100 text-center">
          <p className="text-stone-500 text-sm">
            {t("register.hasAccount")}{" "}
            <Link to="/login" className="text-amber-600 hover:text-amber-700 font-bold">{t("register.loginLink")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
