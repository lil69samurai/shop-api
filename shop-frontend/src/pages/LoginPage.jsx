import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
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
      setError("\u30ED\u30B0\u30A4\u30F3\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u30E6\u30FC\u30B6\u30FC\u540D\u3068\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold text-amber-500 tracking-tight">{"\u7AF9\u9053"} CHIKUDO</Link>
          <p className="text-stone-400 text-sm mt-2 tracking-widest">{"\u2500\u2500 \u5263\u9053\u5177\u5C02\u9580\u5E97 \u2500\u2500"}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-amber-500"></div>

          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800">{"\u30ED\u30B0\u30A4\u30F3"}</h1>
              <p className="text-stone-500 text-sm mt-1">{"\u30A2\u30AB\u30A6\u30F3\u30C8\u306B\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044"}</p>
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
                {"\u30B5\u30FC\u30D0\u30FC\u8D77\u52D5\u4E2D\u306E\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002\u5C11\u3005\u304A\u5F85\u3061\u304F\u3060\u3055\u3044..."}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">{"\u30E6\u30FC\u30B6\u30FC\u540D"}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input name="username" placeholder={"\u30E6\u30FC\u30B6\u30FC\u540D\u3092\u5165\u529B"} value={form.username}
                    onChange={handleChange} autoComplete="username" required
                    className="w-full border border-stone-200 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">{"\u30D1\u30B9\u30EF\u30FC\u30C9"}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input name="password" type="password" placeholder={"\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u529B"} value={form.password}
                    onChange={handleChange} autoComplete="current-password" required
                    className="w-full border border-stone-200 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 disabled:bg-stone-300 transition font-bold text-lg">
                {loading ? "\u30ED\u30B0\u30A4\u30F3\u4E2D..." : "\u30ED\u30B0\u30A4\u30F3"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-stone-100 text-center">
              <p className="text-stone-500 text-sm">
                {"\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u304A\u6301\u3061\u3067\u306A\u3044\u65B9\u306F"}{" "}
                <Link to="/register" className="text-amber-600 hover:text-amber-700 font-bold">{"\u4F1A\u54E1\u767B\u9332"}</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Guest browsing link */}
        <div className="text-center mt-6">
          <Link to="/products" className="text-sm text-stone-400 hover:text-amber-600 transition">
            {"\u30ED\u30B0\u30A4\u30F3\u305B\u305A\u306B\u5546\u54C1\u3092\u898B\u308B \u2192"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
