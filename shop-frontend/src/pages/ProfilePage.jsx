import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { changePasswordApi } from "../api/authApi";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { user } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("新しいパスワードが一致しません");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("パスワードは6文字以上で入力してください");
      return;
    }

    setSubmitting(true);
    try {
      await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("パスワードを変更しました");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message = error.response?.data?.message || "パスワードの変更に失敗しました";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-10 text-stone-400">読み込み中...</div>;
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-2xl mx-auto pt-8 px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">マイページ</h1>

        <div className="bg-white border border-stone-100 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-stone-100">
            アカウント情報
          </h2>
          <div className="space-y-3">
            <div className="flex">
              <span className="w-36 font-medium text-stone-500">ユーザー名:</span>
              <span className="text-slate-800">{user.username}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-medium text-stone-500">メール:</span>
              <span className="text-slate-800">{user.email}</span>
            </div>
            <div className="flex items-center">
              <span className="w-36 font-medium text-stone-500">権限:</span>
              <span className={"text-xs px-3 py-1 rounded-full font-medium " + (
                user.role === "ROLE_ADMIN"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              )}>
                {user.role === "ROLE_ADMIN" ? "管理者" : "一般ユーザー"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-stone-100">
            パスワード変更
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-500 mb-1">現在のパスワード</label>
              <input
                type="password"
                name="currentPassword"
                autoComplete="current-password"
                onChange={handleChange}
                required
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-500 mb-1">新しいパスワード</label>
              <input
                type="password"
                name="newPassword"
                autoComplete="new-password"
                onChange={handleChange}
                required
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-500 mb-1">新しいパスワード（確認）</label>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                onChange={handleChange}
                required
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-700 disabled:bg-stone-300 transition"
            >
              {submitting ? "変更中..." : "パスワードを変更"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
