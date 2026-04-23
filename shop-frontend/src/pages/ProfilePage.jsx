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
      toast.error("New passwords do not match!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters!");
      return;
    }

    setSubmitting(true);
    try {
      await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to change password";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* User Info Section */}
      <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Account Information
        </h2>
        <div className="space-y-3">
          <div className="flex">
            <span className="w-32 font-semibold text-gray-600">Username:</span>
            <span className="text-gray-800">{user.username}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold text-gray-600">Email:</span>
            <span className="text-gray-800">{user.email}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold text-gray-600">Role:</span>
            <span
              className={`px-2 py-1 rounded text-sm font-bold ${
                user.role === "ROLE_ADMIN"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {user.role === "ROLE_ADMIN" ? "Admin" : "User"}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              autoComplete="new-password"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {submitting ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;