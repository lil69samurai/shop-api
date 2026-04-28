import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProductsApi } from "../api/productApi";
import { getCategoriesApi } from "../api/categoryApi";
import { getImageSrc } from "../utils/config";

const HomePage = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImages, setHeroImages] = useState([]);
  const [currentHero, setCurrentHero] = useState(0);
  const [categoryImages, setCategoryImages] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProductsApi(0, 8);
        const products = data.data?.content || data.content || [];
        setFeaturedProducts(products.slice(0, 4));
        const imgs = [];
        const catImgMap = {};
        products.forEach(p => {
          if (p.imageUrls && p.imageUrls.length > 0) {
            p.imageUrls.forEach(url => imgs.push(url));
          } else if (p.imageUrl) {
            imgs.push(p.imageUrl);
          }
          const catId = p.categoryId || (p.category && p.category.id);
          if (catId && !catImgMap[catId] && p.imageUrl) {
            catImgMap[catId] = p.imageUrl;
          }
        });
        setHeroImages(imgs.slice(0, 6));
        setCategoryImages(catImgMap);
        try {
          const catData = await getCategoriesApi();
          setCategories(catData.data || catData || []);
        } catch (e) {}
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages]);

  const feats = [
    { emoji: "🎯", titleKey: "home.feat1Title", descKey: "home.feat1Desc" },
    { emoji: "📦", titleKey: "home.feat2Title", descKey: "home.feat2Desc" },
    { emoji: "🤝", titleKey: "home.feat3Title", descKey: "home.feat3Desc" },
  ];

  return (
    <div className="bg-stone-50">
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        {heroImages.length > 0 ? (
          heroImages.map((img, idx) => (
            <div key={idx} className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: idx === currentHero ? 1 : 0 }}>
              <img src={getImageSrc(img)} alt={"Hero " + (idx + 1)} className="w-full h-full object-cover" />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800"></div>
        )}
        <div className="absolute inset-0 bg-slate-900 bg-opacity-60"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <p className="text-amber-400 text-sm font-medium tracking-widest mb-4">{t("home.brandSub")}</p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">{t("home.heroTitle")}</h1>
          <p className="text-base md:text-lg text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow">{t("home.heroDesc")}</p>
          <div className="flex gap-4 justify-center">
            <Link to="/products" className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-lg hover:bg-amber-400 transition shadow-lg">{t("home.shopNow")}</Link>
            <Link to="/register" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-white hover:text-slate-900 transition">{t("home.registerCta")}</Link>
          </div>
          {heroImages.length > 1 && (
            <div className="flex gap-2 mt-8">
              {heroImages.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentHero(idx)}
                  className={"w-3 h-3 rounded-full transition-all " + (idx === currentHero ? "bg-amber-500 scale-125" : "bg-white bg-opacity-40 hover:bg-opacity-70")} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 py-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-bold text-amber-500">{t("home.stat1Num")}</p>
            <p className="text-xs text-slate-400 mt-1">{t("home.stat1Label")}</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-amber-500">{t("home.stat2Num")}</p>
            <p className="text-xs text-slate-400 mt-1">{t("home.stat2Label")}</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-amber-500">{t("home.stat3Num")}{t("common.year")}</p>
            <p className="text-xs text-slate-400 mt-1">{t("home.stat3Label")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {feats.map((feat, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">{feat.emoji}</div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">{t(feat.titleKey)}</h3>
              <p className="text-stone-500 text-sm">{t(feat.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {Array.isArray(categories) && categories.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-800">{t("home.catTitle")}</h2>
              <p className="text-stone-500 text-sm mt-1">{t("home.catDesc")}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat) => (
                <Link to={"/products?category=" + cat.id} key={cat.id}
                  className="group bg-stone-50 rounded-xl p-6 text-center border border-stone-100 hover:border-amber-300 hover:shadow-md transition-all">
                  <div className="text-3xl mb-3">⚔️</div>
                  <h3 className="font-bold text-slate-800 group-hover:text-amber-600 transition">{cat.name}</h3>
                  {cat.description && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{cat.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={"py-16 " + (Array.isArray(categories) && categories.length > 0 ? "bg-stone-50" : "bg-white")}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{t("home.featured")}</h2>
              <p className="text-stone-500 text-sm mt-1">{t("home.featuredDesc")}</p>
            </div>
            <Link to="/products" className="text-amber-600 hover:text-amber-700 font-medium">{t("home.viewAll")} →</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-stone-400">{t("home.noProducts")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link to={"/products/" + product.id} key={product.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group border border-stone-100">
                  {product.imageUrl ? (
                    <div className="overflow-hidden">
                      <img src={getImageSrc(product.imageUrl)} alt={product.name}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-stone-100 flex items-center justify-center text-stone-300">
                      <div className="text-center">
                        <div className="text-3xl mb-1">🖼️</div>
                        <p className="text-xs">{t("products.noImage")}</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 truncate">{product.name}</h3>
                    <p className="text-sm text-stone-500 mt-1 truncate">{product.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-amber-600">¥{Number(product.price).toLocaleString()}</span>
                      {(product.stock ?? product.stockQuantity ?? 0) > 0 ? (
                        <span className="text-xs text-green-600 font-medium">{t("home.inStock")}</span>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">{t("home.soldOut")}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("home.ctaTitle")}</h2>
          <p className="text-slate-400 mb-8">{t("home.ctaDesc")}</p>
          <Link to="/register" className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-lg hover:bg-amber-400 transition">{t("home.ctaButton")}</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
