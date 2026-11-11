import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function OrderHistoryPage({ setPage }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedComplaintOrderId, setSelectedComplaintOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [orderComplaints, setOrderComplaints] = useState({});
  const [complaintDrafts, setComplaintDrafts] = useState({});
  const [complaintMessages, setComplaintMessages] = useState({});

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const userId = user.id || user.idUser;
        if (!userId) return;
        const path = user.role === "SUPERVISOR" ? "/orders" : `/orders/client/${userId}`;
        const res = await apiFetch(path, {}, user.token);
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
      const userId = user.id || user.idUser;
      if (!userId) return;
      const path = user.role === "SUPERVISOR" ? "/orders" : `/orders/client/${userId}`;
      const res = await apiFetch(path, {}, user.token);
      if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch (e) {
      console.error("Failed to update order status", e);
    }
  };

  const loadOrderComplaints = async (orderId) => {
    try {
      const res = await apiFetch(`/orders/${orderId}/complaints`, {}, user.token);
      if (Array.isArray(res)) {
        setOrderComplaints((prev) => ({ ...prev, [orderId]: res }));
      }
    } catch (e) {
      console.error("Failed to load order complaints", e);
    }
  };

  const submitComplaint = async (orderId) => {
    const comment = complaintDrafts[orderId]?.trim();
    if (!comment) {
      setComplaintMessages((prev) => ({ ...prev, [orderId]: "Please write a complaint first." }));
      return;
    }

    try {
      await apiFetch(
        `/orders/${orderId}/complaints`,
        { method: "POST", body: JSON.stringify({ comment }) },
        user.token
      );
      setComplaintDrafts((prev) => ({ ...prev, [orderId]: "" }));
      setComplaintMessages((prev) => ({ ...prev, [orderId]: "Complaint sent." }));
      loadOrderComplaints(orderId);
    } catch (e) {
      setComplaintMessages((prev) => ({ ...prev, [orderId]: `Failed to send complaint: ${e.message}` }));
    }
  };

  const toggleComplaints = async (orderId) => {
    if (selectedComplaintOrderId === orderId) {
      setSelectedComplaintOrderId(null);
      return;
    }

    setSelectedComplaintOrderId(orderId);
    await loadOrderComplaints(orderId);
  };

  const toggleOrderItems = async (orderId) => {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
      return;
    }

    if (orderDetails[orderId]?.items) {
      setSelectedOrderId(orderId);
      return;
    }

    try {
      const res = await apiFetch(`/orders/${orderId}`, {}, user.token);
      setOrderDetails((prev) => ({ ...prev, [orderId]: res }));
      setSelectedOrderId(orderId);
    } catch (e) {
      console.error("Failed to load order details", e);
    }
  };

  const statusColors = {
    pending: "#ffd93d",
    in_progress: "#4dabf7",
    completed: "#51cf66",
    cancelled: "#a5a5a5",
  };

  if (!user || (user.role !== "CLIENT" && user.role !== "SUPERVISOR")) {
    return (
      <div className="empty" style={{ marginTop: 60 }}>
        <div className="empty-icon">🔒</div>
        <p>Client or supervisor access required</p>
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
      ) : user.role === "SUPERVISOR" ? (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Total Price</th>
                  <th>View Items</th>
                  <th>Complaints</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.idOrder}>
                    <td>{order.idOrder}</td>
                    <td>{order.clientFirstName || "—"}</td>
                    <td>{order.clientLastName || "—"}</td>
                    <td>{order.clientPhone || "—"}</td>
                    <td>{order.address}</td>
                    <td>{order.totalPrice?.toFixed(2) || "0.00"} KM</td>
                    <td>
                      <button className="btn-secondary" onClick={() => toggleOrderItems(order.idOrder)}>
                        {selectedOrderId === order.idOrder ? "Hide Items" : "View Items"}
                      </button>
                    </td>
                    <td>
                      <button className="btn-secondary" onClick={() => toggleComplaints(order.idOrder)}>
                        {selectedComplaintOrderId === order.idOrder ? "Hide Complaints" : "Complaints"}
                      </button>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: "auto" }}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.idOrder, e.target.value)}
                      >
                        <option value="pending">pending</option>
                        <option value="in_progress">in_progress</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.map((order) => (
            <div key={`supervisor-order-extra-${order.idOrder}`}>
              {selectedOrderId === order.idOrder && (
                <div style={{ background: "var(--light)", padding: 12, borderRadius: 6, marginTop: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Items in order #{order.idOrder}</div>
                  {(orderDetails[order.idOrder]?.items || []).map((item, idx) => (
                    <div key={idx} style={{ fontSize: "0.9rem", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                      <div style={{ fontWeight: 600 }}>📦 {item.title}</div>
                      <div style={{ color: "var(--mid)", fontSize: "0.85rem" }}>
                        Qty: {item.quantity} × {item.price.toFixed(2)} KM = {item.subtotal.toFixed(2)} KM
                      </div>
                    </div>
                  ))}
                  {orderDetails[order.idOrder]?.items?.length === 0 && (
                    <div style={{ color: "var(--mid)", fontSize: "0.9rem" }}>No items available for this order.</div>
                  )}
                </div>
              )}

              {selectedComplaintOrderId === order.idOrder && (
                <div style={{ background: "var(--light)", padding: 12, borderRadius: 6, marginTop: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Order #{order.idOrder} complaints</div>
                  {(orderComplaints[order.idOrder] || []).length === 0 ? (
                    <div style={{ color: "var(--mid)", fontSize: "0.9rem" }}>No complaints yet.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {orderComplaints[order.idOrder].map((complaint) => (
                        <div key={complaint.idOrderComplaint} style={{ padding: 12, background: "#fff", borderRadius: 8, border: "1px solid rgba(0,0,0,.08)" }}>
                          <div style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: 6 }}>
                            {complaint.timestamp ? new Date(complaint.timestamp).toLocaleString() : "Unknown date"}
                          </div>
                          <div>{complaint.comment}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
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
                {user.role === "SUPERVISOR" && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                    <select
                      className="form-select"
                      style={{ width: "auto" }}
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.idOrder, e.target.value)}
                    >
                      <option value="pending">pending</option>
                      <option value="in_progress">in_progress</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => toggleOrderItems(order.idOrder)}
                  >
                    {selectedOrderId === order.idOrder ? "Hide Items" : "View Items"}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => toggleComplaints(order.idOrder)}
                  >
                    {selectedComplaintOrderId === order.idOrder ? "Hide Complaints" : "Complaints"}
                  </button>
                </div>

                {selectedOrderId === order.idOrder && (
                  <div style={{ background: "var(--light)", padding: 12, borderRadius: 6, marginTop: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Items in this order:</div>
                    {(orderDetails[order.idOrder]?.items || []).map((item, idx) => (
                      <div key={idx} style={{ fontSize: "0.9rem", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                        <div style={{ fontWeight: 600 }}>📦 {item.title}</div>
                        <div style={{ color: "var(--mid)", fontSize: "0.85rem" }}>
                          Qty: {item.quantity} × {item.price.toFixed(2)} KM = {item.subtotal.toFixed(2)} KM
                        </div>
                      </div>
                    ))}
                    {orderDetails[order.idOrder]?.items?.length === 0 && (
                      <div style={{ color: "var(--mid)", fontSize: "0.9rem" }}>No items available for this order.</div>
                    )}
                  </div>
                )}
                {selectedComplaintOrderId === order.idOrder && (
                  <div style={{ background: "var(--light)", padding: 12, borderRadius: 6, marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ fontWeight: 700 }}>Order complaints</div>
                      <button className="btn-secondary" onClick={() => loadOrderComplaints(order.idOrder)}>
                        Refresh
                      </button>
                    </div>
                    {(orderComplaints[order.idOrder] || []).length === 0 ? (
                      <div style={{ color: "var(--mid)", fontSize: "0.9rem" }}>
                        No complaints yet.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: 10 }}>
                        {orderComplaints[order.idOrder].map((complaint) => (
                          <div key={complaint.idOrderComplaint} style={{ padding: 12, background: "#fff", borderRadius: 8, border: "1px solid rgba(0,0,0,.08)" }}>
                            <div style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: 6 }}>
                              {complaint.timestamp ? new Date(complaint.timestamp).toLocaleString() : "Unknown date"}
                            </div>
                            <div>{complaint.comment}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {user.role === "CLIENT" && (
                      <div style={{ marginTop: 16 }}>
                        <textarea
                          className="form-textarea"
                          placeholder="Submit a complaint or question for this order"
                          value={complaintDrafts[order.idOrder] || ""}
                          onChange={(e) =>
                            setComplaintDrafts((prev) => ({ ...prev, [order.idOrder]: e.target.value }))
                          }
                          style={{ minHeight: 80 }}
                        />
                        {complaintMessages[order.idOrder] && (
                          <div style={{ color: "var(--mid)", fontSize: "0.9rem", marginTop: 8 }}>
                            {complaintMessages[order.idOrder]}
                          </div>
                        )}
                        <button
                          className="btn-primary"
                          style={{ marginTop: 10 }}
                          onClick={() => submitComplaint(order.idOrder)}
                        >
                          Send Complaint
                        </button>
                      </div>
                    )}
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
