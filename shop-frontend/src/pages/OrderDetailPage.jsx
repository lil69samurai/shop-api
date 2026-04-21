import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderByIdApi } from "../api/orderApi";

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchOrder = async () => {
        try {
          const data = await getOrderByIdApi(id);
          setOrder(data.data || data);
        } catch (error) {
          console.error("Failed to fetch order", error);
        } finally {
          setLoading(false);
        }
      };

  fetchOrder();
    }, [id]);

if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  if (!order) {
    return <div className="text-center mt-10 text-red-500">Order not found</div>;
  }
return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <Link to="/orders" className="text-blue-500 hover:underline">
        ← Back to Orders
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">Order #{order.id}</h1>

        <div className="mt-4 space-y-2">
          <p>
            <span className="font-medium">Status: </span>
            <span className={`px-2 py-1 rounded text-sm ${
              order.status === "PAID" ? "bg-green-100 text-green-700" :
              order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
              order.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
              order.status === "DELIVERED" ? "bg-purple-100 text-purple-700" :
              order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {order.status}
            </span>
          </p>
          <p>
            <span className="font-medium">Date: </span>
            {new Date(order.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Total: </span>
            <span className="text-green-600 font-bold text-xl">
              ${order.totalAmount}
            </span>
          </p>
        </div>

        {/* Order Items */}
        <h2 className="text-xl font-bold mt-8 mb-4">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item, index) => (
            <div key={index} className="border rounded p-3 flex justify-between">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × ${item.price}
                </p>
              </div>
              <p className="font-semibold">${item.subtotal}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;