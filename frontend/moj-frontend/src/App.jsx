import { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { apiFetch } from "./utils/api";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { AuthPage } from "./components/AuthPage";
import { ShopPage } from "./components/ShopPage";
import { ProductPage } from "./components/ProductPage";
import { CartPage } from "./components/CartPage";
import { OrderConfirmPage } from "./components/OrderConfirmPage";
import { ProjectsPage } from "./components/ProjectsPage";
import { ProjectDetailPage } from "./components/ProjectDetailPage";
import { MessagesPage } from "./components/MessagesPage";
import { ProfilePage } from "./components/ProfilePage";
import { AdminPanel } from "./components/AdminPanel";
import { LearnMorePage } from "./components/LearnMorePage";
import { EmployeeTasksPage } from "./components/EmployeeTasksPage";
import { OrderHistoryPage } from "./components/OrderHistoryPage";
import { EmployeeProfilePage } from "./components/EmployeeProfilePage";
import { ChangePasswordPage } from "./components/ChangePasswordPage";
import "./styles/globals.css";

const ROLE_HOME = {
  CLIENT: "projects",
  EMPLOYEE: "employee-tasks",
  SUPERVISOR: "admin",
};

const PUBLIC_PAGES = new Set(["home", "auth", "shop", "product", "learn-more"]);
const ROLE_PAGES = {
  CLIENT: new Set([
    "home",
    "shop",
    "product",
    "cart",
    "order-confirm",
    "projects",
    "project-detail",
    "messages",
    "learn-more",
    "profile",
    "change-password",
    "order-history",
  ]),
  EMPLOYEE: new Set([
    "employee-tasks",
    "employee-profile",
    "messages",
    "profile",
    "change-password",
  ]),
  SUPERVISOR: new Set([
    "home",
    "admin",
    "projects",
    "project-detail",
    "messages",
    "profile",
    "change-password",
    "order-history",
  ]),
};

const getHomeForUser = (user) => (user ? ROLE_HOME[user.role] || "home" : "home");

const getAllowedPage = (page, user) => {
  if (!user) return PUBLIC_PAGES.has(page) ? page : "home";

  const allowedPages = ROLE_PAGES[user.role] || ROLE_PAGES.CLIENT;
  return allowedPages.has(page) ? page : getHomeForUser(user);
};

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState("home");
  const currentPage = getAllowedPage(page, user);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [messageDraft, setMessageDraft] = useState(null);
  const [adminTarget, setAdminTarget] = useState({ section: "users", focusOrderId: null, nonce: 0 });
  const messageDraftCounterRef = useRef(0);

  const loadCart = async (currentUser = user) => {
    if (!currentUser || currentUser.role !== "CLIENT") {
      setCart([]);
      return;
    }

    const userId = currentUser.id || currentUser.idUser;
    if (!userId) return;

    try {
      const res = await apiFetch(`/cart/${userId}`, {}, currentUser.token);
      if (res?.items) {
        setCart(res.items.map((item) => ({ ...item, qty: item.quantity })));
      } else {
        setCart([]);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  };

  useEffect(() => {
    let ignore = false;

    const syncCart = async () => {
      if (!user || user.role !== "CLIENT") {
        if (!ignore) setCart([]);
        return;
      }

      const userId = user.id || user.idUser;
      if (!userId) return;

      try {
        const res = await apiFetch(`/cart/${userId}`, {}, user.token);
        if (ignore) return;
        if (res?.items) {
          setCart(res.items.map((item) => ({ ...item, qty: item.quantity })));
        } else {
          setCart([]);
        }
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    };

    syncCart();

    return () => {
      ignore = true;
    };
  }, [user]);

  const addToCart = async (product, qty = 1) => {
    const itemId = product.idItem || product.id;

    if (user?.token && user.role === "CLIENT") {
      try {
        const userId = user.id || user.idUser;
        await apiFetch(
          `/cart/${userId}/add`,
          { method: "POST", body: JSON.stringify({ itemId, quantity: qty }) },
          user.token
        );
        await loadCart();
        return;
      } catch (e) {
        console.error("Failed to add item to backend cart", e);
      }
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => (item.idItem || item.id) === itemId);
      if (existing) {
        return currentCart.map((item) =>
          (item.idItem || item.id) === itemId ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...currentCart, { ...product, qty }];
    });
  };

  const openAdminSection = (section, focusOrderId = null) => {
    setAdminTarget((current) => ({
      section,
      focusOrderId,
      nonce: current.nonce + 1,
    }));
    setPage("admin");
  };

  const openComplaintReply = (complaint) => {
    messageDraftCounterRef.current += 1;
    setMessageDraft({
      id: `complaint-${complaint.idOrderComplaint}-${messageDraftCounterRef.current}`,
      text: "Odgovor na zalbu:",
      receiver: {
        idUser: complaint.clientUserId,
        username: complaint.clientUsername,
        firstName: complaint.clientName || "Client",
        lastName: "",
        role: "CLIENT",
      },
    });
    setPage("messages");
  };

  return (
    <>
      <Navbar
        page={currentPage}
        setPage={setPage}
        cart={cart}
        onOpenAdminSection={openAdminSection}
      />
      {currentPage === "home" && (
        <HomePage
          setPage={setPage}
          setSelectedProduct={setSelectedProduct}
          setMessageDraft={setMessageDraft}
        />
      )}
      {currentPage === "auth" && <AuthPage setPage={setPage} getHomeForUser={getHomeForUser} />}
      {currentPage === "shop" && (
        <ShopPage setPage={setPage} setSelectedProduct={setSelectedProduct} />
      )}
      {currentPage === "product" && selectedProduct && (
        <ProductPage
          product={selectedProduct}
          setPage={setPage}
          addToCart={addToCart}
        />
      )}
      {currentPage === "cart" && (
        <CartPage
          cart={cart}
          setCart={setCart}
          setPage={setPage}
          setOrderItems={setOrderItems}
          setCreatedOrder={setCreatedOrder}
        />
      )}
      {currentPage === "order-confirm" && (
        <OrderConfirmPage items={orderItems} order={createdOrder} setPage={setPage} />
      )}
      {currentPage === "projects" && (
        <ProjectsPage setPage={setPage} setSelectedProject={setSelectedProject} />
      )}
      {currentPage === "project-detail" && selectedProject && (
        <ProjectDetailPage project={selectedProject} setPage={setPage} />
      )}
      {currentPage === "messages" && <MessagesPage initialDraft={messageDraft} />}
      {currentPage === "learn-more" && <LearnMorePage setPage={setPage} />}
      {currentPage === "profile" && <ProfilePage setPage={setPage} />}
      {currentPage === "change-password" && <ChangePasswordPage setPage={setPage} />}
      {currentPage === "admin" && (
        <AdminPanel
          setPage={setPage}
          initialSection={adminTarget.section}
          focusOrderId={adminTarget.focusOrderId}
          focusNonce={adminTarget.nonce}
          onComplaintReply={openComplaintReply}
        />
      )}
      {currentPage === "employee-tasks" && <EmployeeTasksPage setPage={setPage} />}
      {currentPage === "order-history" && <OrderHistoryPage setPage={setPage} />}
      {currentPage === "employee-profile" && <EmployeeProfilePage setPage={setPage} />}
      <footer className="footer">
        <div className="footer-brand">METAL-GUMA: PoolPro</div>
        <div>© 2024 Metal-Guma d.o.o. · Banja Luka · All rights reserved</div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
