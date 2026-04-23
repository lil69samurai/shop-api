import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductByIdApi } from "../api/productApi";
import { useCart } from "../context/CartContext";
import { toast } from 'react-toastify';


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
    toast.success('Added to cart successfully! 🛒');
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center mt-10 text-red-500">Product not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <Link to="/products" className="text-blue-500 hover:underline">
        ← Back to Products
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-2xl text-green-600 font-bold mt-4">
          ${product.price}
        </p>
        <p className="text-gray-500 mt-2">Stock: {product.stockQuantity}</p>
        <p className="text-gray-500 mt-1">
          Category: {product.categoryName || "N/A"}
        </p>
        <p className="text-gray-500 mt-1">Status: {product.status}</p>
      </div>

      <div className="mt-6 flex items-center gap-4 border-t pt-6">
              <label className="text-gray-700 font-semibold">Amount：</label>
              <input
                type="number"
                min="1"
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border p-2 w-20 rounded"
              />

              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {product.stockQuantity === 0 ? 'Sold out' : 'Add to cart'}
              </button>
            </div>
    </div>
  );
};

export default ProductDetailPage;