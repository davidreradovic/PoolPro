import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function OrderHistoryPage({ setPage }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Get orders for this client
        const userId = user.id || user.idUser;
        if (!userId) return;
        const res = await apiFetch(
          `/orders/client/${userId}`,
          {},
          user.token
        );
        if (Array.isArray(res)) {
          setOrders(res);
        }
      } catch (e) {
        console.error("Failed to fetch orders", e);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiFetch(
        `/orders/${orderId}/status?status=${newStatus}`,
        { method: "PUT" },
        user.token
      );
      // Refresh orders
      const userId = user.id || user.idUser;
      if (!userId) return;
      const res = await apiFetch(
        `/orders/client/${userId}`,
        {},
        user.token
      );
      if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch (e) {
      console.error("Failed to update order status", e);
    }
  };

  const statusColors = {
    pending: "#ffd93d",
    confirmed: "#4dabf7",
    shipped: "#748ffc",
    delivered: "#51cf66",
    cancelled: "#a5a5a5",
  };

  if (!user || user.role !== "CLIENT") {
    return (
      <div className="empty" style={{ marginTop: 60 }}>
        <div className="empty-icon">🔒</div>
        <p>Client access required</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty" style={{ marginTop: 60 }}>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", marginBottom: 28 }}>
        Order History
      </h1>

      {orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <p>No orders yet</p>
          <button
            className="btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => setPage("shop")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {orders.map((order) => (
            <div
              key={order.idOrder}
              style={{
                background: "#fff",
                border: "1px solid var(--light)",
                borderRadius: 8,
                overflow: "hidden",
                borderLeft: `4px solid ${statusColors[order.status] || "#ccc"}`,
              }}
            >
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--mid)" }}>Order #</div>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{order.idOrder}</div>
                  </div>
                  <div
                    style={{
                      padding: "8px 16px",
                      background: statusColors[order.status] || "#ccc",
                      color: "#fff",
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    {order.status.toUpperCase()}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--mid)" }}>Total Price</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--coral)" }}>
                      {order.totalPrice?.toFixed(2) || "N/A"} KM
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--mid)" }}>Delivery Address</div>
                    <div style={{ fontSize: "0.9rem" }}>{order.address}</div>
                  </div>
                </div>

                {order.createdAt && (
                  <div style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: 12 }}>
                    📅 Order Date: {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                )}

                <button
                  className="btn-secondary"
                  onClick={() => setSelectedOrder(selectedOrder === order.idOrder ? null : order.idOrder)}
                  style={{ marginBottom: 12 }}
                >
                  {selectedOrder === order.idOrder ? "Hide Items" : "View Items"}
                </button>

                {selectedOrder === order.idOrder && order.items && (
                  <div style={{ background: "var(--light)", padding: 12, borderRadius: 6, marginTop: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Items in this order:</div>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: "0.9rem", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                        <div style={{ fontWeight: 600 }}>📦 {item.title}</div>
                        <div style={{ color: "var(--mid)", fontSize: "0.85rem" }}>
                          Qty: {item.quantity} × {item.price.toFixed(2)} KM = {item.subtotal.toFixed(2)} KM
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
