import { useAuth } from "../context/AuthContext";

export function OrderConfirmPage({ items, setPage }) {
  const { user } = useAuth();
  const subtotal = items.reduce((s, i) => s + (i.unitPrice || i.price) * i.qty, 0);

  return (
    <div className="order-confirm">
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", marginBottom: 6 }}>
        Thank you, {user?.firstName || "Customer"}!
      </h1>
      <p style={{ color: "var(--mid)", marginBottom: 28 }}>Your order has been placed successfully. You'll receive a confirmation email soon.</p>
      <div className="order-confirm-box">
        {items.map((item) => (
          <div key={item.idItem || item.id} className="order-item-row">
            <div style={{ width: 50, height: 50, background: "#f0f0f0", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
              📦
            </div>
            <div style={{ marginLeft: 12 }}>
              <div style={{ fontWeight: 700 }}>{item.title || item.name}</div>
              <div style={{ fontSize: "0.88rem", color: "var(--mid)" }}>
                Qty: {item.qty} · Price: <strong>{(item.unitPrice || item.price).toFixed(2)} KM</strong>
              </div>
            </div>
          </div>
        ))}
        <hr className="divider" />
        <div style={{ fontSize: "0.9rem" }}>
          <div>
            Subtotal: <strong>{subtotal.toFixed(2)} KM</strong>
          </div>
          <div>
            Delivery: <strong style={{ color: "#27ae60" }}>Free</strong>
          </div>
          <div>
            Sales tax: <strong>0.00 KM</strong>
          </div>
          <div style={{ fontSize: "1.05rem", marginTop: 8 }}>
            TOTAL: <strong style={{ color: "var(--coral)" }}>{subtotal.toFixed(2)} KM</strong>
          </div>
        </div>
      </div>
      <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => setPage("home")}>
        Back to Home
      </button>
    </div>
  );
}
