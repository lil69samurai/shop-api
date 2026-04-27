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
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            🛒 Sean's Shop
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Premium products at unbeatable prices. Find what you need, discover what you love.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Browse All Products
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-white hover:text-blue-600 transition"
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl mb-3">🚚</div>
            <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
            <p className="text-gray-500">Free shipping on orders over \$50</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-bold text-lg mb-2">Secure Payment</h3>
            <p className="text-gray-500">100% secure checkout process</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
            <p className="text-gray-500">Get help whenever you need it</p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-blue-600 hover:underline font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  to={`/products/${product.id}`}
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group"
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
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">{product.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-green-600">${product.price}</span>
                      {product.categoryName && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
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
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start shopping?</h2>
        <p className="text-gray-500 mb-6">Create an account and get 10% off your first order.</p>
        <Link
          to="/register"
          className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
