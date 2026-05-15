import { useAuth } from "../context/AuthContext";

export function Navbar({ page, setPage, cart }) {
  const { user, logout } = useAuth();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <nav className="nav">
      <span className="nav-logo" onClick={() => setPage("home")}>
        METAL-GUMA: <span>PoolPro</span>
      </span>
      <div className="nav-links">
        {!user && (
          <button className="nav-link" onClick={() => setPage("auth")}>
            Sign in/Sign up
          </button>
        )}
        <button
          className={`nav-link ${page === "home" ? "active" : ""}`}
          onClick={() => setPage("home")}
        >
          Home
        </button>
        <button
          className={`nav-link ${page === "projects" ? "active" : ""}`}
          onClick={() => setPage("projects")}
        >
          Projects
        </button>
        <button
          className={`nav-link ${page === "shop" ? "active" : ""}`}
          onClick={() => setPage("shop")}
        >
          Shop
        </button>
        <button className="nav-link btn-outline" onClick={() => setPage("contact")}>
          Contact Us
        </button>
        {user && (
          <>
            <button className="nav-link btn" onClick={() => setPage("profile")}>
              My Profile
            </button>
            <button className="nav-link cart-badge" onClick={() => setPage("cart")}>
              🛒 {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
