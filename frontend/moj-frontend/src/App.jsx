import { useState, useEffect, createContext, useContext } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const API = "http://localhost:8080/api";

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("poolpro_user")); } catch { return null; }
  });
  const login = (u) => { setUser(u); localStorage.setItem("poolpro_user", JSON.stringify(u)); };
  const logout = () => { setUser(null); localStorage.removeItem("poolpro_user"); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// ─── API helpers ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, token) {
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --coral: #D95F2B;
    --coral-dark: #b84d20;
    --coral-light: #f5ddd3;
    --teal: #0093B2;
    --teal-light: #e0f5fa;
    --dark: #1a1a1a;
    --mid: #555;
    --light: #f8f8f6;
    --white: #ffffff;
    --border: #e4e0da;
    --shadow: 0 2px 16px rgba(0,0,0,0.08);
    --radius: 6px;
  }

  body { font-family: 'Lato', sans-serif; color: var(--dark); background: var(--white); }

  /* NAV */
  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 40px; border-bottom: 1px solid var(--border);
    background: var(--white); position: sticky; top: 0; z-index: 100;
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: var(--coral); cursor: pointer; text-decoration: none; }
  .nav-logo span { color: var(--dark); }
  .nav-links { display: flex; align-items: center; gap: 28px; }
  .nav-link { background: none; border: none; cursor: pointer; font-family: 'Lato', sans-serif; font-size: 0.95rem; color: var(--mid); transition: color .2s; }
  .nav-link:hover, .nav-link.active { color: var(--coral); }
  .nav-link.btn { background: var(--coral); color: #fff; padding: 8px 18px; border-radius: var(--radius); font-weight: 700; }
  .nav-link.btn:hover { background: var(--coral-dark); color: #fff; }
  .nav-link.btn-outline { border: 1.5px solid var(--coral); color: var(--coral); padding: 7px 18px; border-radius: var(--radius); font-weight: 700; }
  .cart-badge { position: relative; }
  .badge { position: absolute; top: -6px; right: -8px; background: var(--coral); color: #fff; font-size: 0.65rem; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }

  /* BUTTONS */
  .btn-primary { background: var(--coral); color: #fff; border: none; padding: 11px 28px; border-radius: var(--radius); font-family: 'Lato', sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: background .2s, transform .15s; }
  .btn-primary:hover { background: var(--coral-dark); transform: translateY(-1px); }
  .btn-secondary { background: transparent; color: var(--coral); border: 1.5px solid var(--coral); padding: 10px 26px; border-radius: var(--radius); font-family: 'Lato', sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all .2s; }
  .btn-secondary:hover { background: var(--coral); color: #fff; }
  .btn-ghost { background: transparent; border: none; cursor: pointer; font-family: 'Lato', sans-serif; font-size: 0.9rem; color: var(--mid); padding: 6px 10px; border-radius: var(--radius); }
  .btn-ghost:hover { background: var(--light); }
  .btn-danger { background: #c0392b; color: #fff; border: none; padding: 8px 18px; border-radius: var(--radius); cursor: pointer; font-size: 0.85rem; }

  /* FORMS */
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px; color: var(--mid); text-transform: uppercase; letter-spacing: .5px; }
  .form-input { width: 100%; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 10px 14px; font-family: 'Lato', sans-serif; font-size: 0.95rem; transition: border-color .2s; outline: none; }
  .form-input:focus { border-color: var(--coral); }
  .form-select { width: 100%; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 10px 14px; font-family: 'Lato', sans-serif; font-size: 0.95rem; background: var(--white); }
  .form-textarea { width: 100%; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 10px 14px; font-family: 'Lato', sans-serif; font-size: 0.95rem; min-height: 90px; resize: vertical; }

  /* HERO */
  .hero { position: relative; height: 520px; overflow: hidden; display: flex; }
  .hero-left { flex: 1; background: linear-gradient(135deg, #0093B2 0%, #006a85 100%); display: flex; flex-direction: column; justify-content: center; padding: 60px 60px; color: #fff; }
  .hero-tag { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; opacity: .8; margin-bottom: 16px; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: 3.2rem; line-height: 1.15; margin-bottom: 16px; }
  .hero-sub { font-size: 1rem; opacity: .85; margin-bottom: 32px; max-width: 360px; line-height: 1.6; }
  .hero-right { width: 45%; background: url('https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=800') center/cover; position: relative; }
  .hero-right::after { content:''; position:absolute; inset:0; background: linear-gradient(to right, rgba(0,147,178,0.3), transparent); }

  /* HOME SECTIONS */
  .section { padding: 72px 40px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: var(--coral); text-align: center; margin-bottom: 8px; }
  .section-sub { text-align: center; color: var(--mid); margin-bottom: 48px; font-size: 1rem; }

  .featured-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; max-width: 1100px; margin: 0 auto; }
  .featured-img { border-radius: 12px; overflow: hidden; position: relative; }
  .featured-img img { width: 100%; height: 340px; object-fit: cover; display: block; }
  .featured-badge { position: absolute; bottom: 24px; right: 24px; background: var(--coral); color: #fff; width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: .5px; }
  .featured-content h2 { font-family: 'Playfair Display', serif; font-size: 2.4rem; margin-bottom: 16px; color: var(--dark); }
  .featured-content p { color: var(--mid); line-height: 1.7; margin-bottom: 28px; }

  .products-row { display: flex; gap: 24px; overflow-x: auto; padding-bottom: 12px; max-width: 1100px; margin: 0 auto; }
  .product-card { flex: 0 0 240px; background: var(--white); border: 1.5px solid var(--border); border-radius: 10px; overflow: hidden; transition: box-shadow .2s, transform .2s; cursor: pointer; }
  .product-card:hover { box-shadow: var(--shadow); transform: translateY(-3px); }
  .product-card-img { width: 100%; height: 180px; object-fit: contain; background: var(--light); padding: 16px; display: block; }
  .product-card-body { padding: 14px 16px; }
  .product-card-name { font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; }
  .product-card-price { color: var(--coral); font-weight: 700; font-size: 1.05rem; }

  .story-box { max-width: 680px; margin: 0 auto; text-align: center; }
  .story-box p { color: var(--mid); line-height: 1.8; margin-bottom: 28px; }

  /* SHOP PAGE */
  .shop-layout { display: flex; gap: 40px; max-width: 1200px; margin: 0 auto; padding: 40px; }
  .shop-sidebar { width: 220px; flex-shrink: 0; }
  .shop-sidebar h4 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--mid); margin-bottom: 10px; margin-top: 28px; }
  .shop-sidebar h4:first-child { margin-top: 0; }
  .sidebar-link { display: block; padding: 6px 0; font-size: 0.95rem; cursor: pointer; color: var(--mid); border: none; background: none; font-family: 'Lato', sans-serif; text-align: left; }
  .sidebar-link:hover, .sidebar-link.active { color: var(--coral); font-weight: 700; }
  .sidebar-check { display: flex; align-items: center; gap: 8px; padding: 5px 0; cursor: pointer; font-size: 0.9rem; }
  .shop-main { flex: 1; }
  .shop-banner { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 24px; background: var(--light); display:flex; align-items:center; justify-content:center; color:var(--mid); font-size:0.9rem; }
  .shop-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .shop-count { font-size: 0.9rem; color: var(--mid); }
  .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

  /* PRODUCT DETAIL */
  .detail-layout { max-width: 1000px; margin: 40px auto; padding: 0 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
  .detail-img { width: 100%; border-radius: 10px; background: var(--light); padding: 32px; display: flex; align-items: center; justify-content: center; min-height: 360px; }
  .detail-img img { max-width: 100%; max-height: 300px; object-fit: contain; }
  .detail-name { font-family: 'Playfair Display', serif; font-size: 1.9rem; margin-bottom: 8px; }
  .detail-price { font-size: 1.4rem; color: var(--coral); font-weight: 700; margin-bottom: 20px; }
  .detail-qty { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .qty-btn { width: 32px; height: 32px; border: 1.5px solid var(--border); background: var(--white); border-radius: 4px; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; }
  .qty-val { font-size: 1rem; font-weight: 700; min-width: 28px; text-align: center; }
  .stars { color: #f59e0b; font-size: 1.2rem; margin-bottom: 8px; }
  .reviews-section { margin-top: 28px; }
  .reviews-section h4 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: var(--mid); margin-bottom: 12px; }
  .comment-empty { color: var(--mid); font-size: 0.9rem; font-style: italic; }

  /* CART */
  .cart-layout { max-width: 1000px; margin: 40px auto; padding: 0 40px; display: grid; grid-template-columns: 1fr 360px; gap: 48px; }
  .cart-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; margin-bottom: 28px; }
  .cart-item { display: flex; align-items: center; gap: 20px; padding: 20px 0; border-bottom: 1px solid var(--border); }
  .cart-item-img { width: 80px; height: 80px; object-fit: contain; background: var(--light); border-radius: 6px; padding: 8px; flex-shrink: 0; }
  .cart-item-name { font-weight: 700; margin-bottom: 4px; }
  .cart-item-price { color: var(--mid); font-size: 0.9rem; }
  .cart-item-price strong { color: var(--coral); font-size: 1rem; }
  .cart-summary { background: var(--light); border-radius: 10px; padding: 28px; height: fit-content; }
  .cart-summary h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; }
  .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; }
  .summary-row.total { font-size: 1.15rem; font-weight: 700; border-top: 1px solid var(--border); padding-top: 14px; margin-top: 4px; }
  .summary-free { color: #27ae60; font-weight: 700; }

  /* PROJECTS */
  .projects-container { max-width: 1100px; margin: 0 auto; padding: 40px; }
  .projects-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
  .projects-header h1 { font-family: 'Playfair Display', serif; font-size: 2rem; }
  .project-card { background: var(--white); border: 1.5px solid var(--border); border-radius: 10px; padding: 24px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 20px; transition: box-shadow .2s; cursor: pointer; }
  .project-card:hover { box-shadow: var(--shadow); }
  .project-card-info h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 4px; }
  .project-card-info p { font-size: 0.88rem; color: var(--mid); }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
  .status-todo { background: #fef3c7; color: #d97706; }
  .status-in_progress { background: #dbeafe; color: #1d4ed8; }
  .status-done { background: #d1fae5; color: #065f46; }
  .status-cancelled { background: #fee2e2; color: #991b1b; }

  /* TASKS */
  .tasks-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .task-column { background: var(--light); border-radius: 10px; padding: 16px; }
  .task-col-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; color: var(--mid); }
  .task-card { background: var(--white); border-radius: 8px; padding: 14px; margin-bottom: 10px; border: 1px solid var(--border); font-size: 0.9rem; }
  .task-card h4 { font-size: 0.92rem; font-weight: 700; margin-bottom: 4px; }
  .task-card .assignee { font-size: 0.8rem; color: var(--mid); margin-top: 6px; }
  .task-card .deadline { font-size: 0.78rem; color: var(--coral); margin-top: 2px; }

  /* MESSAGES */
  .messages-layout { max-width: 700px; margin: 40px auto; padding: 0 40px; }
  .message-bubble { max-width: 70%; padding: 12px 16px; border-radius: 18px; margin-bottom: 10px; font-size: 0.92rem; line-height: 1.5; }
  .message-bubble.sent { background: var(--coral); color: #fff; margin-left: auto; border-bottom-right-radius: 4px; }
  .message-bubble.recv { background: var(--light); color: var(--dark); border-bottom-left-radius: 4px; }
  .message-ts { font-size: 0.72rem; opacity: .65; margin-top: 3px; }
  .message-input-row { display: flex; gap: 12px; margin-top: 20px; }

  /* AUTH */
  .auth-page { min-height: calc(100vh - 60px); display: flex; align-items: stretch; }
  .auth-form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 60px 40px; }
  .auth-form-box { width: 100%; max-width: 380px; }
  .auth-tabs { display: flex; gap: 24px; margin-bottom: 32px; }
  .auth-tab { background: none; border: none; font-family: 'Playfair Display', serif; font-size: 1.5rem; cursor: pointer; color: var(--mid); padding-bottom: 6px; border-bottom: 3px solid transparent; transition: all .2s; }
  .auth-tab.active { color: var(--coral); border-bottom-color: var(--coral); }
  .auth-img-side { width: 48%; background: url('https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800') center/cover; }

  /* PROFILE */
  .profile-hero { height: 220px; background: url('https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200') center/cover; position: relative; }
  .profile-card { max-width: 680px; margin: -60px auto 0; position: relative; background: var(--white); border-radius: 12px; box-shadow: var(--shadow); padding: 40px; text-align: center; }
  .profile-avatar { width: 90px; height: 90px; border-radius: 50%; background: var(--light); border: 4px solid var(--white); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 2.4rem; box-shadow: var(--shadow); }
  .profile-name { font-family: 'Playfair Display', serif; font-size: 1.6rem; margin-bottom: 4px; }
  .profile-role { color: var(--mid); margin-bottom: 20px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
  .profile-links { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
  .profile-link { background: var(--light); border: none; padding: 12px 16px; border-radius: var(--radius); text-align: left; cursor: pointer; font-family: 'Lato', sans-serif; font-size: 0.95rem; color: var(--coral); font-weight: 700; transition: background .2s; }
  .profile-link:hover { background: var(--coral-light); }
  .profile-link.danger { color: #c0392b; }

  /* ADMIN / SUPERVISOR */
  .admin-layout { display: flex; min-height: calc(100vh - 60px); }
  .admin-sidebar { width: 240px; background: var(--dark); padding: 32px 0; flex-shrink: 0; }
  .admin-sidebar-item { display: block; width: 100%; text-align: left; background: none; border: none; padding: 14px 28px; color: rgba(255,255,255,.7); font-family: 'Lato', sans-serif; font-size: 0.92rem; cursor: pointer; transition: all .2s; }
  .admin-sidebar-item:hover, .admin-sidebar-item.active { background: rgba(255,255,255,.08); color: var(--coral); padding-left: 34px; }
  .admin-content { flex: 1; padding: 40px; overflow-y: auto; }
  .admin-content h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; margin-bottom: 28px; }

  /* TABLE */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th { background: var(--light); text-align: left; padding: 10px 16px; font-size: 0.78rem; text-transform: uppercase; letter-spacing: .5px; color: var(--mid); border-bottom: 1.5px solid var(--border); }
  td { padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tr:hover td { background: rgba(0,0,0,.02); }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
  .modal { background: var(--white); border-radius: 12px; padding: 36px; width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
  .modal h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 24px; }
  .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

  /* ALERTS */
  .alert { padding: 12px 20px; border-radius: var(--radius); margin-bottom: 16px; font-size: 0.9rem; }
  .alert-error { background: #fee2e2; color: #991b1b; }
  .alert-success { background: #d1fae5; color: #065f46; }

  /* ORDER CONFIRM */
  .order-confirm { max-width: 640px; margin: 40px auto; padding: 0 40px; }
  .order-confirm-box { background: #fdf0ea; border-radius: 12px; padding: 36px; }
  .order-confirm h1 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 6px; }
  .order-item-row { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
  .order-item-row img { width: 50px; height: 50px; object-fit: contain; background: var(--white); border-radius: 6px; padding: 4px; flex-shrink: 0; }
  .divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

  /* CONTACT */
  .contact-container { max-width: 680px; margin: 60px auto; padding: 0 40px; }
  .contact-container h1 { font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 8px; }
  .contact-container p { color: var(--mid); margin-bottom: 36px; }

  /* empty state */
  .empty { text-align:center; padding:60px 20px; color:var(--mid); }
  .empty-icon { font-size:3rem; margin-bottom:16px; }

  /* breadcrumb */
  .breadcrumb { font-size:0.85rem; color:var(--mid); margin-bottom:20px; }
  .breadcrumb span { cursor:pointer; }
  .breadcrumb span:hover { color:var(--coral); }

  /* loading */
  .loading { text-align:center; padding:48px; color:var(--mid); }

  @media(max-width:768px){
    .hero{ flex-direction:column; height:auto; }
    .hero-right{ width:100%; height:200px; }
    .products-grid{ grid-template-columns:repeat(2,1fr); }
    .shop-layout{ flex-direction:column; padding:20px; }
    .shop-sidebar{ width:100%; }
    .detail-layout{ grid-template-columns:1fr; gap:32px; padding:0 20px; }
    .cart-layout{ grid-template-columns:1fr; padding:0 20px; }
    .tasks-board{ grid-template-columns:repeat(2,1fr); }
    .nav{ padding:12px 20px; }
    .featured-grid{ grid-template-columns:1fr; }
  }
`;

// ─── Mock data for demo ───────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: 1, name: "MaxFlo Pool Filter", price: 220, category: "Filters", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", desc: "High-capacity filter for superior water purification and clarity." },
  { id: 2, name: "CrystalClear Pool Filter", price: 180, category: "Filters", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", desc: "Premium cartridge filter for crystal-clear pool water." },
  { id: 3, name: "EcoPure Pool Filter", price: 200, category: "Filters", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", desc: "Eco-friendly pool filtration system." },
  { id: 4, name: "PowerFlow Pool Pump", price: 250, category: "Pumps", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", desc: "High-performance pump for large pools." },
  { id: 5, name: "TurboFlow Pool Pump", price: 300, category: "Pumps", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", desc: "Turbo-charged pump for maximum water circulation." },
  { id: 6, name: "UltraJet Pool Pump", price: 282, category: "Pumps", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", desc: "Ultra-efficient pump with low power consumption." },
  { id: 7, name: "ProScrub Pool Brush", price: 50, category: "Cleaning Equipment", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", desc: "Professional pool brush for thorough cleaning." },
  { id: 8, name: "AquaSweep Pool Vacuum", price: 150, category: "Cleaning Equipment", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", desc: "Automatic pool vacuum for effortless cleaning." },
  { id: 9, name: "TurboSkim Pool Skimmer", price: 80, category: "Cleaning Equipment", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", desc: "Fast-action skimmer for surface debris." },
];

// ─── Components ───────────────────────────────────────────────────────────────

function Navbar({ page, setPage, cart }) {
  const { user, logout } = useAuth();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  return (
    <nav className="nav">
      <span className="nav-logo" onClick={() => setPage("home")}>METAL-GUMA: <span>PoolPro</span></span>
      <div className="nav-links">
        {!user && <button className="nav-link" onClick={() => setPage("auth")}>Sign in/Sign up</button>}
        <button className={`nav-link ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>Home</button>
        <button className={`nav-link ${page === "projects" ? "active" : ""}`} onClick={() => setPage("projects")}>Projects</button>
        <button className={`nav-link ${page === "shop" ? "active" : ""}`} onClick={() => setPage("shop")}>Shop</button>
        <button className="nav-link btn-outline" onClick={() => setPage("contact")}>Contact Us</button>
        {user && (
          <>
            <button className="nav-link btn" onClick={() => setPage("profile")}>My Profile</button>
            <button className="nav-link cart-badge" onClick={() => setPage("cart")}>
              🛒 {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ setPage, setSelectedProduct, addToCart }) {
  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-left">
          <div className="hero-tag">Limited Time Offers</div>
          <h1 className="hero-title">New<br/>Arrivals</h1>
          <p className="hero-sub">Discover the latest pool equipment and accessories for your perfect pool setup.</p>
          <button className="btn-primary" onClick={() => setPage("shop")}>Shop Now</button>
        </div>
        <div className="hero-right" />
      </div>

      {/* Featured */}
      <div className="section" style={{ background: "var(--white)" }}>
        <div className="featured-grid">
          <div className="featured-img">
            <img src="https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=700" alt="Pool" />
            <div className="featured-badge">MG<br/>Pool<br/>Pro</div>
          </div>
          <div className="featured-content">
            <h2>Featured Items</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--coral)", fontWeight: 700, marginBottom: 8 }}>For a Limited Time Only</p>
            <p>At METAL-GUMA: PoolPro, we're proud to offer a wide variety of high-quality swimming pool parts and construction materials. Check out our latest deals and seasonal specials, and find the perfect product for your pool.</p>
            <button className="btn-primary" onClick={() => setPage("shop")}>Shop Now</button>
          </div>
        </div>
      </div>

      {/* Top Sellers */}
      <div className="section" style={{ background: "var(--light)" }}>
        <h2 className="section-title">Top Sellers</h2>
        <p className="section-sub">Our most popular pool equipment</p>
        <div className="products-row">
          {MOCK_PRODUCTS.slice(0, 6).map(p => (
            <div key={p.id} className="product-card" onClick={() => { setSelectedProduct(p); setPage("product"); }}>
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
          <p>At METAL-GUMA: PoolPro, we're passionate about providing the best possible products and customer service. Whether you're a pool owner or a professional contractor, we've got everything you need to build and maintain a beautiful swimming pool.</p>
          <button className="btn-secondary">Learn More About Us</button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ setPage }) {
  const { login } = useAuth();
  const [tab, setTab] = useState("signin");
  const [form, setForm] = useState({ username: "", password: "", firstName: "", lastName: "", email: "", phone: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr(""); setLoading(true);
    try {
      const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ username: form.username, password: form.password }) });
      if (res && res.token) { login(res); setPage("home"); }
      else setErr(typeof res === "string" ? res : "Login failed");
    } catch { setErr("Server unavailable. Using demo mode."); }
    setLoading(false);
  };

  const handleRegister = async () => {
    setErr(""); setLoading(true);
    try {
      const res = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ ...form, role: "CLIENT" }) });
      if (typeof res === "string" && res.toLowerCase().includes("success")) { setOk("Registration successful! Please sign in."); setTab("signin"); }
      else setErr(typeof res === "string" ? res : "Registration failed");
    } catch { setErr("Server unavailable."); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "signin" ? "active" : ""}`} onClick={() => setTab("signin")}>Sign in</button>
            <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Sign up</button>
          </div>
          {err && <div className="alert alert-error">{err}</div>}
          {ok && <div className="alert alert-success">{ok}</div>}
          {tab === "signin" ? (
            <>
              <div className="form-group"><label className="form-label">Username</label><input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Enter username" /></div>
              <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password" /></div>
              <div style={{ marginBottom: 20 }}><button style={{ background: "none", border: "none", color: "var(--coral)", cursor: "pointer", fontSize: "0.88rem" }}>Forgot password?</button></div>
              <button className="btn-primary" style={{ width: "100%" }} onClick={handleLogin} disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
            </>
          ) : (
            <>
              <div className="form-group"><label className="form-label">Username</label><input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <button className="btn-primary" style={{ width: "100%" }} onClick={handleRegister} disabled={loading}>{loading ? "Registering..." : "Create Account"}</button>
            </>
          )}
        </div>
      </div>
      <div className="auth-img-side" />
    </div>
  );
}

// ─── SHOP PAGE ────────────────────────────────────────────────────────────────
function ShopPage({ setPage, setSelectedProduct }) {
  const [category, setCategory] = useState("All Products");
  const [sort, setSort] = useState("recommended");
  const cats = ["All Products", "Cleaning Equipment", "Filters", "Pumps"];
  const filtered = category === "All Products" ? MOCK_PRODUCTS : MOCK_PRODUCTS.filter(p => p.category === category);
  const sorted = [...filtered].sort((a, b) => sort === "price_asc" ? a.price - b.price : sort === "price_desc" ? b.price - a.price : 0);

  return (
    <div className="shop-layout">
      <div className="shop-sidebar">
        <h4>Browse by</h4>
        {cats.map(c => <button key={c} className={`sidebar-link ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</button>)}
        <h4>Filter by</h4>
        <h4 style={{ fontSize: "0.75rem" }}>Product type</h4>
        {["Cleaning Equipment", "Pumps", "Filters"].map(c => (
          <label key={c} className="sidebar-check"><input type="checkbox" onChange={() => setCategory(c)} checked={category === c} />{c}</label>
        ))}
      </div>
      <div className="shop-main">
        <div style={{ width: "100%", height: 200, background: "linear-gradient(135deg,#0093B2,#006a85)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, color: "#fff" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem" }}>Pool Equipment</h2>
            <p style={{ opacity: .8, fontSize: "0.9rem" }}>Professional grade products for every pool</p>
          </div>
        </div>
        <div className="shop-toolbar">
          <div>
            <div className="breadcrumb">Home &gt; <span onClick={() => setCategory("All Products")}>All Products</span>{category !== "All Products" && ` > ${category}`}</div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{category}</div>
            <div className="shop-count">{sorted.length} products</div>
          </div>
          <select className="form-select" style={{ width: "auto" }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="recommended">Sort by: Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        <div className="products-grid">
          {sorted.map(p => (
            <div key={p.id} className="product-card" onClick={() => { setSelectedProduct(p); setPage("product"); }}>
              <img className="product-card-img" src={p.img} alt={p.name} />
              <div className="product-card-body">
                <div className="product-card-name">{p.name}</div>
                <div className="product-card-price">{p.price.toFixed(2)} KM</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL ────────────────────────────────────────────────────────────
function ProductPage({ product, setPage, addToCart }) {
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
          <span onClick={() => setPage("home")}>Home</span> / <span onClick={() => setPage("shop")}>Shop</span> / {product.name}
          <span style={{ float: "right", color: "var(--mid)" }}>
            <button className="btn-ghost">‹ Prev</button> | <button className="btn-ghost">Next ›</button>
          </span>
        </div>
      </div>
      <div className="detail-layout">
        <div className="detail-img">
          <img src={product.img} alt={product.name} />
        </div>
        <div>
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-price">{product.price.toFixed(2)} KM</div>
          <p style={{ color: "var(--mid)", marginBottom: 20, lineHeight: 1.7 }}>{product.desc}</p>
          <div style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: 8 }}>Quantity</div>
          <div className="detail-qty">
            <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span className="qty-val">{qty}</span>
            <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
          </div>
          {added && <div className="alert alert-success" style={{ marginBottom: 12 }}>Added to cart!</div>}
          <button className="btn-primary" style={{ width: "100%" }} onClick={handleAdd}>Add to Cart</button>
          <div className="reviews-section">
            <div className="stars">★★★★★</div>
            <h4>Reviews:</h4>
            <h4 style={{ marginTop: 12 }}>Comments:</h4>
            <p className="comment-empty">No comments posted</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CART PAGE ────────────────────────────────────────────────────────────────
function CartPage({ cart, setCart, setPage, setOrderItems }) {
  const { user } = useAuth();
  const update = (id, delta) => setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const remove = (id) => setCart(c => c.filter(i => i.id !== id));
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const checkout = () => {
    if (!user) { setPage("auth"); return; }
    setOrderItems([...cart]);
    setCart([]);
    setPage("order-confirm");
  };

  return (
    <div className="cart-layout">
      <div>
        <h1 className="cart-title">My cart</h1>
        {cart.length === 0 ? (
          <div className="empty"><div className="empty-icon">🛒</div><p>Your cart is empty</p><button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setPage("shop")}>Continue Shopping</button></div>
        ) : cart.map(item => (
          <div key={item.id} className="cart-item">
            <img className="cart-item-img" src={item.img} alt={item.name} />
            <div style={{ flex: 1 }}>
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">{item.price.toFixed(2)} KM</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="qty-btn" onClick={() => update(item.id, -1)}>−</button>
              <span className="qty-val">{item.qty}</span>
              <button className="qty-btn" onClick={() => update(item.id, 1)}>+</button>
            </div>
            <div className="cart-item-price"><strong>{(item.price * item.qty).toFixed(2)} KM</strong></div>
            <button className="btn-ghost" onClick={() => remove(item.id)}>✕</button>
          </div>
        ))}
      </div>
      <div>
        <div className="cart-summary">
          <h3>Order summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>{subtotal.toFixed(2)} KM</span></div>
          <div className="summary-row"><span>Delivery</span><span className="summary-free">FREE</span></div>
          <div style={{ fontSize: "0.8rem", color: "var(--mid)", marginBottom: 8 }}>Bosnia and Herzegovina</div>
          <div className="summary-row"><span>Sales Tax</span><span>0.00 KM</span></div>
          <div className="summary-row total"><span>Total</span><span>{subtotal.toFixed(2)} KM</span></div>
          <button className="btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={checkout}>Checkout</button>
          <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--mid)", marginTop: 8 }}>🔒 Secure Checkout</div>
        </div>
        <div style={{ marginTop: 16, fontSize: "0.85rem" }}>
          <button className="btn-ghost">🏷 Enter a promo code</button><br />
          <button className="btn-ghost">📝 Add a note</button>
        </div>
      </div>
    </div>
  );
}

// ─── ORDER CONFIRM ────────────────────────────────────────────────────────────
function OrderConfirmPage({ items, setPage }) {
  const { user } = useAuth();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="order-confirm">
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", marginBottom: 6 }}>Thank you, {user?.firstName || "Customer"}!</h1>
      <p style={{ color: "var(--mid)", marginBottom: 28 }}>You'll receive a confirmation email soon.</p>
      <div className="order-confirm-box">
        {items.map(item => (
          <div key={item.id} className="order-item-row">
            <img src={item.img} alt={item.name} width={50} height={50} style={{ objectFit: "contain", background: "white", borderRadius: 6, padding: 4, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <div style={{ fontSize: "0.88rem", color: "var(--mid)" }}>Qty: {item.qty} · Price: <strong>{item.price.toFixed(2)} KM</strong></div>
            </div>
          </div>
        ))}
        <hr className="divider" />
        <div style={{ fontSize: "0.9rem" }}>
          <div>Subtotal: <strong>{subtotal.toFixed(2)} KM</strong></div>
          <div>Delivery: <strong style={{ color: "#27ae60" }}>Free</strong></div>
          <div>Sales tax: <strong>0.00 KM</strong></div>
          <div style={{ fontSize: "1.05rem", marginTop: 8 }}>TOTAL: <strong style={{ color: "var(--coral)" }}>{subtotal.toFixed(2)} KM</strong></div>
        </div>
      </div>
      <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => setPage("home")}>Back to Home</button>
    </div>
  );
}

// ─── PROJECTS PAGE ────────────────────────────────────────────────────────────
function ProjectsPage({ setPage, setSelectedProject }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("list"); // list | board
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", idClient: "", idSupervisor: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/projects", {}, user?.token);
      if (Array.isArray(res)) setProjects(res);
    } catch { }
    setLoading(false);
  };

  const createProject = async () => {
    try {
      await apiFetch("/projects", { method: "POST", body: JSON.stringify({ ...form, idClient: parseInt(form.idClient), idSupervisor: parseInt(form.idSupervisor) }) }, user?.token);
      fetchProjects();
      setShowModal(false);
    } catch { }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/projects/${id}/status?status=${status}`, { method: "PUT" }, user?.token);
      fetchProjects();
    } catch { }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await apiFetch(`/projects/${id}`, { method: "DELETE" }, user?.token);
      fetchProjects();
    } catch { }
  };

  if (!user) return (
    <div className="empty" style={{ marginTop: 60 }}>
      <div className="empty-icon">🔒</div>
      <p>Please sign in to view projects</p>
      <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setPage("auth")}>Sign In</button>
    </div>
  );

  const statusColor = (s) => ({ todo: "status-todo", in_progress: "status-in_progress", done: "status-done", cancelled: "status-cancelled" }[s] || "status-todo");

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button className={`btn-ghost ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>☰ List</button>
          <button className={`btn-ghost ${view === "board" ? "active" : ""}`} onClick={() => setView("board")}>⊞ Board</button>
          {(user?.role === "SUPERVISOR" || user?.role === "EMPLOYEE") && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
          )}
        </div>
      </div>

      {loading ? <div className="loading">Loading projects...</div> : (
        projects.length === 0 ? (
          <div className="empty"><div className="empty-icon">📋</div><p>No projects found</p></div>
        ) : view === "list" ? (
          projects.map(p => (
            <div key={p.idProject} className="project-card" onClick={() => { setSelectedProject(p); setPage("project-detail"); }}>
              <div className="project-card-info">
                <h3>{p.title || p.name}</h3>
                <p>{p.description?.slice(0, 80)}{p.description?.length > 80 ? "…" : ""}</p>
                {p.createdAt && <p style={{ marginTop: 4 }}>{new Date(p.createdAt).toLocaleDateString()}</p>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className={`status-badge ${statusColor(p.status)}`}>{p.status}</span>
                {user?.role === "SUPERVISOR" && (
                  <select className="form-select" style={{ width: "auto", fontSize: "0.82rem" }} value={p.status}
                    onClick={e => e.stopPropagation()} onChange={e => updateStatus(p.idProject, e.target.value)}>
                    <option value="todo">todo</option>
                    <option value="in_progress">in_progress</option>
                    <option value="done">done</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                )}
                {user?.role === "SUPERVISOR" && (
                  <button className="btn-danger" onClick={e => { e.stopPropagation(); deleteProject(p.idProject); }}>Delete</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <TasksBoardView projects={projects} user={user} />
        )
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Project</h2>
            <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Client ID</label><input className="form-input" type="number" value={form.idClient} onChange={e => setForm({ ...form, idClient: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Supervisor ID</label><input className="form-input" type="number" value={form.idSupervisor} onChange={e => setForm({ ...form, idSupervisor: e.target.value })} /></div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={createProject}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TasksBoardView({ projects, user }) {
  const [allTasks, setAllTasks] = useState([]);
  useEffect(() => {
    const load = async () => {
      const results = await Promise.allSettled(projects.map(p => apiFetch(`/projects/${p.idProject}/tasks`, {}, user?.token)));
      const tasks = results.flatMap(r => r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []);
      setAllTasks(tasks);
    };
    load();
  }, [projects]);

  const cols = ["todo", "in_progress", "done", "cancelled"];
  const colLabels = { todo: "To Do", in_progress: "In Progress", done: "Done", cancelled: "Cancelled" };
  return (
    <div className="tasks-board">
      {cols.map(col => (
        <div key={col} className="task-column">
          <div className="task-col-title">{colLabels[col]} ({allTasks.filter(t => t.status === col).length})</div>
          {allTasks.filter(t => t.status === col).map(t => (
            <div key={t.idTask} className="task-card">
              <h4>{t.title}</h4>
              <p style={{ fontSize: "0.82rem", color: "var(--mid)" }}>{t.description?.slice(0, 60)}</p>
              {t.employee && <div className="assignee">👤 {t.employee}</div>}
              {t.deadline && <div className="deadline">📅 {t.deadline}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── PROJECT DETAIL ────────────────────────────────────────────────────────────
function ProjectDetailPage({ project, setPage }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", deadline: "", idEmployee: "" });

  useEffect(() => {
    if (!project) return;
    apiFetch(`/projects/${project.idProject}/tasks`, {}, user?.token).then(r => Array.isArray(r) && setTasks(r));
    apiFetch("/employees", {}, user?.token).then(r => Array.isArray(r) && setEmployees(r));
  }, [project]);

  const createTask = async () => {
    await apiFetch("/tasks", { method: "POST", body: JSON.stringify({ idProject: project.idProject, title: taskForm.title, description: taskForm.description, deadline: taskForm.deadline || null, idEmployee: taskForm.idEmployee ? parseInt(taskForm.idEmployee) : null }) }, user?.token);
    apiFetch(`/projects/${project.idProject}/tasks`, {}, user?.token).then(r => Array.isArray(r) && setTasks(r));
    setShowTaskModal(false);
  };

  const updateTaskStatus = async (taskId, status) => {
    await apiFetch(`/tasks/${taskId}/status?status=${status}`, { method: "PUT" }, user?.token);
    apiFetch(`/projects/${project.idProject}/tasks`, {}, user?.token).then(r => Array.isArray(r) && setTasks(r));
  };

  const cols = ["todo", "in_progress", "done", "cancelled"];
  const colLabels = { todo: "To Do", in_progress: "In Progress", done: "Done", cancelled: "Cancelled" };

  return (
    <div style={{ padding: "40px" }}>
      <div className="breadcrumb"><span onClick={() => setPage("projects")}>Projects</span> / {project?.title}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem" }}>{project?.title}</h1>
          <p style={{ color: "var(--mid)", marginTop: 6 }}>{project?.description}</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className={`status-badge status-${project?.status}`}>{project?.status}</span>
          {user?.role === "SUPERVISOR" && <button className="btn-primary" onClick={() => setShowTaskModal(true)}>+ Add Task</button>}
          {(user?.role === "CLIENT" || user?.role === "SUPERVISOR") && (
            <button className="btn-secondary" onClick={() => setPage("messages")}>💬 Messages</button>
          )}
        </div>
      </div>
      <div className="tasks-board">
        {cols.map(col => (
          <div key={col} className="task-column">
            <div className="task-col-title">{colLabels[col]}</div>
            {tasks.filter(t => t.status === col).map(t => (
              <div key={t.idTask} className="task-card">
                <h4>{t.title}</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--mid)", marginTop: 4 }}>{t.description?.slice(0, 80)}</p>
                {t.employee && <div className="assignee">👤 {t.employee}</div>}
                {t.deadline && <div className="deadline">📅 {t.deadline}</div>}
                {(user?.role === "SUPERVISOR" || user?.role === "EMPLOYEE") && (
                  <select className="form-select" style={{ marginTop: 8, fontSize: "0.8rem" }} value={t.status} onChange={e => updateTaskStatus(t.idTask, e.target.value)}>
                    {cols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Task</h2>
            <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Deadline</label><input className="form-input" type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} /></div>
            <div className="form-group">
              <label className="form-label">Assign to Employee</label>
              <select className="form-select" value={taskForm.idEmployee} onChange={e => setTaskForm({ ...taskForm, idEmployee: e.target.value })}>
                <option value="">— Unassigned —</option>
                {employees.map(emp => <option key={emp.idEmployee} value={emp.idEmployee}>{emp.user?.firstName} {emp.user?.lastName}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={createTask}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MESSAGES PAGE ────────────────────────────────────────────────────────────
function MessagesPage({ setPage }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [content, setContent] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    apiFetch("/users", {}, user.token).then(r => Array.isArray(r) && setUsers(r.filter(u => u.idUser !== user.id)));
  }, [user]);

  const fetchConv = async () => {
    if (!receiverId) return;
    const res = await apiFetch(`/messages/conversation?user1Id=${user.id}&user2Id=${receiverId}`, {}, user.token);
    if (Array.isArray(res)) setMsgs(res);
  };

  const sendMsg = async () => {
    if (!content.trim() || !receiverId) return;
    await apiFetch("/messages", { method: "POST", body: JSON.stringify({ receiverId: parseInt(receiverId), content }) }, user.token);
    setContent("");
    fetchConv();
  };

  if (!user) return <div className="empty" style={{ marginTop: 60 }}><div className="empty-icon">🔒</div><p>Please sign in</p></div>;

  return (
    <div className="messages-layout">
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", marginBottom: 28 }}>Messages</h1>
      <div className="form-group">
        <label className="form-label">Conversation with</label>
        <select className="form-select" value={receiverId} onChange={e => { setReceiverId(e.target.value); }}>
          <option value="">Select user…</option>
          {users.map(u => <option key={u.idUser} value={u.idUser}>{u.firstName} {u.lastName} ({u.username})</option>)}
        </select>
        <button className="btn-secondary" style={{ marginTop: 10 }} onClick={fetchConv}>Load Conversation</button>
      </div>
      <div style={{ minHeight: 300, background: "var(--light)", borderRadius: 10, padding: 20, marginTop: 8 }}>
        {msgs.length === 0 ? <p style={{ color: "var(--mid)", fontSize: "0.9rem" }}>No messages yet</p> : msgs.map(m => (
          <div key={m.idMessage} style={{ display: "flex", flexDirection: "column", alignItems: m.senderId === user.id ? "flex-end" : "flex-start" }}>
            <div className={`message-bubble ${m.senderId === user.id ? "sent" : "recv"}`}>
              {m.content}
              <div className="message-ts">{m.senderName} · {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ""}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="message-input-row">
        <input className="form-input" style={{ flex: 1 }} placeholder="Type a message…" value={content} onChange={e => setContent(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} />
        <button className="btn-primary" onClick={sendMsg}>Send</button>
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ────────────────────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>Have questions about our products or services? We're here to help.</p>
      {sent ? (
        <div className="alert alert-success">Thank you! We'll get back to you soon.</div>
      ) : (
        <>
          <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" style={{ minHeight: 120 }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
          <button className="btn-primary" onClick={() => setSent(true)}>Send Message</button>
        </>
      )}
      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        {[{ icon: "📍", label: "Address", val: "Banja Luka, Bosnia" }, { icon: "📞", label: "Phone", val: "+387 51 000 000" }, { icon: "✉️", label: "Email", val: "info@metalguma.ba" }].map(c => (
          <div key={c.label} style={{ textAlign: "center", padding: 24, background: "var(--light)", borderRadius: 10 }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
            <div style={{ color: "var(--mid)", fontSize: "0.9rem" }}>{c.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ setPage }) {
  const { user, logout } = useAuth();
  if (!user) return <div className="empty" style={{ marginTop: 60 }}><div className="empty-icon">🔒</div><p>Please sign in</p></div>;
  return (
    <div>
      <div className="profile-hero" />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 40px" }}>
        <div className="profile-card">
          <div className="profile-avatar">👤</div>
          <div className="profile-name">{user.firstName} {user.lastName}</div>
          <div className="profile-role">{user.role}</div>
          <div style={{ fontSize: "0.9rem", color: "var(--mid)" }}>@{user.username} · {user.email}</div>
          <div className="profile-links">
            {user.role === "CLIENT" && <button className="profile-link" onClick={() => setPage("projects")}>My Projects</button>}
            {user.role === "CLIENT" && <button className="profile-link" onClick={() => setPage("cart")}>My Orders</button>}
            {user.role === "SUPERVISOR" && <button className="profile-link" onClick={() => setPage("projects")}>Manage Projects</button>}
            {user.role === "SUPERVISOR" && <button className="profile-link" onClick={() => setPage("admin")}>Admin Panel</button>}
            {user.role === "EMPLOYEE" && <button className="profile-link" onClick={() => setPage("projects")}>My Tasks</button>}
            {(user.role === "CLIENT" || user.role === "SUPERVISOR") && <button className="profile-link" onClick={() => setPage("messages")}>Messages</button>}
            <button className="profile-link" style={{ color: "var(--mid)" }}>Change Password</button>
            <button className="profile-link danger" onClick={() => { logout(); setPage("home"); }}>Log out</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({ setPage }) {
  const { user } = useAuth();
  const [section, setSection] = useState("users");
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({ username: "", firstName: "", lastName: "", email: "", phone: "", password: "", role: "EMPLOYEE", description: "" });
  const [regMsg, setRegMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    apiFetch("/users", {}, user.token).then(r => Array.isArray(r) && setUsers(r));
    apiFetch("/employees", {}, user.token).then(r => Array.isArray(r) && setEmployees(r));
    apiFetch("/projects", {}, user.token).then(r => Array.isArray(r) && setProjects(r));
  }, [user]);

  const registerEmployee = async () => {
    const res = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(regForm) }, user.token);
    setRegMsg(typeof res === "string" ? res : "Done");
    if (typeof res === "string" && res.toLowerCase().includes("success")) {
      setShowRegModal(false);
      apiFetch("/employees", {}, user.token).then(r => Array.isArray(r) && setEmployees(r));
    }
  };

  const updateEmpStatus = async (id, status) => {
    await apiFetch(`/employees/${id}/status?status=${status}`, { method: "PUT" }, user.token);
    apiFetch("/employees", {}, user.token).then(r => Array.isArray(r) && setEmployees(r));
  };

  if (!user || user.role !== "SUPERVISOR") return (
    <div className="empty" style={{ marginTop: 60 }}>
      <div className="empty-icon">🔒</div><p>Supervisor access required</p>
    </div>
  );

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div style={{ padding: "0 28px 24px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "1.1rem" }}>PoolPro</div>
          <div style={{ color: "rgba(255,255,255,.5)", fontSize: "0.8rem" }}>Admin Panel</div>
        </div>
        {[{ id: "users", label: "👥 Users" }, { id: "employees", label: "🔧 Employees" }, { id: "projects", label: "📋 Projects" }].map(s => (
          <button key={s.id} className={`admin-sidebar-item ${section === s.id ? "active" : ""}`} onClick={() => setSection(s.id)}>{s.label}</button>
        ))}
        <button className="admin-sidebar-item" onClick={() => setPage("profile")}>← Back to Profile</button>
      </div>
      <div className="admin-content">
        {section === "users" && (
          <>
            <h1>Users</h1>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Username</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
                <tbody>{users.map(u => (
                  <tr key={u.idUser}>
                    <td>{u.idUser}</td><td>{u.username}</td>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td><td>{u.phone}</td>
                    <td><span className={`status-badge ${u.status === "active" ? "status-done" : "status-cancelled"}`}>{u.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
        {section === "employees" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h1>Employees</h1>
              <button className="btn-primary" onClick={() => { setRegMsg(""); setShowRegModal(true); }}>+ Register Employee</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{employees.map(e => (
                  <tr key={e.idEmployee}>
                    <td>{e.idEmployee}</td>
                    <td>{e.user?.firstName} {e.user?.lastName}</td>
                    <td>{e.user?.email}</td>
                    <td>{e.description}</td>
                    <td><span className={`status-badge ${e.user?.status === "active" ? "status-done" : "status-cancelled"}`}>{e.user?.status}</span></td>
                    <td>
                      <select className="form-select" style={{ width: "auto", fontSize: "0.82rem" }} value={e.user?.status || "active"} onChange={ev => updateEmpStatus(e.idEmployee, ev.target.value)}>
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
        {section === "projects" && (
          <>
            <h1>All Projects</h1>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Created</th><th>Public</th></tr></thead>
                <tbody>{projects.map(p => (
                  <tr key={p.idProject}>
                    <td>{p.idProject}</td><td>{p.title}</td>
                    <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                    <td>{p.publicProject ? "✓" : "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showRegModal && (
        <div className="modal-overlay" onClick={() => setShowRegModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Register Employee / Supervisor</h2>
            {regMsg && <div className={`alert ${regMsg.toLowerCase().includes("success") ? "alert-success" : "alert-error"}`}>{regMsg}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={regForm.firstName} onChange={e => setRegForm({ ...regForm, firstName: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={regForm.lastName} onChange={e => setRegForm({ ...regForm, lastName: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Username</label><input className="form-input" value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} /></div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={regForm.role} onChange={e => setRegForm({ ...regForm, role: e.target.value })}>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={regForm.description} onChange={e => setRegForm({ ...regForm, description: e.target.value })} /></div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRegModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={registerEmployee}>Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  const addToCart = (product, qty = 1) => {
    setCart(c => {
      const existing = c.find(i => i.id === product.id);
      if (existing) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...c, { ...product, qty }];
    });
  };

  return (
    <AuthProvider>
      <style>{css}</style>
      <Navbar page={page} setPage={setPage} cart={cart} />
      {page === "home" && <HomePage setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />}
      {page === "auth" && <AuthPage setPage={setPage} />}
      {page === "shop" && <ShopPage setPage={setPage} setSelectedProduct={setSelectedProduct} />}
      {page === "product" && selectedProduct && <ProductPage product={selectedProduct} setPage={setPage} addToCart={addToCart} />}
      {page === "cart" && <CartPage cart={cart} setCart={setCart} setPage={setPage} setOrderItems={setOrderItems} />}
      {page === "order-confirm" && <OrderConfirmPage items={orderItems} setPage={setPage} />}
      {page === "projects" && <ProjectsPage setPage={setPage} setSelectedProject={setSelectedProject} />}
      {page === "project-detail" && selectedProject && <ProjectDetailPage project={selectedProject} setPage={setPage} />}
      {page === "messages" && <MessagesPage setPage={setPage} />}
      {page === "contact" && <ContactPage />}
      {page === "profile" && <ProfilePage setPage={setPage} />}
      {page === "admin" && <AdminPanel setPage={setPage} />}
      <footer style={{ background: "var(--dark)", color: "rgba(255,255,255,.6)", textAlign: "center", padding: "32px", fontSize: "0.88rem", marginTop: 60 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", color: "var(--coral)", fontSize: "1.1rem", marginBottom: 8 }}>METAL-GUMA: PoolPro</div>
        <div>© 2024 Metal-Guma d.o.o. · Banja Luka · All rights reserved</div>
      </footer>
    </AuthProvider>
  );
}