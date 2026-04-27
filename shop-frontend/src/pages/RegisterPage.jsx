import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
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

    try {
      await register(form);
      navigate("/products");
    } catch (err) {
      setError("登録に失敗しました。ユーザー名またはメールが既に使用されている可能性があります。");
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-md mx-auto pt-16 px-6">
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">会員登録</h1>
            <p className="text-stone-500 text-sm mt-1">新しいアカウントを作成</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
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
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-slate-700">メールアドレス</label>
              <input
                name="email"
                type="email"
                placeholder="メールアドレスを入力"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-stone-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                required
              />
            </div>

            <button className="w-full bg-amber-500 text-slate-900 py-3 rounded-lg hover:bg-amber-400 transition font-bold">
              登録する
            </button>
          </form>

          <p className="mt-6 text-center text-stone-500">
            既にアカウントをお持ちの方は{" "}
            <Link to="/login" className="text-amber-600 hover:text-amber-700 font-medium">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
