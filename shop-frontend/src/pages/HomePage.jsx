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
            \u2500\u2500 \u5263\u9053\u5177\u5c02\u9580\u5e97 \u2500\u2500
          </p>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            \u6b66\u58eb\u306e\u9053
          </h1>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            \u4e00\u3064\u4e00\u3064\u3001\u5fc3\u3092\u8fbc\u3081\u305f\u5263\u9053\u5177\u3092\u3002\u521d\u5fc3\u8005\u304b\u3089\u4e0a\u7d1a\u8005\u307e\u3067\u3001\u3042\u306a\u305f\u306e\u7a3d\u53e4\u3092\u652f\u3048\u308b\u9038\u54c1\u3092\u304a\u5c4a\u3051\u3057\u307e\u3059\u3002
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/products"
              className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-lg hover:bg-amber-400 transition shadow-lg"
            >
              \u5546\u54c1\u3092\u898b\u308b
            </Link>
            <Link
              to="/register"
              className="border-2 border-slate-400 text-slate-300 font-semibold px-8 py-3 rounded-lg text-lg hover:bg-slate-700 hover:text-white transition"
            >
              \u4f1a\u54e1\u767b\u9332
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">\U0001f3af</div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">\u78ba\u304b\u306a\u54c1\u8cea</h3>
            <p className="text-stone-500">\u7dcf\u5408\u7684\u306a\u54c1\u8cea\u7ba1\u7406\u3067\u5b89\u5fc3\u306e\u5263\u9053\u5177</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">\U0001f4e6</div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">\u5168\u56fd\u914d\u9001</h3>
            <p className="text-stone-500">\u00a55,000\u4ee5\u4e0a\u306e\u3054\u8cfc\u5165\u3067\u9001\u6599\u7121\u6599</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">\U0001f91d</div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">\u5c02\u9580\u30b5\u30dd\u30fc\u30c8</h3>
            <p className="text-stone-500">\u5263\u9053\u7d4c\u9a13\u8c4a\u5bcc\u306a\u30b9\u30bf\u30c3\u30d5\u304c\u5bfe\u5fdc</p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">\u304a\u3059\u3059\u3081\u5546\u54c1</h2>
              <p className="text-stone-500 text-sm mt-1">\u4eba\u6c17\u306e\u5263\u9053\u5177\u3092\u3054\u7d39\u4ecb</p>
            </div>
            <Link to="/products" className="text-amber-600 hover:text-amber-700 font-medium">
              \u3059\u3079\u3066\u898b\u308b \u2192
            </Link>
          </div>

          {loading ? (
            <div className="text-center text-stone-400 py-10">\u8aad\u307f\u8fbc\u307f\u4e2d...</div>
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
                      <span className="text-lg font-bold text-amber-600">\u00a5{product.price}</span>
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
          <h2 className="text-3xl font-bold mb-4">\u5263\u306e\u9053\u3092\u3001\u5171\u306b\u6b69\u307f\u307e\u3057\u3087\u3046</h2>
          <p className="text-slate-400 mb-8">\u4f1a\u54e1\u767b\u9332\u3067\u521d\u56de\u8cfc\u5165\u6642\u306b10%\u30aa\u30d5\u30af\u30fc\u30dd\u30f3\u3092\u30d7\u30ec\u30bc\u30f3\u30c8</p>
          <Link
            to="/register"
            className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-lg hover:bg-amber-400 transition"
          >
            \u4eca\u3059\u3050\u767b\u9332
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
