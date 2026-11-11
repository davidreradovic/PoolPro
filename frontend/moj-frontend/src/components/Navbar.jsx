import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

const NAV_ICONS = {
  home: "⌂",
  projects: "▣",
  shop: "◫",
  "order-history": "≡",
  messages: "✉",
  cart: "◒",
  admin: "⚙",
  "employee-tasks": "✓",
  profile: "◎",
  notifications: "!",
  auth: "↗",
};

export function Navbar({ page, setPage, cart, onOpenAdminSection }) {
  const { user, actualRole, previewRole, setPreviewRole } = useAuth();
  const [notifications, setNotifications] = useState({ lowStockItems: [], orderComplaints: [] });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const role = user?.role;
  const notificationCount = notifications.lowStockItems.length + notifications.orderComplaints.length;
  const userId = user?.id || user?.idUser;

  useEffect(() => {
    if (actualRole !== "SUPERVISOR" || !user?.token) {
      const timer = setTimeout(() => {
        setNotifications({ lowStockItems: [], orderComplaints: [] });
      }, 0);
      return () => clearTimeout(timer);
    }

    let ignore = false;
    const loadNotifications = async () => {
      try {
        const res = await apiFetch("/notifications/supervisor", {}, user.token);
        if (!ignore && res && typeof res === "object") {
          setNotifications({
            lowStockItems: Array.isArray(res.lowStockItems) ? res.lowStockItems : [],
            orderComplaints: Array.isArray(res.orderComplaints) ? res.orderComplaints : [],
          });
        }
      } catch (e) {
        console.error("Failed to load supervisor notifications", e);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [actualRole, user]);

  useEffect(() => {
    if (!user?.token || !userId) {
      const timer = setTimeout(() => setUnreadMessageCount(0), 0);
      return () => clearTimeout(timer);
    }

    let ignore = false;
    const loadUnreadMessages = async () => {
      try {
        const res = await apiFetch(`/messages/unread/${userId}`, {}, user.token);
        if (!ignore) {
          setUnreadMessageCount(Array.isArray(res) ? res.length : 0);
        }
      } catch (e) {
        console.error("Failed to load unread messages", e);
      }
    };

    loadUnreadMessages();
    const interval = setInterval(loadUnreadMessages, 15000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [page, user, userId]);

  const linksByRole = {
    CLIENT: [
      { id: "home", label: "Home" },
      { id: "projects", label: "My Projects" },
      { id: "shop", label: "Shop" },
      { id: "order-history", label: "Orders" },
      { id: "messages", label: "Messages" },
    ],
    EMPLOYEE: [
      { id: "employee-tasks", label: "My Tasks" },
      { id: "messages", label: "Messages" },
    ],
    SUPERVISOR: [
      { id: "home", label: "Home" },
      { id: "admin", label: "Admin Panel" },
      { id: "projects", label: "Projects" },
      { id: "order-history", label: "Orders" },
      { id: "messages", label: "Messages" },
    ],
  };

  const guestLinks = [
    { id: "home", label: "Home" },
    { id: "projects", label: "Projects" },
    { id: "shop", label: "Shop" },
  ];

  const navLinks = user ? linksByRole[role] || [] : guestLinks;
  const navContent = (id, label) => (
    <>
      <span className="nav-icon" aria-hidden="true">{NAV_ICONS[id] || "•"}</span>
      <span className="nav-label">{label}</span>
    </>
  );

  return (
    <nav className="nav">
      <span className="nav-logo" onClick={() => setPage(user ? navLinks[0]?.id || "home" : "home")}>
        METAL-GUMA: <span>PoolPro</span>
      </span>
      <div className="nav-links">
        {navLinks.map((link) => (
          <button
            key={link.id}
            className={`nav-link nav-link-${link.id} ${link.id === "messages" ? "cart-badge" : ""} ${page === link.id ? "active" : ""}`}
            onClick={() => setPage(link.id)}
            title={link.label}
            aria-label={link.label}
          >
            {navContent(link.id, link.label)}
            {link.id === "messages" && unreadMessageCount > 0 && (
              <span className="badge">{unreadMessageCount}</span>
            )}
          </button>
        ))}
        {user && (
          <>
            {role === "CLIENT" && (
              <button className="nav-link cart-badge" onClick={() => setPage("cart")} title="Cart" aria-label="Cart">
                {navContent("cart", "Cart")} {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </button>
            )}
            {actualRole === "SUPERVISOR" && (
              <>
                <div className="nav-notifications">
                  <button
                    className="nav-link cart-badge nav-link-notifications"
                    onClick={() => setNotificationsOpen((open) => !open)}
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    {navContent("notifications", "Notifications")} {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
                  </button>
                  {notificationsOpen && (
                    <div className="notifications-menu">
                      {notificationCount === 0 ? (
                        <div className="notification-empty">No notifications</div>
                      ) : (
                        <>
                          {notifications.lowStockItems.map((item) => (
                            <button
                              key={`item-${item.idItem}`}
                              className="notification-item"
                              onClick={() => {
                                setNotificationsOpen(false);
                                onOpenAdminSection?.("items");
                              }}
                            >
                              <strong>{item.title}</strong>
                              <span>Quantity in stock is 0</span>
                            </button>
                          ))}
                          {notifications.orderComplaints.map((complaint) => (
                            <button
                              key={`complaint-${complaint.idOrderComplaint}`}
                              className="notification-item"
                              onClick={() => {
                                setNotificationsOpen(false);
                                onOpenAdminSection?.("orders", complaint.orderId);
                              }}
                            >
                              <strong>Order #{complaint.orderId}</strong>
                              <span>{complaint.clientName || "Client"} submitted a complaint</span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <label className="role-preview">
                  <span>Preview</span>
                  <select
                    value={previewRole || "SUPERVISOR"}
                    onChange={(e) => {
                      setPreviewRole(e.target.value);
                      const nextRole = e.target.value;
                      const firstPage = linksByRole[nextRole]?.[0]?.id || "admin";
                      setPage(firstPage);
                    }}
                  >
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="CLIENT">Client</option>
                    <option value="EMPLOYEE">Employee</option>
                  </select>
                </label>
              </>
            )}
            <button className="nav-link btn" onClick={() => setPage("profile")} title="My Profile" aria-label="My Profile">
              {navContent("profile", "My Profile")}
            </button>
          </>
        )}
        {!user && (
          <button className="nav-link" onClick={() => setPage("auth")} title="Sign in/Sign up" aria-label="Sign in/Sign up">
            {navContent("auth", "Sign in/Sign up")}
          </button>
        )}
      </div>
    </nav>
  );
}
