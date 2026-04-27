import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-stone-300 py-12 border-t-4 border-amber-500 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div>
            <h3 className="text-2xl font-bold text-white tracking-widest mb-4">
              剣道ショップ
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              提供最高品質的劍道護具、竹劍與服裝。致力於推廣劍道文化，為每一位劍士提供最可靠的裝備。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link to="/" className="hover:text-amber-500 transition-colors">首頁 (Home)</Link></li>
              <li><Link to="/products" className="hover:text-amber-500 transition-colors">所有商品 (Products)</Link></li>
              <li><Link to="/login" className="hover:text-amber-500 transition-colors">會員登入 (Login)</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-widest">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                support@kendoshop.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +886 2 2345 6789
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-700 text-center text-xs text-slate-500 tracking-widest">
          &copy; {new Date().getFullYear()} KENDO SHOP. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
