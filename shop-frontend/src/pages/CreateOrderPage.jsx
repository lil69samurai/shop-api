import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrderApi } from "../api/orderApi";

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

// Send order
  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      setError("Can not build order if the cart is empty！");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      await createOrderApi(orderData);

      // Empty the cart after order is built.
      clearCart();

      alert("Order created successfully！🎉");
      navigate("/orders");
    } catch (err) {
      setError("Order created failed, please try again later。");
      console.error("Create order failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  // If the cart is empty.
  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center p-6 bg-gray-50 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Cart is empty</h2>
        <p className="text-gray-500 mb-6">Please select your items first before checking out.！</p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Go shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6 border-b pb-4">Comfirm the order</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Order details */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border p-4 rounded bg-white shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-500">
                Single price: ${item.price} × {item.quantity}
              </p>
            </div>
            <p className="text-lg font-bold text-green-600">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Total and operation button */}
      <div className="mt-8 bg-gray-50 p-6 rounded shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Total: <span className="text-green-600">${cartTotal.toFixed(2)}</span>
          </h2>
        </div>

        <div className="flex gap-4">
          <Link
            to="/cart"
            className="flex-1 text-center bg-gray-300 text-gray-800 py-3 rounded-lg text-lg font-bold hover:bg-gray-400 transition"
          >
            ← Back to cart
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Processing..." : "Comfirm order 🛒"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default CreateOrderPage;

// ========== OLD VERSION (backup) ==========
// import { useEffect, useState } from "react";
// import { getProductsApi } from "../api/productApi";
// useEffect(() => {
//       const fetchProducts = async () => {
//         try {
//           const data = await getProductsApi();
//           setProducts(data.data.content || []);
//         } catch (err) {
//           console.error("Failed to fetch products", err);
//         } finally {
//           setLoading(false);
//         }
//       };
//
// fetchProducts();
//   }, []);
//
// const addToCart = (product) => {
//     const existing = cart.find((item) => item.productId === product.id);
//
//     if (existing) {
//       setCart(
//         cart.map((item) =>
//           item.productId === product.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         )
//       );
//     } else {
//       setCart([
//         ...cart,
//         {
//           productId: product.id,
//           productName: product.name,
//           price: product.price,
//           quantity: 1,
//         },
//       ]);
//     }
//   };
//
// const removeFromCart = (productId) => {
//     setCart(cart.filter((item) => item.productId !== productId));
//   };
//
// const updateQuantity = (productId, quantity) => {
//     if (quantity <= 0) {
//       removeFromCart(productId);
//       return;
//     }
//     setCart(
//       cart.map((item) =>
//         item.productId === productId ? { ...item, quantity } : item
//       )
//     );
//   };
//
// const totalAmount = cart.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );
//
// const handleSubmit = async () => {
//     if (cart.length === 0) {
//       setError("Please add at least one product");
//       return;
//     }
//
//     setError("");
//
//     try {
//           const orderData = {
//             items: cart.map((item) => ({
//               productId: item.productId,
//               quantity: item.quantity,
//             })),
//           };
//
//           await createOrderApi(orderData);
//           navigate("/orders");
//         } catch (err) {
//           setError("Failed to create order. Please try again.");
//           console.error("Create order failed", err);
//         }
//       };
//
// if (loading) {
//     return <div className="text-center mt-10 text-gray-500">Loading...</div>;
//   }
//
//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
//
//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}
//
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* Product List */}
//         <div>
//           <h2 className="text-xl font-bold mb-4">Products</h2>
//           <div className="space-y-3">
//             {products.map((product) => (
//               <div
//                 key={product.id}
//                 className="border rounded p-3 flex justify-between items-center"
//               >
//                 <div>
//                   <p className="font-medium">{product.name}</p>
//                   <p className="text-green-600">${product.price}</p>
//                   <p className="text-sm text-gray-400">Stock: {product.stock}</p>
//                 </div>
//                 <button
//                   onClick={() => addToCart(product)}
//                   className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//                 >
//                   + Add
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//
//         <div>
//                   <h2 className="text-xl font-bold mb-4">Cart</h2>
//
//                   {cart.length === 0 ? (
//                     <p className="text-gray-500">Cart is empty</p>
//                   ) : (
//                     <div className="space-y-3">
//                       {cart.map((item) => (
//                         <div
//                           key={item.productId}
//                           className="border rounded p-3 flex justify-between items-center"
//                         >
//                           <div>
//                             <p className="font-medium">{item.productName}</p>
//                             <p className="text-green-600">
//                               ${item.price} × {item.quantity} = $
//                               {(item.price * item.quantity).toFixed(2)}
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() =>
//                                 updateQuantity(item.productId, item.quantity - 1)
//                               }
//                               className="bg-gray-200 px-2 rounded"
//                             >
//                               -
//                             </button>
//                             <span>{item.quantity}</span>
//                             <button
//                               onClick={() =>
//                                 updateQuantity(item.productId, item.quantity + 1)
//                               }
//                               className="bg-gray-200 px-2 rounded"
//                             >
//                               +
//                             </button>
//                             <button
//                               onClick={() => removeFromCart(item.productId)}
//                               className="text-red-500 ml-2"
//                             >
//                               ✕
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//
//                       <div className="border-t pt-4 mt-4">
//                         <p className="text-xl font-bold">
//                           Total: ${totalAmount.toFixed(2)}
//                         </p>
//                         <button
//                           onClick={handleSubmit}
//                           className="w-full mt-4 bg-green-500 text-white py-3 rounded text-lg hover:bg-green-600"
//                         >
//                           Place Order
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         };