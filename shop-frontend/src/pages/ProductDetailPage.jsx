import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProductByIdApi, getProductsApi } from "../api/productApi";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import ImageCarousel from "../components/common/ImageCarousel";
import { getImageSrc } from "../utils/config";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true); setQuantity(1); setAddedToCart(false);
      try {
        const data = await getProductByIdApi(id);
        const prod = data.data || data;
        setProduct(prod);
        try {
          const allData = await getProductsApi(0, 8, "", prod.categoryId || "");
          const allProducts = allData.data?.content || allData.content || [];
          setRelatedProducts(allProducts.filter(p => p.id !== prod.id).slice(0, 4));
        } catch (e) {}
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally { setLoading(false); }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const stock = product ? (product.stock ?? product.stockQuantity ?? 0) : 0;
  const isInCart = cartItems.some(item => item.id === Number(id));
  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty < 1 || newQty > stock) return;
    setQuantity(newQty);
  };
  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    toast.success(quantity + " " + t("products.addedMsg"));
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-stone-400 text-sm">{t("products.loadingDetail")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-stone-500 text-lg mb-4">{t("products.notFoundProduct")}</p>
        <Link to="/products" className="text-amber-600 hover:text-amber-700 underline font-medium">{t("products.backToList")}</Link>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="max-w-5xl mx-auto pt-4 sm:pt-8 px-4 sm:px-6">
        {/* Breadcrumb - hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-stone-400 mb-6">
          <Link to="/" className="hover:text-amber-600 transition">{t("products.home")}</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-amber-600 transition">{t("products.title")}</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium truncate">{product.name}</span>
        </div>
        {/* Mobile back button */}
        <div className="sm:hidden mb-4">
          <Link to="/products" className="text-sm text-amber-600 font-medium">← {t("products.backToList")}</Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <ImageCarousel images={product.imageUrls || []} mainImage={product.imageUrl || ""} />
            </div>
            <div className="md:w-1/2 p-5 sm:p-8 flex flex-col">
              {/* Title + Category */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{product.name}</h1>
                {product.categoryName && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full flex-shrink-0">{product.categoryName}</span>
                )}
              </div>
              <p className="text-stone-500 mt-2 sm:mt-3 leading-relaxed text-sm sm:text-base flex-grow">{product.description}</p>

              {/* Price */}
              <div className="mt-4 sm:mt-6">
                <p className="text-2xl sm:text-3xl text-amber-600 font-bold">¥{Number(product.price).toLocaleString()}</p>
                <p className="text-xs text-stone-400 mt-1">{t("products.taxIn")}</p>
              </div>

              {/* Stock */}
              <div className="mt-3 sm:mt-4 flex items-center gap-3">
                {stock > 0 ? (
                  <><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="text-sm text-green-700 font-medium">{t("products.inStock")} ({stock}{t("products.points")})</span></>
                ) : (
                  <><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-sm text-red-600 font-medium">{t("products.soldOut")}</span></>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-stone-100">
                {/* Quantity row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-700 font-medium text-sm">{t("products.qty")}:</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}
                      className="w-10 h-10 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 flex items-center justify-center text-lg font-bold transition">
                      −
                    </button>
                    <input type="number" min="1" max={stock} value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(stock, Number(e.target.value))))}
                      className="w-16 h-10 border border-stone-200 text-center rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= stock}
                      className="w-10 h-10 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 flex items-center justify-center text-lg font-bold transition">+</button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center mb-4 bg-stone-50 rounded-lg px-4 py-2">
                  <span className="text-sm text-stone-500">{t("products.subtotalLabel")}:</span>
                  <span className="font-bold text-lg text-slate-800">¥{(product.price * quantity).toLocaleString()}</span>
                </div>

                {/* Action Buttons - stack on mobile */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleAddToCart} disabled={stock === 0}
                    className={"flex-1 py-3 rounded-lg font-bold text-lg transition " + (
                      addedToCart ? "bg-green-600 text-white"
                        : stock === 0 ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                    )}>
                    {stock === 0 ? t("products.outOfStock") : addedToCart ? t("products.added") : t("products.addToCart")}
                  </button>
                  {isInCart && (
                    <Link to="/cart" className="px-6 py-3 rounded-lg border-2 border-amber-500 text-amber-600 font-bold hover:bg-amber-50 transition text-center">
                      {t("products.viewCart")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping info cards */}
        <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white rounded-lg border border-stone-100 p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-xl mb-1">🚚</div>
            <p className="text-xs font-medium text-slate-700 leading-tight">{t("products.shipping1")}</p>
            <p className="text-xs text-stone-400 hidden sm:block">{t("products.shipping1d")}</p>
          </div>
          <div className="bg-white rounded-lg border border-stone-100 p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-xl mb-1">🔒</div>
            <p className="text-xs font-medium text-slate-700 leading-tight">{t("products.shipping2")}</p>
            <p className="text-xs text-stone-400 hidden sm:block">{t("products.shipping2d")}</p>
          </div>
          <div className="bg-white rounded-lg border border-stone-100 p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-xl mb-1">📞</div>
            <p className="text-xs font-medium text-slate-700 leading-tight">{t("products.shipping3")}</p>
            <p className="text-xs text-stone-400 hidden sm:block">{t("products.shipping3d")}</p>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6">{t("products.related")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((rp) => (
                <Link to={"/products/" + rp.id} key={rp.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group border border-stone-100">
                  {rp.imageUrl ? (
                    <div className="overflow-hidden">
                      <img src={getImageSrc(rp.imageUrl)} alt={rp.name}
                        className="w-full h-28 sm:h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="w-full h-28 sm:h-36 bg-stone-100 flex items-center justify-center text-stone-300 text-2xl">🖼️</div>
                  )}
                  <div className="p-2 sm:p-3">
                    <h3 className="font-medium text-xs sm:text-sm text-slate-800 truncate">{rp.name}</h3>
                    <p className="text-amber-600 font-bold mt-1 text-sm">¥{Number(rp.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
