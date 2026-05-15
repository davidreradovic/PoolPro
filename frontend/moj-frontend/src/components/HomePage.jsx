import { MOCK_PRODUCTS } from "../data/mockData";

export function HomePage({ setPage, setSelectedProduct, addToCart }) {
  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-left">
          <div className="hero-tag">Limited Time Offers</div>
          <h1 className="hero-title">
            New<br />
            Arrivals
          </h1>
          <p className="hero-sub">
            Discover the latest pool equipment and accessories for your perfect pool setup.
          </p>
          <button className="btn-primary" onClick={() => setPage("shop")}>
            Shop Now
          </button>
        </div>
        <div className="hero-right" />
      </div>

      {/* Featured */}
      <div className="section" style={{ background: "var(--white)" }}>
        <div className="featured-grid">
          <div className="featured-img">
            <img src="https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=700" alt="Pool" />
            <div className="featured-badge">
              MG<br />
              Pool<br />
              Pro
            </div>
          </div>
          <div className="featured-content">
            <h2>Featured Items</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--coral)", fontWeight: 700, marginBottom: 8 }}>
              For a Limited Time Only
            </p>
            <p>
              At METAL-GUMA: PoolPro, we're proud to offer a wide variety of high-quality swimming pool
              parts and construction materials. Check out our latest deals and seasonal specials, and find
              the perfect product for your pool.
            </p>
            <button className="btn-primary" onClick={() => setPage("shop")}>
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Top Sellers */}
      <div className="section" style={{ background: "var(--light)" }}>
        <h2 className="section-title">Top Sellers</h2>
        <p className="section-sub">Our most popular pool equipment</p>
        <div className="products-row">
          {MOCK_PRODUCTS.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="product-card"
              onClick={() => {
                setSelectedProduct(p);
                setPage("product");
              }}
            >
              <img className="product-card-img" src={p.img} alt={p.name} />
              <div className="product-card-body">
                <div className="product-card-name">{p.name}</div>
                <div className="product-card-price">{p.price.toFixed(2)} KM</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="section">
        <h2 className="section-title">Our Story</h2>
        <p className="section-sub">Built for You</p>
        <div className="story-box">
          <p>
            At METAL-GUMA: PoolPro, we're passionate about providing the best possible products and
            customer service. Whether you're a pool owner or a professional contractor, we've got everything
            you need to build and maintain a beautiful swimming pool.
          </p>
          <button className="btn-secondary">Learn More About Us</button>
        </div>
      </div>
    </div>
  );
}
