import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function ChangePasswordPage({ setPage }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    setMessage("");

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setMessage("Please fill all fields.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage("The new passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(
        "/auth/change-password",
        {
          method: "POST",
          body: JSON.stringify({ oldPassword: form.oldPassword, newPassword: form.newPassword }),
        },
        user?.token
      );

      setMessage(typeof res === "string" ? res : "Password changed successfully.");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setMessage(e.message || "Failed to change password.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page" style={{ paddingTop: 40, minHeight: "calc(100vh - 140px)" }}>
      <div className="auth-form-side" style={{ width: 520, margin: "0 auto" }}>
        <div className="auth-form-box" style={{ padding: 32 }}>
          <h2 style={{ marginBottom: 24 }}>Change Password</h2>
          {message && (
            <div className={`alert ${message.toLowerCase().includes("success") ? "alert-success" : "alert-error"}`}>
              {message}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              className="form-input"
              type="password"
              value={form.oldPassword}
              onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              className="form-input"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button className="btn-secondary" onClick={() => setPage("profile")} disabled={loading}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleChange} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
