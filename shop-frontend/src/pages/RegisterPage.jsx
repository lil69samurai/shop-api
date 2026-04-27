import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../api/authApi';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 當使用者開始修改時，清除該欄位的錯誤提示
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // 1. 驗證帳號
    if (formData.username.trim().length < 3) {
      newErrors.username = '帳號長度至少需 3 個字元';
    }
    
    // 2. 驗證 Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = '請輸入 Email';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '請輸入有效的 Email 格式 (例如: user@example.com)';
    }

    // 3. 驗證密碼 (至少6碼，且包含英文與數字)
    if (formData.password.length < 6) {
      newErrors.password = '密碼長度至少需 6 個字元';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密碼必須同時包含英文字母與數字';
    }

    // 4. 驗證確認密碼
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '兩次輸入的密碼不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('請檢查輸入的資料格式');
      return;
    }

    try {
      setLoading(true);
      // 假設後端 payload 需要 username, email, password
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      toast.success('註冊成功！請登入');
      navigate('/login');
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error.response?.data?.message || '註冊失敗，帳號或 Email 可能已存在');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 border border-slate-200 shadow-xl relative overflow-hidden">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 tracking-widest uppercase">
            会員登録
          </h2>
          <p className="mt-2 text-sm text-slate-500 tracking-wider">
            CREATE NEW ACCOUNT
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              帳號 (Username) <span className="text-red-500">*</span>
            </label>
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full p-3 border outline-none transition-colors bg-stone-50 
                ${errors.username ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-amber-500'}`}
              placeholder="請輸入您想使用的帳號"
            />
            {errors.username && <p className="mt-1 text-xs text-red-500 font-medium">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              電子郵件 (Email) <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full p-3 border outline-none transition-colors bg-stone-50 
                ${errors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-amber-500'}`}
              placeholder="example@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              密碼 (Password) <span className="text-red-500">*</span>
            </label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full p-3 border outline-none transition-colors bg-stone-50 
                ${errors.password ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-amber-500'}`}
              placeholder="至少6碼，需包含英文與數字"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              確認密碼 (Confirm Password) <span className="text-red-500">*</span>
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full p-3 border outline-none transition-colors bg-stone-50 
                ${errors.confirmPassword ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-amber-500'}`}
              placeholder="請再次輸入密碼"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-4 font-bold text-white tracking-widest uppercase transition-all
              ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-amber-600 shadow-md hover:shadow-lg'}`}
          >
            {loading ? '處理中...' : '註冊 (登録)'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600">
            已經有帳號了嗎？{' '}
            <Link to="/login" className="font-bold text-amber-600 hover:text-amber-500 hover:underline">
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
