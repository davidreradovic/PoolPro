import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
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
import { ContactPage } from "./components/ContactPage";
import { ProfilePage } from "./components/ProfilePage";
import { AdminPanel } from "./components/AdminPanel";
import { EmployeeTasksPage } from "./components/EmployeeTasksPage";
import { OrderHistoryPage } from "./components/OrderHistoryPage";
import { EmployeeProfilePage } from "./components/EmployeeProfilePage";
import "./styles/globals.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  const addToCart = (product, qty = 1) => {
    setCart((currentCart) => {
      // Handle both old format (id) and new format (idItem)
      const itemId = product.idItem || product.id;
      const existing = currentCart.find((item) => (item.idItem || item.id) === itemId);
      if (existing) {
        return currentCart.map((item) =>
          (item.idItem || item.id) === itemId ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...currentCart, { ...product, qty }];
    });
  };

  return (
    <AuthProvider>
      <Navbar page={page} setPage={setPage} cart={cart} />
      {page === "home" && (
        <HomePage
          setPage={setPage}
          setSelectedProduct={setSelectedProduct}
          addToCart={addToCart}
        />
      )}
      {page === "auth" && <AuthPage setPage={setPage} />}
      {page === "shop" && (
        <ShopPage setPage={setPage} setSelectedProduct={setSelectedProduct} />
      )}
      {page === "product" && selectedProduct && (
        <ProductPage
          product={selectedProduct}
          setPage={setPage}
          addToCart={addToCart}
        />
      )}
      {page === "cart" && (
        <CartPage
          cart={cart}
          setCart={setCart}
          setPage={setPage}
          setOrderItems={setOrderItems}
        />
      )}
      {page === "order-confirm" && (
        <OrderConfirmPage items={orderItems} setPage={setPage} />
      )}
      {page === "projects" && (
        <ProjectsPage setPage={setPage} setSelectedProject={setSelectedProject} />
      )}
      {page === "project-detail" && selectedProject && (
        <ProjectDetailPage project={selectedProject} setPage={setPage} />
      )}
      {page === "messages" && <MessagesPage setPage={setPage} />}
      {page === "contact" && <ContactPage />}
      {page === "profile" && <ProfilePage setPage={setPage} />}
      {page === "admin" && <AdminPanel setPage={setPage} />}
      {page === "employee-tasks" && <EmployeeTasksPage setPage={setPage} />}
      {page === "order-history" && <OrderHistoryPage setPage={setPage} />}
      {page === "employee-profile" && <EmployeeProfilePage setPage={setPage} />}
      <footer className="footer">
        <div className="footer-brand">METAL-GUMA: PoolPro</div>
        <div>© 2024 Metal-Guma d.o.o. · Banja Luka · All rights reserved</div>
      </footer>
    </AuthProvider>
  );
}
