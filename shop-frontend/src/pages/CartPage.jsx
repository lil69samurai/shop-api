import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth"; // input auth hook

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle Checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.warning("Please login first！");
      navigate("/login"); // Redirecting to the login page
      return;
    }
    navigate("/orders/create");
  };

  // If the cart is empty.
  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center p-6 bg-gray-50 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty 🛒</h2>
        <p className="text-gray-500 mb-6">Check it out！</p>
        <Link to="/products" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          To shopping
        </Link>
      </div>
    );
  }

  // Show all product in the cart.
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6 border-b pb-4">Cart List</h1>

      <div className="flex flex-col gap-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between border p-4 rounded shadow-sm bg-white">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
              <p className="text-gray-500">Single price: <span className="text-green-600 font-bold">${item.price}</span></p>
            </div>

            <div className="flex items-center gap-6">
              {/* Quantity adjustment area*/}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Amount:</label>
                <input
                  type="number"
                  min="1"
                  max={item.stockQuantity} // Can't be over stocks.
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                  className="border p-1 w-16 text-center rounded"
                />
              </div>

              {/* Subtotal */}
              <div className="w-24 text-right">
                <p className="font-bold text-lg text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom total amount and checkout button */}
      <div className="mt-8 bg-gray-50 p-6 rounded shadow-sm flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Total: <span className="text-green-600">${cartTotal.toFixed(2)}</span>
        </h2>
        <button
          onClick={handleCheckout}
          className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-green-700 transition"
        >
          Check out
        </button>
      </div>
    </div>
  );
};

export default CartPage;