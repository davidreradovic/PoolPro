import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import { useEffect, useState } from "react";

export function CartPage({ cart, setCart, setPage, setOrderItems, setCreatedOrder }) {
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState("");

  const clientId = user?.id || user?.idUser;
  const cartAllowed = user?.role === "CLIENT";

  const syncCart = async () => {
    if (!user || !clientId) return;
    try {
      const res = await apiFetch(`/cart/${clientId}`, {}, user.token);
      if (res?.items) {
        setCart(res.items.map((item) => ({ ...item, qty: item.quantity })));
      }
    } catch (e) {
      console.error("Failed to sync cart", e);
    }
  };

  useEffect(() => {
    syncCart();
  }, [clientId, user]);

  const update = async (itemId, delta) => {
    if (!user || !clientId) {
      setCart((c) => {
        const item = c.find((i) => (i.idItem || i.id) === itemId);
        if (!item) return c;
        const newQty = Math.max(1, item.qty + delta);
        return c.map((i) =>
          (i.idItem || i.id) === itemId ? { ...i, qty: newQty } : i
        );
      });
      return;
    }

    const item = cart.find((i) => (i.idItem || i.id) === itemId);
    if (!item) return;

    const newQty = Math.max(1, item.qty + delta);

    try {
      await apiFetch(
        `/cart/${clientId}/update`,
        {
          method: "PUT",
          body: JSON.stringify({ itemId, quantity: newQty }),
        },
        user.token
      );
      await syncCart();
    } catch (e) {
      console.error("Failed to update cart quantity", e);
    }
  };

  const remove = async (itemId) => {
    if (!user || !clientId) {
      setCart((c) => c.filter((i) => (i.idItem || i.id) !== itemId));
      return;
    }

    try {
      await apiFetch(`/cart/${clientId}/remove/${itemId}`, { method: "DELETE" }, user.token);
      await syncCart();
    } catch (e) {
      console.error("Failed to remove cart item", e);
    }
  };

  const clearCart = async () => {
    if (!user || !clientId) {
      setCart([]);
      return;
    }
    try {
      await apiFetch(`/cart/${clientId}/clear`, { method: "DELETE" }, user.token);
      await syncCart();
    } catch (e) {
      console.error("Failed to clear cart", e);
    }
  };

  const subtotal = cart.reduce((s, i) => s + (i.unitPrice || i.price) * i.qty, 0);

  const checkout = async () => {
    if (!cartAllowed) {
      setCheckoutMsg("Samo registrovani korisnik ima mogućnost kupovine.");
      return;
    }
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
        setCreatedOrder(null);
        setCart([]);
        setPage("order-confirm");
      } else if (res.idOrder) {
        setOrderItems([...cart]);
        setCreatedOrder(res);
        setCart([]);
        setAddress("");
        setPage("order-confirm");
      } else {
        setCheckoutMsg(typeof res === "string" ? res : "Checkout failed");
      }
    } catch (e) {
      setCheckoutMsg("Error during checkout: " + e.message);
    }
    setCheckoutLoading(false);
  };

  if (!cartAllowed) {
    return (
      <div className="cart-layout">
        <div className="empty">
          <div className="empty-icon">🚫</div>
          <h1 className="cart-title">Cart unavailable</h1>
          <p>Only registered clients can make purchases.</p>
          {!user ? (
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setPage("auth")}>Sign In</button>
          ) : (
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setPage("shop")}>Back to Shop</button>
          )}
        </div>
      </div>
    );
  }

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
          cart.map((item) => {
            const itemId = item.idItem || item.id;
            return (
              <div key={itemId} className="cart-item">
                <div style={{ width: 50, height: 50, background: "#f0f0f0", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                  📦
                </div>
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <div className="cart-item-name">{item.title}</div>
                  <div className="cart-item-price">{(item.unitPrice || item.price).toFixed(2)} KM</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="qty-btn" onClick={() => update(itemId, -1)}>
                    −
                  </button>
                  <span className="qty-val">{item.qty}</span>
                  <button className="qty-btn" onClick={() => update(itemId, 1)}>
                    +
                  </button>
                </div>
                <div className="cart-item-price">
                  <strong>{((item.unitPrice || item.price) * item.qty).toFixed(2)} KM</strong>
                </div>
                <button className="btn-ghost" onClick={() => remove(itemId)}>
                  ✕
                </button>
              </div>
            );
          })
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
          <button
            className="btn-ghost"
            style={{ width: "100%", marginTop: 10 }}
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Clear Cart
          </button>
          <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--mid)", marginTop: 8 }}>
            🔒 Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
}
