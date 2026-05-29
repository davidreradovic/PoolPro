import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function AuthPage({ setPage, getHomeForUser }) {
  const { login } = useAuth();
  const [tab, setTab] = useState("signin");
  const [form, setForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ username: form.username, password: form.password }) }
      );
      if (res && res.message === "Login successful") {
        login(res);
        setPage(getHomeForUser ? getHomeForUser(res) : "home");
      } else {
        setErr(typeof res === "string" ? res : "Login failed");
      }
    } catch (e) {
      setErr(e.message || "Server unavailable. Please try again later.");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(
        "/auth/register",
        { method: "POST", body: JSON.stringify({ ...form, role: "CLIENT" }) }
      );
      if (typeof res === "string" && res.toLowerCase().includes("success")) {
        setOk("Registration successful! Please sign in.");
        setTab("signin");
      } else {
        setErr(typeof res === "string" ? res : "Registration failed");
      }
    } catch {
      setErr("Server unavailable.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === "signin" ? "active" : ""}`}
              onClick={() => setTab("signin")}
            >
              Sign in
            </button>
            <button
              className={`auth-tab ${tab === "signup" ? "active" : ""}`}
              onClick={() => setTab("signup")}
            >
              Sign up
            </button>
          </div>
          {err && <div className="alert alert-error">{err}</div>}
          {ok && <div className="alert alert-success">{ok}</div>}
          {tab === "signin" ? (
            <>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <button
                className="btn-primary"
                style={{ width: "100%" }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    className="form-input"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    className="form-input"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <button
                className="btn-primary"
                style={{ width: "100%" }}
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="auth-img-side" />
    </div>
  );
}
