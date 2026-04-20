import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold mb-4">🛒 Welcome to Shop</h1>
      <p className="text-gray-600 mb-8">
        Browse products and place your orders
      </p>
      <Link
        to="/products"
        className="bg-blue-500 text-white px-6 py-3 rounded text-lg hover:bg-blue-600"
      >
        Browse Products
      </Link>
    </div>
  );
};

export default HomePage;