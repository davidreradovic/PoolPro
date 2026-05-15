import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import { useState } from "react";

export function CartPage({ cart, setCart, setPage, setOrderItems }) {
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState("");

  const update = (itemId, delta) => {
    setCart((c) => {
      const item = c.find(i => i.idItem === itemId);
      if (!item) return c;
      const newQty = Math.max(1, item.qty + delta);
      return c.map((i) => (i.idItem === itemId ? { ...i, qty: newQty } : i));
    });
  };

  const remove = (itemId) => setCart((c) => c.filter((i) => i.idItem !== itemId));
  const subtotal = cart.reduce((s, i) => s + (i.unitPrice || i.price) * i.qty, 0);

  const checkout = async () => {
    if (!user) {
      setPage("auth");
      return;
    }
    if (!address.trim()) {
      setCheckoutMsg("Please enter a delivery address");
      return;
    }
    if (cart.length === 0) {
      setCheckoutMsg("Your cart is empty");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutMsg("");
    
    try {
      const clientId = user.id || user.idUser;
      if (!clientId) {
        setCheckoutMsg("Unable to determine client ID. Please sign in again.");
        setCheckoutLoading(false);
        return;
      }
      const res = await apiFetch(
        `/orders/checkout/${clientId}`,
        {
          method: "POST",
          body: JSON.stringify({ address })
        },
        user.token
      );

      if (typeof res === "string" && res.includes("success")) {
        setOrderItems([...cart]);
        setCart([]);
        setPage("order-confirm");
      } else if (res.idOrder) {
        // Order created successfully
        setOrderItems([...cart]);
        setCart([]);
        setPage("order-confirm");
      } else {
        setCheckoutMsg(typeof res === "string" ? res : "Checkout failed");
      }
    } catch (e) {
      setCheckoutMsg("Error during checkout: " + e.message);
    }
    setCheckoutLoading(false);
  };

  return (
    <div className="cart-layout">
      <div>
        <h1 className="cart-title">My cart</h1>
        {cart.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🛒</div>
            <p>Your cart is empty</p>
            <button
              className="btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => setPage("shop")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.idItem} className="cart-item">
              <div style={{ width: 50, height: 50, background: "#f0f0f0", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                📦
              </div>
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div className="cart-item-name">{item.title}</div>
                <div className="cart-item-price">{(item.unitPrice || item.price).toFixed(2)} KM</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="qty-btn" onClick={() => update(item.idItem, -1)}>
                  −
                </button>
                <span className="qty-val">{item.qty}</span>
                <button className="qty-btn" onClick={() => update(item.idItem, 1)}>
                  +
                </button>
              </div>
              <div className="cart-item-price">
                <strong>{((item.unitPrice || item.price) * item.qty).toFixed(2)} KM</strong>
              </div>
              <button className="btn-ghost" onClick={() => remove(item.idItem)}>
                ✕
              </button>
            </div>
          ))
        )}
      </div>
      <div>
        <div className="cart-summary">
          <h3>Order summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} KM</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span className="summary-free">FREE</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--mid)", marginBottom: 8 }}>
            Bosnia and Herzegovina
          </div>
          <div className="summary-row">
            <span>Sales Tax</span>
            <span>0.00 KM</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{subtotal.toFixed(2)} KM</span>
          </div>

          {user && (
            <div style={{ marginTop: 12 }}>
              <label className="form-label">Delivery Address</label>
              <textarea
                className="form-input"
                placeholder="Enter your delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ minHeight: 80, marginBottom: 12 }}
              />
            </div>
          )}

          {checkoutMsg && (
            <div className="alert alert-danger" style={{ marginBottom: 12 }}>
              {checkoutMsg}
            </div>
          )}

          <button 
            className="btn-primary" 
            style={{ width: "100%", marginTop: 16 }} 
            onClick={checkout}
            disabled={checkoutLoading || cart.length === 0}
          >
            {checkoutLoading ? "Processing..." : "Checkout"}
          </button>
          <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--mid)", marginTop: 8 }}>
            🔒 Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
}
