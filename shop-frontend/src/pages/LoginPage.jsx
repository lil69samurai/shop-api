import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/products");
    } catch (err) {
      console.error("Login failed:", err);
      setError(t("login.failed"));
    } finally {
      setLoading(false);
    }
  };

  // Google Login callback
  const handleGoogleResponse = async (response) => {
    setError("");
    setLoading(true);
    try {
      await googleLogin(response.credential);
      navigate("/products");
    } catch (err) {
      console.error("Google login failed:", err);
      setError(t("login.googleFailed") || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Sign-In button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
        const btnDiv = document.getElementById("google-signin-btn");
        if (btnDiv) {
          window.google.accounts.id.renderButton(btnDiv, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
            shape: "rectangular",
          });
        }
      }
    };

    // If GSI script already loaded
    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    // Load GSI script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);

    return () => {
      // Cleanup: don't remove script (may be used by other components)
    };
  }, []);

  return (
    <div className="bg-stone-50 min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold text-amber-500 tracking-tight">{t("home.brandSub")}</Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="h-1 bg-amber-500"></div>
          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800">{t("login.title")}</h1>
              <p className="text-stone-500 text-sm mt-1">{t("login.subtitle")}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {loading && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-500"></div>
                {t("login.serverWait")}
              </div>
            )}

            {/* Google Login Button */}
            <div className="mb-4">
              <div id="google-signin-btn" className="flex justify-center"></div>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-stone-400">{t("login.orDivider") || "OR"}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">{t("login.username")}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input name="username" placeholder={t("login.usernamePh")} value={form.username}
                    onChange={handleChange} autoComplete="username" required
                    className="w-full border border-stone-200 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">{t("login.password")}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input name="password" type="password" placeholder={t("login.passwordPh")} value={form.password}
                    onChange={handleChange} autoComplete="current-password" required
                    className="w-full border border-stone-200 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 disabled:bg-stone-300 transition font-bold text-lg">
                {loading ? t("login.loading") : t("login.submit")}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-stone-100 text-center">
              <p className="text-stone-500 text-sm">
                {t("login.noAccount")}{" "}
                <Link to="/register" className="text-amber-600 hover:text-amber-700 font-bold">{t("login.registerLink")}</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/products" className="text-sm text-stone-400 hover:text-amber-600 transition">
            {t("login.guestBrowse")} \u2192
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
