import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductByIdApi, getProductsApi } from "../api/productApi";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import ImageCarousel from "../components/common/ImageCarousel";
import { getImageSrc } from "../utils/config";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setQuantity(1);
      setAddedToCart(false);
      try {
        const data = await getProductByIdApi(id);
        const prod = data.data || data;
        setProduct(prod);

        // Fetch related products (same category)
        try {
          const allData = await getProductsApi(0, 8, "", prod.categoryId || "");
          const allProducts = allData.data?.content || allData.content || [];
          setRelatedProducts(allProducts.filter(p => p.id !== prod.id).slice(0, 4));
        } catch (e) {}
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
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
    toast.success(quantity + "\u70B9\u3092\u30AB\u30FC\u30C8\u306B\u8FFD\u52A0\u3057\u307E\u3057\u305F");
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-stone-400 text-sm">{"\u5546\u54C1\u60C5\u5831\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D..."}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">{"\uD83D\uDD0D"}</div>
        <p className="text-stone-500 text-lg mb-4">{"\u5546\u54C1\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F"}</p>
        <Link to="/products" className="text-amber-600 hover:text-amber-700 underline font-medium">{"\u5546\u54C1\u4E00\u89A7\u306B\u623B\u308B"}</Link>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="max-w-5xl mx-auto pt-8 px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-stone-400 mb-6">
          <Link to="/" className="hover:text-amber-600 transition">{"\u30DB\u30FC\u30E0"}</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-amber-600 transition">{"\u5546\u54C1\u4E00\u89A7"}</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{product.name}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="md:flex">
            {/* Left: Image Carousel */}
            <div className="md:w-1/2">
              <ImageCarousel
                images={product.imageUrls || []}
                mainImage={product.imageUrl || ""}
              />
            </div>

            {/* Right: Product Info */}
            <div className="md:w-1/2 p-8 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-slate-800">{product.name}</h1>
                {product.categoryName && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full flex-shrink-0 ml-2">
                    {product.categoryName}
                  </span>
                )}
              </div>

              <p className="text-stone-500 mt-3 leading-relaxed flex-grow">{product.description}</p>

              <div className="mt-6">
                <p className="text-3xl text-amber-600 font-bold">
                  {"\u00A5"}{Number(product.price).toLocaleString()}
                </p>
                <p className="text-xs text-stone-400 mt-1">{"\u7A0E\u8FBC\u307F"}</p>
              </div>

              {/* Stock Status */}
              <div className="mt-4 flex items-center gap-3">
                {stock > 0 ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="text-sm text-green-700 font-medium">{"\u5728\u5EAB\u3042\u308A"} ({stock}{"\u70B9"})</span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-sm text-red-600 font-medium">{"\u58F2\u308A\u5207\u308C"}</span>
                  </>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="mt-6 pt-6 border-t border-stone-100">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-slate-700 font-medium text-sm">{"\u6570\u91CF:"}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}
                      className="w-10 h-10 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 flex items-center justify-center text-lg font-bold transition">
                      {"\u2212"}
                    </button>
                    <input type="number" min="1" max={stock} value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(stock, Number(e.target.value))))}
                      className="w-16 h-10 border border-stone-200 text-center rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= stock}
                      className="w-10 h-10 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 flex items-center justify-center text-lg font-bold transition">
                      {"+"}
                    </button>
                  </div>
                  <span className="text-sm text-stone-400 ml-2">
                    {"\u5C0F\u8A08: "}<span className="font-bold text-slate-800">{"\u00A5"}{(product.price * quantity).toLocaleString()}</span>
                  </span>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleAddToCart} disabled={stock === 0}
                    className={"flex-1 py-3 rounded-lg font-bold text-lg transition " + (
                      addedToCart
                        ? "bg-green-600 text-white"
                        : stock === 0
                          ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                          : "bg-slate-800 text-white hover:bg-slate-700"
                    )}>
                    {stock === 0 ? "\u58F2\u308A\u5207\u308C" : addedToCart ? "\u2713 \u8FFD\u52A0\u3057\u307E\u3057\u305F" : "\u30AB\u30FC\u30C8\u306B\u5165\u308C\u308B"}
                  </button>
                  {isInCart && (
                    <Link to="/cart"
                      className="px-6 py-3 rounded-lg border-2 border-amber-500 text-amber-600 font-bold hover:bg-amber-50 transition text-center">
                      {"\u30AB\u30FC\u30C8\u3092\u898B\u308B"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Info Banner */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-stone-100 p-4 text-center">
            <div className="text-xl mb-1">{"\uD83D\uDE9A"}</div>
            <p className="text-xs font-medium text-slate-700">{"\u5168\u56FD\u914D\u9001\u5BFE\u5FDC"}</p>
            <p className="text-xs text-stone-400">{"\u00A55,000\u4EE5\u4E0A\u9001\u6599\u7121\u6599"}</p>
          </div>
          <div className="bg-white rounded-lg border border-stone-100 p-4 text-center">
            <div className="text-xl mb-1">{"\uD83D\uDD12"}</div>
            <p className="text-xs font-medium text-slate-700">{"\u5B89\u5168\u306A\u304A\u652F\u6255\u3044"}</p>
            <p className="text-xs text-stone-400">{"\u30AB\u30FC\u30C9/\u632F\u8FBC/\u4EE3\u5F15"}</p>
          </div>
          <div className="bg-white rounded-lg border border-stone-100 p-4 text-center">
            <div className="text-xl mb-1">{"\uD83D\uDCDE"}</div>
            <p className="text-xs font-medium text-slate-700">{"\u5C02\u9580\u30B5\u30DD\u30FC\u30C8"}</p>
            <p className="text-xs text-stone-400">{"\u304A\u6C17\u8EFD\u306B\u3054\u76F8\u8AC7"}</p>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{"\u95A2\u9023\u5546\u54C1"}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => (
                <Link to={"/products/" + rp.id} key={rp.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group border border-stone-100">
                  {rp.imageUrl ? (
                    <div className="overflow-hidden">
                      <img src={getImageSrc(rp.imageUrl)} alt={rp.name}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="w-full h-36 bg-stone-100 flex items-center justify-center text-stone-300 text-2xl">{"\uD83D\uDDBC\uFE0F"}</div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-slate-800 truncate">{rp.name}</h3>
                    <p className="text-amber-600 font-bold mt-1">{"\u00A5"}{Number(rp.price).toLocaleString()}</p>
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
