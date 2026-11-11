import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function ShopPage({ setPage, setSelectedProduct }) {
  const ITEMS_PER_PAGE = 8;
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [itemPhotos, setItemPhotos] = useState({});
  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/items", {}, user?.token);
        if (Array.isArray(res)) {
          setItems(res);
          // učitaj prvu sliku za svaki proizvod
          const photos = {};
          await Promise.all(
            res.map(async (item) => {
              try {
                const p = await apiFetch(`/item-photos/item/${item.idItem}`);
                if (Array.isArray(p) && p.length > 0) {
                  photos[item.idItem] = p[0].imgUrl || p[0].img;
                }
              } catch (e) {
                console.warn("Failed to load item photo", e);
              }
            })
          );
          setItemPhotos(photos);
        }
      } catch (e) {
        console.error("Failed to fetch items", e);
      }
      setLoading(false);
    };
    fetchItems();
  }, [user]);

  const visibleItems =
    user?.role === "SUPERVISOR"
      ? items
      : items.filter((item) => Number(item.quantity) > 0);
  const categories = ["All Products", ...new Set(visibleItems.map(i => i.category))];
  const query = search.trim().toLowerCase();
  const filtered = visibleItems.filter((item) => {
    const matchesCategory = category === "All Products" || item.category === category;
    const matchesSearch =
      !query ||
      item.title?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
  const sorted = [...filtered].sort((a, b) =>
    sort === "price_asc" ? a.unitPrice - b.unitPrice : sort === "price_desc" ? b.unitPrice - a.unitPrice : 0
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedItems = sorted.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, sort]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
            <div className="shop-count">
              {sorted.length} products
              {sorted.length > 0 && ` - page ${currentPage} of ${totalPages}`}
            </div>
            <label className="shop-mobile-filter">
              <span>Filtriraj po tipu</span>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="shop-actions">
            <input
              className="form-input shop-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
            />
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
        </div>
        <div className="products-grid">
          {loading ? (
            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--mid)" }}>
              Loading products...
            </p>
          ) : sorted.length === 0 ? (
            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--mid)" }}>
              No products found
              {(search || category !== "All Products") && (
                <button
                  className="btn-secondary"
                  style={{ display: "block", margin: "16px auto 0" }}
                  onClick={() => {
                    setSearch("");
                    setCategory("All Products");
                  }}
                >
                  Clear filters
                </button>
              )}
            </p>
          ) : (
            pagedItems.map((item) => (
              <div
                key={item.idItem}
                className="product-card"
                onClick={() => {
                  setSelectedProduct(item);
                  setPage("product");
                }}
              >
                {itemPhotos[item.idItem] ? (
                  <img
                    className="product-card-img"
                    src={itemPhotos[item.idItem]}
                    alt={item.title}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="product-card-img" style={{ background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                    📦
                  </div>
                )}
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
        {!loading && sorted.length > ITEMS_PER_PAGE && (
          <div className="shop-pagination" aria-label="Shop pagination">
            <button
              className="pagination-btn"
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                type="button"
                aria-current={currentPage === page ? "page" : undefined}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
