import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsApi } from "../api/productApi";
import { getImageSrc } from "../utils/config";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getProductsApi(0, 4);
        setFeaturedProducts(data.data.content || []);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-stone-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <p className="text-amber-400 text-sm font-medium tracking-widest mb-4">
            ── 剣道具専門店 ──
          </p>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            武士の道
          </h1>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
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
              className="border-2 border-slate-400 text-slate-300 font-semibold px-8 py-3 rounded-lg text-lg hover:bg-slate-700 hover:text-white transition"
            >
              会員登録
            </Link>
          </div>
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
