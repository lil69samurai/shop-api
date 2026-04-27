import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductByIdApi } from "../api/productApi";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { getImageSrc } from "../utils/config";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductByIdApi(id);
        setProduct(data.data || data);
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success("カートに追加しました");
  };

  if (loading) {
    return <div className="text-center mt-10 text-stone-400">読み込み中...</div>;
  }

  if (!product) {
    return <div className="text-center mt-10 text-red-500">商品が見つかりませんでした</div>;
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto pt-8 px-6">
        <Link to="/products" className="text-amber-600 hover:text-amber-700 font-medium">
          ← 商品一覧に戻る
        </Link>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              {product.imageUrl ? (
                <img
                  src={getImageSrc(product.imageUrl)}
                  alt={product.name}
                  className="w-full h-80 md:h-full object-cover"
                />
              ) : (
                <div className="w-full h-80 md:h-full bg-stone-100 flex items-center justify-center text-stone-400 text-lg">
                  画像なし
                </div>
              )}
            </div>

            <div className="md:w-1/2 p-8">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-slate-800">{product.name}</h1>
                {product.categoryName && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                    {product.categoryName}
                  </span>
                )}
              </div>

              <p className="text-stone-500 mt-4 leading-relaxed">{product.description}</p>

              <p className="text-3xl text-amber-600 font-bold mt-6">
                ¥{product.price}
              </p>

              <div className="mt-4 space-y-2 text-sm text-stone-500">
                <p>在庫: <span className="font-medium text-slate-700">{product.stock ?? product.stockQuantity ?? "N/A"}</span></p>
                <p>ステータス: <span className="font-medium text-slate-700">{product.status === "ACTIVE" ? "販売中" : product.status}</span></p>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100">
                <div className="flex items-center gap-4">
                  <label className="text-slate-700 font-medium">数量:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock ?? product.stockQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border border-stone-200 p-2 w-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={(product.stock ?? product.stockQuantity) === 0}
                  className="mt-4 w-full bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition font-bold text-lg"
                >
                  {(product.stock ?? product.stockQuantity) === 0 ? "売り切れ" : "カートに入れる"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
