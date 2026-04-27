import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../api/authApi';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters. / ユーザー名は3文字以上必要です。';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required. / メールアドレスを入力してください。';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format. / 有効なメールアドレスを入力してください。';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters. / パスワードは6文字以上必要です。';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain letters and numbers. / パスワードは英字と数字を含む必要があります。';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match. / パスワードが一致しません。';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await authApi.register({
        username: formData.username, email: formData.email, password: formData.password
      });
      toast.success('Registration successful! / 登録が完了しました！');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. / 登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 tracking-widest uppercase">会員登録</h2>
          <p className="mt-2 text-sm text-slate-500 tracking-wider">CREATE NEW ACCOUNT</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
            <input name="username" type="text" required value={formData.username} onChange={handleInputChange} 
              className={`w-full p-3 border outline-none bg-stone-50 ${errors.username ? 'border-red-500' : 'border-slate-300 focus:border-amber-500'}`} />
            {errors.username && <p className="mt-1 text-xs text-red-500 font-medium">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input name="email" type="email" required value={formData.email} onChange={handleInputChange} 
              className={`w-full p-3 border outline-none bg-stone-50 ${errors.email ? 'border-red-500' : 'border-slate-300 focus:border-amber-500'}`} />
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password <span className="text-red-500">*</span></label>
            <input name="password" type="password" required value={formData.password} onChange={handleInputChange} 
              className={`w-full p-3 border outline-none bg-stone-50 ${errors.password ? 'border-red-500' : 'border-slate-300 focus:border-amber-500'}`} />
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
            <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleInputChange} 
              className={`w-full p-3 border outline-none bg-stone-50 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-300 focus:border-amber-500'}`} />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading} className={`w-full py-4 px-4 font-bold text-white tracking-widest transition-all ${loading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-amber-600'}`}>
            {loading ? 'PROCESSING...' : '登録 (REGISTER)'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
