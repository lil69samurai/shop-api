import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProductsApi } from "../api/productApi";
import { getCategoriesApi } from "../api/categoryApi";
import { getImageSrc, CLOUDINARY_CLOUD_NAME } from "../utils/config";

const BANNER_URLS = [
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/shop-banners/banner1`,
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/shop-banners/banner2`,
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/shop-banners/banner3`,
];

// Use Image().onload to check if banner exists (bypasses CORS)
const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

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
        // 1. Check banners first (parallel with product fetch)
        const bannerPromise = Promise.all(BANNER_URLS.map(checkImageExists));

        // 2. Fetch products
        let products = [];
        try {
          const data = await getProductsApi(0, 20);
          products = data.data?.content || data.content || [];
        } catch (e) {
          console.log("Products fetch failed (server may be waking up)");
        }

        setFeaturedProducts(products.slice(0, 4));

        // Build category -> product image mapping
        const catImgMap = {};
        products.forEach(p => {
          const catId = p.categoryId || (p.category && p.category.id);
          if (catId && !catImgMap[catId] && p.imageUrl) {
            catImgMap[catId] = p.imageUrl;
          }
        });
        setCategoryImages(catImgMap);

        // 3. Resolve banners
        const bannerResults = await bannerPromise;
        const validBanners = bannerResults.filter(url => url !== null);

        if (validBanners.length > 0) {
          // Use Cloudinary banners
          setHeroImages(validBanners);
        } else {
          // Fallback: use product images
          const imgs = [];
          products.forEach(p => {
            if (p.imageUrls && p.imageUrls.length > 0) {
              p.imageUrls.forEach(url => imgs.push(url));
            } else if (p.imageUrl) {
              imgs.push(p.imageUrl);
            }
          });
          if (imgs.length > 0) {
            setHeroImages(imgs.slice(0, 6));
          }
          // If no product images either, heroImages stays empty -> gradient fallback
        }

        // 4. Fetch categories
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
      {/* Hero */}
      <div className="relative h-[420px] sm:h-[500px] md:h-[600px] overflow-hidden">
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
        <div className="absolute inset-0 bg-slate-900 bg-opacity-40"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6">
          <p className="text-amber-400 text-xs sm:text-sm font-medium tracking-widest mb-3 sm:mb-4">{t("home.brandSub")}</p>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight drop-shadow-lg">{t("home.heroTitle")}</h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-200 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow px-2">{t("home.heroDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-6 sm:px-0">
            <Link to="/products" className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-base sm:text-lg hover:bg-amber-400 transition shadow-lg text-center">{t("home.shopNow")}</Link>
            <Link to="/register" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg text-base sm:text-lg hover:bg-white hover:text-slate-900 transition text-center">{t("home.registerCta")}</Link>
          </div>
          {heroImages.length > 1 && (
            <div className="flex gap-2 mt-6 sm:mt-8">
              {heroImages.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentHero(idx)}
                  className={"w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all " + (idx === currentHero ? "bg-amber-500 scale-125" : "bg-white bg-opacity-40 hover:bg-opacity-70")} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-900 py-5 sm:py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-500">{t("home.stat1Num")}</p>
            <p className="text-xs text-slate-400 mt-1 leading-tight">{t("home.stat1Label")}</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-500">{t("home.stat2Num")}</p>
            <p className="text-xs text-slate-400 mt-1 leading-tight">{t("home.stat2Label")}</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-500">{t("home.stat3Num")}{t("common.year")}</p>
            <p className="text-xs text-slate-400 mt-1 leading-tight">{t("home.stat3Label")}</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-center">
          {feats.map((feat, i) => (
            <div key={i} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feat.emoji}</div>
              <h3 className="font-bold text-base sm:text-lg mb-2 text-slate-800">{t(feat.titleKey)}</h3>
              <p className="text-stone-500 text-sm">{t(feat.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories - with product image backgrounds */}
      {Array.isArray(categories) && categories.length > 0 && (
        <div className="bg-white py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{t("home.catTitle")}</h2>
              <p className="text-stone-500 text-sm mt-1">{t("home.catDesc")}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {categories.slice(0, 8).map((cat) => {
                const catImg = categoryImages[cat.id];
                return (
                  <Link to={"/products?category=" + cat.id} key={cat.id}
                    className="group relative rounded-xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all aspect-[4/3]">
                    {catImg ? (
                      <img src={getImageSrc(catImg)} alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900"></div>
                    )}
                    <div className="absolute inset-0 bg-slate-900 bg-opacity-40 group-hover:bg-opacity-30 transition-all"></div>
                    <div className="relative z-10 h-full flex flex-col justify-end p-3 sm:p-4">
                      <h3 className="font-bold text-sm sm:text-base text-white drop-shadow-lg">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-xs text-slate-200 mt-0.5 line-clamp-1 drop-shadow hidden sm:block">{cat.description}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div className={"py-12 sm:py-16 " + (Array.isArray(categories) && categories.length > 0 ? "bg-stone-50" : "bg-white")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{t("home.featured")}</h2>
              <p className="text-stone-500 text-sm mt-1">{t("home.featuredDesc")}</p>
            </div>
            <Link to="/products" className="text-amber-600 hover:text-amber-700 font-medium text-sm sm:text-base">{t("home.viewAll")}</Link>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
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
                        <div className="text-2xl sm:text-3xl mb-1">🖼️</div>
                        <p className="text-xs">{t("products.noImage")}</p>
                      </div>
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-800 truncate">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-stone-500 mt-1 truncate">{product.description}</p>
                    <div className="flex justify-between items-center mt-2 sm:mt-3">
                      <span className="text-base sm:text-lg font-bold text-amber-600">¥{Number(product.price).toLocaleString()}</span>
                      {(product.stock ?? product.stockQuantity ?? 0) > 0 ? (
                        <span className="text-xs text-green-600 font-medium hidden sm:inline">{t("home.inStock")}</span>
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

      {/* CTA */}
      <div className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t("home.ctaTitle")}</h2>
          <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">{t("home.ctaDesc")}</p>
          <Link to="/register" className="inline-block bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-base sm:text-lg hover:bg-amber-400 transition">{t("home.ctaButton")}</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
