import { useAuth } from "../context/AuthContext";

export function ProfilePage({ setPage }) {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="empty" style={{ marginTop: 60 }}>
        <div className="empty-icon">🔒</div>
        <p>Please sign in</p>
      </div>
    );
  }

  return (
    <div>
      <div className="profile-hero" />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 40px" }}>
        <div className="profile-card">
          <div className="profile-avatar">👤</div>
          <div className="profile-name">
            {user.firstName} {user.lastName}
          </div>
          <div className="profile-role">{user.role}</div>
          <div style={{ fontSize: "0.9rem", color: "var(--mid)" }}>
            @{user.username} · {user.email}
          </div>
          <div className="profile-links">
            {user.role === "CLIENT" && (
              <>
                <button className="profile-link" onClick={() => setPage("projects")}>
                  My Projects
                </button>
                <button className="profile-link" onClick={() => setPage("order-history")}>
                  Order History
                </button>
              </>
            )}
            {user.role === "SUPERVISOR" && (
              <>
                <button className="profile-link" onClick={() => setPage("projects")}>
                  Manage Projects
                </button>
                <button className="profile-link" onClick={() => setPage("admin")}>
                  Admin Panel
                </button>
              </>
            )}
            {user.role === "EMPLOYEE" && (
              <>
                <button className="profile-link" onClick={() => setPage("employee-tasks")}>
                  My Tasks
                </button>
                <button className="profile-link" onClick={() => setPage("employee-profile")}>
                  My Profile
                </button>
              </>
            )}
            {(user.role === "CLIENT" || user.role === "SUPERVISOR") && (
              <button className="profile-link" onClick={() => setPage("messages")}>
                Messages
              </button>
            )}
            <button className="profile-link" style={{ color: "var(--mid)" }}>
              Change Password
            </button>
            <button
              className="profile-link danger"
              onClick={() => {
                logout();
                setPage("home");
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
