import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsApi } from "../api/productApi";
import { createOrderApi } from "../api/orderApi";

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
      const fetchProducts = async () => {
        try {
          const data = await getProductsApi();
          setProducts(data.data.content || []);
        } catch (err) {
          console.error("Failed to fetch products", err);
        } finally {
          setLoading(false);
        }
      };

fetchProducts();
  }, []);

const addToCart = (product) => {
    const existing = cart.find((item) => item.productId === product.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

const handleSubmit = async () => {
    if (cart.length === 0) {
      setError("Please add at least one product");
      return;
    }

    setError("");

    try {
          const orderData = {
            items: cart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          };

          await createOrderApi(orderData);
          navigate("/orders");
        } catch (err) {
          setError("Failed to create order. Please try again.");
          console.error("Create order failed", err);
        }
      };

if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product List */}
        <div>
          <h2 className="text-xl font-bold mb-4">Products</h2>
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-green-600">${product.price}</p>
                  <p className="text-sm text-gray-400">Stock: {product.stock}</p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
                  <h2 className="text-xl font-bold mb-4">Cart</h2>

                  {cart.length === 0 ? (
                    <p className="text-gray-500">Cart is empty</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.productId}
                          className="border rounded p-3 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-green-600">
                              ${item.price} × {item.quantity} = $
                              {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              className="bg-gray-200 px-2 rounded"
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              className="bg-gray-200 px-2 rounded"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-500 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="border-t pt-4 mt-4">
                        <p className="text-xl font-bold">
                          Total: ${totalAmount.toFixed(2)}
                        </p>
                        <button
                          onClick={handleSubmit}
                          className="w-full mt-4 bg-green-500 text-white py-3 rounded text-lg hover:bg-green-600"
                        >
                          Place Order
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        };

        export default CreateOrderPage;