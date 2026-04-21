import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersApi } from "../api/orderApi";


const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
          try {
            const data = await getMyOrdersApi();
            const orderList = data.data?.content || data.data || [];
            setOrders(Array.isArray(orderList) ? orderList : []);
          } catch (error) {
            console.error("Failed to fetch orders", error);
          } finally {
            setLoading(false);
          }
        };
    fetchOrders();
      }, []);

    if (loading) {
      return <div className="text-center mt-10 text-gray-500">Loading...</div>;
    }

  return (
    <div className="max-w-4xl mx-auto p-6">
           <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold">My Orders</h1>
             <Link
               to="/orders/create"
               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
             >
               + New Order
             </Link>
           </div>

           {orders.length === 0 ? (
             <p className="text-gray-500">No orders yet.</p>
           ) : (
             <div className="space-y-4">
               {orders.map((order) => (
                 <Link
                   to={`/orders/${order.id}`}
                   key={order.id}
                   className="block border rounded p-4 hover:shadow-lg transition"
                 >
                   <div className="flex justify-between items-center">
                     <div>
                       <p className="font-bold">Order #{order.id}</p>
                       <p className="text-sm text-gray-500">
                         {new Date(order.createdAt).toLocaleDateString()}
                       </p>
                     </div>
                     <div className="text-right">
                       <p className="text-green-600 font-semibold">
                         ${order.totalAmount}
                       </p>
                       <span className={`text-sm px-2 py-1 rounded ${
                         order.status === "PAID" ? "bg-green-100 text-green-700" :
                         order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                         order.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                         order.status === "DELIVERED" ? "bg-purple-100 text-purple-700" :
                         order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                         "bg-gray-100 text-gray-700"
                       }`}>
                         {order.status}
                       </span>
                     </div>
                   </div>
                 </Link>
               ))}
             </div>
           )}
         </div>
  );
};

export default OrdersPage;