import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-stone-50 min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <h1 className="text-[150px] font-extrabold text-stone-100 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">⚔️</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">{t("common.notFound")}</h2>
        <p className="text-stone-500 mb-2">{t("common.notFoundDesc")}</p>
        <p className="text-sm text-stone-400 mb-8">{t("common.notFoundQuote")}</p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition font-bold">{t("common.backToHome")}</Link>
          <Link to="/products" className="border-2 border-amber-500 text-amber-600 px-6 py-3 rounded-lg hover:bg-amber-50 transition font-bold">{t("home.shopNow")}</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
