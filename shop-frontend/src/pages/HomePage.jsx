import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsApi } from "../api/productApi";
import { getCategoriesApi } from "../api/categoryApi";
import { getImageSrc } from "../utils/config";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImages, setHeroImages] = useState([]);
  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProductsApi(0, 8);
        const products = data.data?.content || data.content || [];
        setFeaturedProducts(products.slice(0, 4));

        const imgs = [];
        products.forEach(p => {
          if (p.imageUrls && p.imageUrls.length > 0) {
            p.imageUrls.forEach(url => imgs.push(url));
          } else if (p.imageUrl) {
            imgs.push(p.imageUrl);
          }
        });
        setHeroImages(imgs.slice(0, 6));

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

  return (
    <div className="bg-stone-50">
      {/* Hero Section */}
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
          <p className="text-amber-400 text-sm font-medium tracking-widest mb-4">
            {"\u2500\u2500 \u5263\u9053\u5177\u5C02\u9580\u5E97 \u2500\u2500"}
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            {"\u6B66\u58EB\u306E\u9053"}
          </h1>
          <p className="text-base md:text-lg text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow">
            {"\u4E00\u3064\u4E00\u3064\u3001\u5FC3\u3092\u8FBC\u3081\u305F\u5263\u9053\u5177\u3092\u3002\u521D\u5FC3\u8005\u304B\u3089\u4E0A\u7D1A\u8005\u307E\u3067\u3001\u3042\u306A\u305F\u306E\u7A3D\u53E4\u3092\u652F\u3048\u308B\u9038\u54C1\u3092\u304A\u5C4A\u3051\u3057\u307E\u3059\u3002"}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/products"
              className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-lg hover:bg-amber-400 transition shadow-lg">
              {"\u5546\u54C1\u3092\u898B\u308B"}
            </Link>
            <Link to="/register"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-white hover:text-slate-900 transition">
              {"\u4F1A\u54E1\u767B\u9332"}
            </Link>
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

      {/* Stats Bar */}
      <div className="bg-slate-900 py-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-bold text-amber-500">500+</p>
            <p className="text-xs text-slate-400 mt-1">{"\u5546\u54C1\u30E9\u30A4\u30F3\u30CA\u30C3\u30D7"}</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-amber-500">10,000+</p>
            <p className="text-xs text-slate-400 mt-1">{"\u304A\u5BA2\u69D8\u306E\u58F0"}</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-amber-500">50{"\u5E74"}</p>
            <p className="text-xs text-slate-400 mt-1">{"\u5275\u696D\u306E\u6B74\u53F2"}</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">{"\uD83C\uDFAF"}</div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">{"\u78BA\u304B\u306A\u54C1\u8CEA"}</h3>
            <p className="text-stone-500 text-sm">{"\u7DCF\u5408\u7684\u306A\u54C1\u8CEA\u7BA1\u7406\u3067\u5B89\u5FC3\u306E\u5263\u9053\u5177"}</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">{"\uD83D\uDCE6"}</div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">{"\u5168\u56FD\u914D\u9001"}</h3>
            <p className="text-stone-500 text-sm">{"\u00A55,000\u4EE5\u4E0A\u306E\u3054\u8CFC\u5165\u3067\u9001\u6599\u7121\u6599"}</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">{"\uD83E\uDD1D"}</div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">{"\u5C02\u9580\u30B5\u30DD\u30FC\u30C8"}</h3>
            <p className="text-stone-500 text-sm">{"\u5263\u9053\u7D4C\u9A13\u8C4A\u5BCC\u306A\u30B9\u30BF\u30C3\u30D5\u304C\u5BFE\u5FDC"}</p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {Array.isArray(categories) && categories.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-800">{"\u30AB\u30C6\u30B4\u30EA\u30FC\u304B\u3089\u63A2\u3059"}</h2>
              <p className="text-stone-500 text-sm mt-1">{"\u304A\u63A2\u3057\u306E\u5263\u9053\u5177\u3092\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u306B"}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat) => (
                <Link to={"/products?category=" + cat.id} key={cat.id}
                  className="group bg-stone-50 rounded-xl p-6 text-center border border-stone-100 hover:border-amber-300 hover:shadow-md transition-all">
                  <div className="text-3xl mb-3">{"\u2694\uFE0F"}</div>
                  <h3 className="font-bold text-slate-800 group-hover:text-amber-600 transition">{cat.name}</h3>
                  {cat.description && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{cat.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div className={"py-16 " + (Array.isArray(categories) && categories.length > 0 ? "bg-stone-50" : "bg-white")}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{"\u304A\u3059\u3059\u3081\u5546\u54C1"}</h2>
              <p className="text-stone-500 text-sm mt-1">{"\u4EBA\u6C17\u306E\u5263\u9053\u5177\u3092\u3054\u7D39\u4ECB"}</p>
            </div>
            <Link to="/products" className="text-amber-600 hover:text-amber-700 font-medium">
              {"\u3059\u3079\u3066\u898B\u308B \u2192"}
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-stone-400">{"\u5546\u54C1\u3092\u6E96\u5099\u4E2D\u3067\u3059"}</p>
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
                        <div className="text-3xl mb-1">{"\uD83D\uDDBC\uFE0F"}</div>
                        <p className="text-xs">No Image</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 truncate">{product.name}</h3>
                    <p className="text-sm text-stone-500 mt-1 truncate">{product.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-amber-600">{"\u00A5"}{Number(product.price).toLocaleString()}</span>
                      {(product.stock ?? product.stockQuantity ?? 0) > 0 ? (
                        <span className="text-xs text-green-600 font-medium">{"\u5728\u5EAB\u3042\u308A"}</span>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">{"\u58F2\u308A\u5207\u308C"}</span>
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
          <h2 className="text-3xl font-bold mb-4">{"\u5263\u306E\u9053\u3092\u3001\u5171\u306B\u6B69\u307F\u307E\u3057\u3087\u3046"}</h2>
          <p className="text-slate-400 mb-8">{"\u4F1A\u54E1\u767B\u9332\u3067\u521D\u56DE\u8CFC\u5165\u6642\u306B10%\u30AA\u30D5\u30AF\u30FC\u30DD\u30F3\u3092\u30D7\u30EC\u30BC\u30F3\u30C8"}</p>
          <Link to="/register"
            className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-lg hover:bg-amber-400 transition">
            {"\u4ECA\u3059\u3050\u767B\u9332"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
