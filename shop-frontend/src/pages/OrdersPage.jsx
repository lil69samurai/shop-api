import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersApi, deleteOrderApi } from "../api/orderApi";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


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

        useEffect(() => {
           fetchOrders();
      }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Cancel this order?")) return;
        setError("");
        try {
          await deleteOrderApi(id);
          fetchOrders();
        } catch (err) {
          setError(err.response?.data?.message || "Failed to cancel order. Only PENDING orders can be cancelled.");
        }
      };

      if (loading) return <div>Loading...</div>;

  return (
    <div style={{maxWidth: "800px", margin: "0 auto", padding: "24px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px"}}>
            <h1 style={{fontSize: "24px", fontWeight: "bold"}}>My Orders</h1>
            <Link to="/orders/create" style={{background: "#3b82f6", color: "white", padding: "8px 16px", borderRadius: "4px", textDecoration: "none"}}>+ New Order</Link>
          </div>

          {error && <div style={{background: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "4px", marginBottom: "16px"}}>{error}</div>}
{orders.length === 0 ? (
        <p style={{color: "#6b7280"}}>No orders yet.</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} style={{border: "1px solid #ddd", borderRadius: "4px", padding: "16px", marginBottom: "12px"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <Link to={"/orders/" + order.id} style={{textDecoration: "none", color: "inherit"}}>
                  <p style={{fontWeight: "bold"}}>Order #{order.id}</p>
                  <p style={{fontSize: "14px", color: "#6b7280"}}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </Link>
                <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                  <div style={{textAlign: "right"}}>
                    <p style={{color: "#16a34a", fontWeight: "bold"}}>${order.totalAmount}</p>
                    <span style={{fontSize: "14px"}}>{order.status}</span>
                  </div>
                  {order.status === "PENDING" && (
                    <button onClick={() => handleDelete(order.id)} style={{background: "#ef4444", color: "white", padding: "4px 12px", borderRadius: "4px", border: "none", cursor: "pointer"}}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;