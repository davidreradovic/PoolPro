import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function ShopPage({ setPage, setSelectedProduct }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All Products");
  const [sort, setSort] = useState("recommended");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/items", {}, user?.token);
        if (Array.isArray(res)) {
          setItems(res);
        }
      } catch (e) {
        console.error("Failed to fetch items", e);
      }
      setLoading(false);
    };
    fetchItems();
  }, [user]);

  const categories = ["All Products", ...new Set(items.map(i => i.category))];
  const filtered =
    category === "All Products" ? items : items.filter((i) => i.category === category);
  const sorted = [...filtered].sort((a, b) =>
    sort === "price_asc" ? a.unitPrice - b.unitPrice : sort === "price_desc" ? b.unitPrice - a.unitPrice : 0
  );

  return (
    <div className="shop-layout">
      <div className="shop-sidebar">
        <h4>Browse by</h4>
        {categories.map((c) => (
          <button
            key={c}
            className={`sidebar-link ${category === c ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="shop-main">
        <div
          style={{
            width: "100%",
            height: 200,
            background: "linear-gradient(135deg,#0093B2,#006a85)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            color: "#fff",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem" }}>Pool Equipment</h2>
            <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>Professional grade products for every pool</p>
          </div>
        </div>
        <div className="shop-toolbar">
          <div>
            <div className="breadcrumb">
              Home &gt; <span onClick={() => setCategory("All Products")}>All Products</span>
              {category !== "All Products" && ` > ${category}`}
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{category}</div>
            <div className="shop-count">{sorted.length} products</div>
          </div>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recommended">Sort by: Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        <div className="products-grid">
          {loading ? (
            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--mid)" }}>
              Loading products...
            </p>
          ) : sorted.length === 0 ? (
            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--mid)" }}>
              No products found
            </p>
          ) : (
            sorted.map((item) => (
              <div
                key={item.idItem}
                className="product-card"
                onClick={() => {
                  setSelectedProduct(item);
                  setPage("product");
                }}
              >
                <div className="product-card-img" style={{ background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                  📦
                </div>
                <div className="product-card-body">
                  <div className="product-card-name">{item.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--mid)", marginBottom: 8 }}>{item.category}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--mid)", marginBottom: 8 }}>Stock: {item.quantity}</div>
                  <div className="product-card-price">{item.unitPrice.toFixed(2)} KM</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
