import { useState } from "react";

export function ProductPage({ product, setPage, addToCart }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <div style={{ padding: "20px 40px" }}>
        <div className="breadcrumb">
          <span onClick={() => setPage("home")}>Home</span> /{" "}
          <span onClick={() => setPage("shop")}>Shop</span> / {product.title}
        </div>
      </div>
      <div className="detail-layout">
        <div className="detail-img" style={{ background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
          📦
        </div>
        <div>
          <h1 className="detail-name">{product.title}</h1>
          <div className="detail-price">{product.unitPrice.toFixed(2)} KM</div>
          <p style={{ color: "var(--mid)", marginBottom: 20, lineHeight: 1.7 }}>
            <strong>Category:</strong> {product.category}
          </p>
          <p style={{ color: "var(--mid)", marginBottom: 20, lineHeight: 1.7 }}>
            <strong>Available Stock:</strong> {product.quantity}
          </p>
          {product.quantity === 0 && (
            <div className="alert alert-danger" style={{ marginBottom: 12 }}>
              Out of stock
            </div>
          )}
          <div style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: 8 }}>Quantity</div>
          <div className="detail-qty">
            <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} disabled={product.quantity === 0}>
              −
            </button>
            <span className="qty-val">{qty}</span>
            <button className="qty-btn" onClick={() => setQty(qty + 1)} disabled={product.quantity === 0}>
              +
            </button>
          </div>
          {added && <div className="alert alert-success" style={{ marginBottom: 12 }}>
            Added to cart!
          </div>}
          <button className="btn-primary" style={{ width: "100%" }} onClick={handleAdd} disabled={product.quantity === 0}>
            {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
