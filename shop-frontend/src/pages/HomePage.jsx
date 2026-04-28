import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProductsApi } from "../api/productApi";
import { getImageSrc } from "../utils/config";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImages, setHeroImages] = useState([]);
  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getProductsApi(0, 8);
        const products = data.data?.content || data.content || [];
        setFeaturedProducts(products.slice(0, 4));

        // 收集所有有圖片的商品作為 Hero 輪播素材
        const imgs = [];
        products.forEach(p => {
          if (p.imageUrls && p.imageUrls.length > 0) {
            p.imageUrls.forEach(url => imgs.push(url));
          } else if (p.imageUrl) {
            imgs.push(p.imageUrl);
          }
        });
        setHeroImages(imgs.slice(0, 6)); // 最多取 6 張
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // 自動輪播計時器
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages]);

  return (
    <div className="bg-stone-50">
      {/* Hero Section with Image Carousel Background */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        
        {/* 背景圖片層（多張疊加，透過 opacity 切換） */}
        {heroImages.length > 0 ? (
          heroImages.map((img, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: idx === currentHero ? 1 : 0 }}
            >
              <img
                src={getImageSrc(img)}
                alt={"Hero " + (idx + 1)}
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          /* 沒有圖片時的漸層背景降級方案 */
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800"></div>
        )}

        {/* 深色遮罩（確保文字可讀） */}
        <div className="absolute inset-0 bg-slate-900 bg-opacity-60"></div>

        {/* 文字內容 */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <p className="text-amber-400 text-sm font-medium tracking-widest mb-4">
            ── 剣道具専門店 ──
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            武士の道
          </h1>
          <p className="text-base md:text-lg text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow">
            一つ一つ、心を込めた剣道具を。初心者から上級者まで、あなたの稽古を支える逸品をお届けします。
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/products"
              className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-lg hover:bg-amber-400 transition shadow-lg"
            >
              商品を見る
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-white hover:text-slate-900 transition"
            >
              会員登録
            </Link>
          </div>

          {/* 輪播指示器（有多張圖片時才顯示） */}
          {heroImages.length > 1 && (
            <div className="flex gap-2 mt-8">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHero(idx)}
                  className={"w-3 h-3 rounded-full transition-all " +
                    (idx === currentHero ? "bg-amber-500 scale-125" : "bg-white bg-opacity-40 hover:bg-opacity-70")}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">確かな品質</h3>
            <p className="text-stone-500">総合的な品質管理で安心の剣道具</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">全国配送</h3>
            <p className="text-stone-500">¥5,000以上のご購入で送料無料</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">専門サポート</h3>
            <p className="text-stone-500">剣道経験豊富なスタッフが対応</p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">おすすめ商品</h2>
              <p className="text-stone-500 text-sm mt-1">人気の剣道具をご紹介</p>
            </div>
            <Link to="/products" className="text-amber-600 hover:text-amber-700 font-medium">
              すべて見る →
            </Link>
          </div>

          {loading ? (
            <div className="text-center text-stone-400 py-10">読み込み中...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  to={"/products/" + product.id}
                  key={product.id}
                  className="bg-stone-50 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group border border-stone-100"
                >
                  {product.imageUrl ? (
                    <div className="overflow-hidden">
                      <img
                        src={getImageSrc(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-stone-100 flex items-center justify-center text-stone-400">
                      No Image
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 truncate">{product.name}</h3>
                    <p className="text-sm text-stone-500 mt-1 truncate">{product.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-amber-600">¥{product.price}</span>
                      {product.categoryName && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {product.categoryName}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">剣の道を、共に歩みましょう</h2>
          <p className="text-slate-400 mb-8">会員登録で初回購入時に10%オフクーポンをプレゼント</p>
          <Link
            to="/register"
            className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-lg hover:bg-amber-400 transition"
          >
            今すぐ登録
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
