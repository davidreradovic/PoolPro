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
      <div className="profile-hero">
        <img
          className="profile-hero-img"
          src="https://images.unsplash.com/photo-1572331165267-854da2b10ccc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Profile background"
        />
      </div>
      <div className="profile-page-bg">
        <div className="profile-page-inner">
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
              <button className="profile-link" onClick={() => setPage("change-password")} style={{ color: "var(--mid)" }}>
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
    </div>
  );
}
