import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function EmployeeProfilePage({ setPage }) {
  const { user, logout } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const userId = user.id || user.idUser;
    if (!userId) return;
    const res = await apiFetch(
          `/employees/user/${userId}`,
          {},
          user.token
        );
        if (res && res.idEmployee) {
          setEmployee(res);
          setDescription(res.description || "");
        }
      } catch (e) {
        console.error("Failed to fetch employee", e);
      }
      setLoading(false);
    };

    fetchEmployee();
  }, [user]);

  const handleUpdateDescription = async () => {
    if (!employee) return;
    try {
      const res = await apiFetch(
        `/employees/${employee.idEmployee}/description?description=${encodeURIComponent(description)}`,
        { method: "PUT" },
        user.token
      );
      if (res.idEmployee) {
        setEmployee(res);
        setMessage("Description updated successfully");
        setEditing(false);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Failed to update description");
    }
  };

  if (!user || user.role !== "EMPLOYEE") {
    return (
      <div className="empty" style={{ marginTop: 60 }}>
        <div className="empty-icon">🔒</div>
        <p>Employee access required</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty" style={{ marginTop: 60 }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="profile-hero" />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 40px" }}>
        <div className="profile-card">
          <div className="profile-avatar">👷</div>
          <div className="profile-name">
            {user.firstName} {user.lastName}
          </div>
          <div className="profile-role">EMPLOYEE</div>
          <div style={{ fontSize: "0.9rem", color: "var(--mid)" }}>
            @{user.username} · {user.email}
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--mid)", marginTop: 8 }}>
            📱 {user.phone}
          </div>

          {employee && (
            <div style={{ marginTop: 20, padding: 16, background: "var(--light)", borderRadius: 8 }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Professional Summary</div>
              {!editing ? (
                <>
                  <p style={{ margin: 0, color: "var(--mid)", lineHeight: 1.6 }}>
                    {employee.description || "No description yet. Click below to add one."}
                  </p>
                  <button
                    className="btn-secondary"
                    style={{ marginTop: 12 }}
                    onClick={() => setEditing(true)}
                  >
                    Edit Description
                  </button>
                </>
              ) : (
                <>
                  <textarea
                    className="form-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write your professional summary..."
                    style={{ minHeight: 100, marginBottom: 12 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-primary"
                      onClick={handleUpdateDescription}
                      style={{ flex: 1 }}
                    >
                      Save
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => {
                        setEditing(false);
                        setDescription(employee.description || "");
                      }}
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
              {message && (
                <div style={{ marginTop: 12, fontSize: "0.9rem", color: message.includes("success") ? "#27ae60" : "var(--coral)" }}>
                  {message}
                </div>
              )}
            </div>
          )}

          <div className="profile-links">
            <button
              className="profile-link"
              onClick={() => setPage("employee-tasks")}
            >
              My Tasks
            </button>
            <button
              className="profile-link"
              onClick={() => {
                logout();
                setPage("home");
              }}
              style={{ color: "var(--mid)" }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
