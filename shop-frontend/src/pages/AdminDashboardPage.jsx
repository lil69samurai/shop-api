import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
  const adminModules = [
    {
      title: '商品管理',
      jp: '商品管理 (Products)',
      desc: '新增、修改、刪除商品，並管理商品圖片與庫存狀態。',
      link: '/admin/products',
      btnText: '進入商品管理',
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      title: '分類管理',
      jp: 'カテゴリ管理 (Categories)',
      desc: '建立與維護商品分類結構，保持目錄清晰。',
      link: '/admin/categories',
      btnText: '進入分類管理',
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      title: '訂單管理',
      jp: '注文管理 (Orders)',
      desc: '檢視客戶訂單、處理出貨進度與查看訂單明細。',
      link: '/admin/orders',
      btnText: '進入訂單管理',
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      title: '會員管理',
      jp: '会員管理 (Users)',
      desc: '檢視所有註冊會員資料，掌握平台使用者狀況。',
      link: '/admin/users',
      btnText: '進入會員管理',
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b-2 border-slate-800 pb-6 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-wider">
            管理中樞
          </h1>
          <p className="mt-2 text-sm md:text-base text-amber-600 font-medium tracking-widest">
            管理者ダッシュボード <span className="text-slate-400">| ADMIN DASHBOARD</span>
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2  gap-8">
          {adminModules.map((module, index) => (
            <div key={index} className="bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 relative group overflow-hidden">
              {/* Top Kendo Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-amber-50 transition-colors">
                    {module.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Module 0{index + 1}</span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-1">{module.title}</h2>
                <p className="text-xs text-amber-600 font-medium mb-4 tracking-widest">{module.jp}</p>
                <p className="text-slate-600 text-sm mb-8 leading-relaxed min-h-[3rem]">
                  {module.desc}
                </p>

                <Link
                  to={module.link}
                  className="inline-flex items-center justify-center w-full bg-slate-900 text-white py-3 px-4 font-medium tracking-wider hover:bg-amber-600 transition-colors duration-300 group-hover:shadow-md"
                >
                  {module.btnText}
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative bottom element */}
        <div className="mt-16 text-center text-slate-300 opacity-50 select-none">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
