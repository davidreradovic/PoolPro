import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function AdminPanel({ setPage }) {
  const { user } = useAuth();
  const [section, setSection] = useState("users");
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [items, setItems] = useState([]);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [regForm, setRegForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "EMPLOYEE",
    description: "",
  });
  const [regMsg, setRegMsg] = useState("");
  const [itemForm, setItemForm] = useState({
    title: "",
    quantity: "",
    unitPrice: "",
    category: "",
  });
  const [itemMsg, setItemMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    apiFetch("/users", {}, user.token).then((r) => Array.isArray(r) && setUsers(r));
    apiFetch("/employees", {}, user.token).then((r) => Array.isArray(r) && setEmployees(r));
    apiFetch("/projects", {}, user.token).then((r) => Array.isArray(r) && setProjects(r));
    apiFetch("/items", {}, user.token).then((r) => Array.isArray(r) && setItems(r));
  }, [user]);

  const registerEmployee = async () => {
    const res = await apiFetch(
      "/auth/register",
      { method: "POST", body: JSON.stringify(regForm) },
      user.token
    );
    setRegMsg(typeof res === "string" ? res : "Done");
    if (typeof res === "string" && res.toLowerCase().includes("success")) {
      setShowRegModal(false);
      apiFetch("/employees", {}, user.token).then((r) => Array.isArray(r) && setEmployees(r));
    }
  };

  const updateEmpStatus = async (id, status) => {
    await apiFetch(`/employees/${id}/status?status=${status}`, { method: "PUT" }, user.token);
    apiFetch("/employees", {}, user.token).then((r) => Array.isArray(r) && setEmployees(r));
  };

  const createItem = async () => {
    const res = await apiFetch(
      "/items",
      {
        method: "POST",
        body: JSON.stringify({
          title: itemForm.title,
          quantity: parseInt(itemForm.quantity),
          unitPrice: parseFloat(itemForm.unitPrice),
          category: itemForm.category,
        }),
      },
      user.token
    );
    setItemMsg(typeof res === "string" ? res : "Item created successfully");
    if (res.idItem) {
      setShowItemModal(false);
      apiFetch("/items", {}, user.token).then((r) => Array.isArray(r) && setItems(r));
      setItemForm({ title: "", quantity: "", unitPrice: "", category: "" });
    }
  };

  if (!user || user.role !== "SUPERVISOR") {
    return (
      <div className="empty" style={{ marginTop: 60 }}>
        <div className="empty-icon">🔒</div>
        <p>Supervisor access required</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div style={{ padding: "0 28px 24px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "1.1rem" }}>
            PoolPro
          </div>
          <div style={{ color: "rgba(255,255,255,.5)", fontSize: "0.8rem" }}>Admin Panel</div>
        </div>
        {[
          { id: "users", label: "👥 Users" },
          { id: "employees", label: "🔧 Employees" },
          { id: "projects", label: "📋 Projects" },
          { id: "items", label: "📦 Items" },
        ].map((s) => (
          <button
            key={s.id}
            className={`admin-sidebar-item ${section === s.id ? "active" : ""}`}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
        <button className="admin-sidebar-item" onClick={() => setPage("profile")}>
          ← Back to Profile
        </button>
      </div>
      <div className="admin-content">
        {section === "users" && (
          <>
            <h1>Users</h1>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.idUser}>
                      <td>{u.idUser}</td>
                      <td>{u.username}</td>
                      <td>
                        {u.firstName} {u.lastName}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            u.status === "active" ? "status-done" : "status-cancelled"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {section === "employees" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h1>Employees</h1>
              <button
                className="btn-primary"
                onClick={() => {
                  setRegMsg("");
                  setShowRegModal(true);
                }}
              >
                + Register Employee
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr key={e.idEmployee}>
                      <td>{e.idEmployee}</td>
                      <td>
                        {e.user?.firstName} {e.user?.lastName}
                      </td>
                      <td>{e.user?.email}</td>
                      <td>{e.description}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            e.user?.status === "active" ? "status-done" : "status-cancelled"
                          }`}
                        >
                          {e.user?.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ width: "auto", fontSize: "0.82rem" }}
                          value={e.user?.status || "active"}
                          onChange={(ev) => updateEmpStatus(e.idEmployee, ev.target.value)}
                        >
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {section === "projects" && (
          <>
            <h1>All Projects</h1>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Public</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.idProject}>
                      <td>{p.idProject}</td>
                      <td>{p.title}</td>
                      <td>
                        <span className={`status-badge status-${p.status}`}>{p.status}</span>
                      </td>
                      <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                      <td>{p.publicProject ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {section === "items" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h1>Inventory Items</h1>
              <button
                className="btn-primary"
                onClick={() => {
                  setItemMsg("");
                  setItemForm({ title: "", quantity: "", unitPrice: "", category: "" });
                  setShowItemModal(true);
                }}
              >
                + Add Item
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Unit Price (KM)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.idItem}>
                      <td>{item.idItem}</td>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showRegModal && (
        <div className="modal-overlay" onClick={() => setShowRegModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Register Employee / Supervisor</h2>
            {regMsg && (
              <div className={`alert ${regMsg.toLowerCase().includes("success") ? "alert-success" : "alert-error"}`}>
                {regMsg}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  className="form-input"
                  value={regForm.firstName}
                  onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  className="form-input"
                  value={regForm.lastName}
                  onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                value={regForm.username}
                onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={regForm.role}
                onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                className="form-input"
                value={regForm.description}
                onChange={(e) => setRegForm({ ...regForm, description: e.target.value })}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRegModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={registerEmployee}>
                Register
              </button>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Item</h2>
            {itemMsg && (
              <div className={`alert ${itemMsg.toLowerCase().includes("success") || itemMsg.toLowerCase().includes("created") ? "alert-success" : "alert-error"}`}>
                {itemMsg}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                placeholder="e.g., Pool Filter Pump"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                className="form-input"
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                placeholder="e.g., Pumps"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  className="form-input"
                  type="number"
                  value={itemForm.quantity}
                  onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price (KM)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  value={itemForm.unitPrice}
                  onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowItemModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={createItem}>
                Create Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
