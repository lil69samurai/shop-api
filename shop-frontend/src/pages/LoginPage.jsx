import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
      setError("ログインに失敗しました。ユーザー名とパスワードを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-md mx-auto pt-16 px-6">
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">ログイン</h1>
            <p className="text-stone-500 text-sm mt-1">アカウントにログインしてください</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="bg-amber-50 text-amber-700 p-3 rounded-lg mb-4 text-sm">
              サーバー起動中の場合があります。少々お待ちください...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-slate-700">ユーザー名</label>
              <input
                name="username"
                placeholder="ユーザー名を入力"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-stone-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-slate-700">パスワード</label>
              <input
                name="password"
                type="password"
                placeholder="パスワードを入力"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-stone-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 disabled:bg-stone-300 transition font-bold"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <p className="mt-6 text-center text-stone-500">
            アカウントをお持ちでない方は{" "}
            <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium">
              会員登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
