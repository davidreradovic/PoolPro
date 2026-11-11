import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function AdminPanel({ setPage, initialSection, focusOrderId, focusNonce, onComplaintReply }) {
  const { user } = useAuth();
  const [section, setSection] = useState("users");
  const [userTab, setUserTab] = useState("clients");
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
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
    photoTitle: "",
    photoFile: null,
  });
  const [itemMsg, setItemMsg] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderComplaints, setOrderComplaints] = useState({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [employeeTasksLoading, setEmployeeTasksLoading] = useState(false);
  const [employeeTasksFilter, setEmployeeTasksFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    apiFetch("/users", {}, user.token).then((r) => Array.isArray(r) && setUsers(r));
    apiFetch("/employees", {}, user.token).then((r) => Array.isArray(r) && setEmployees(r));
    apiFetch("/supervisors", {}, user.token).then((r) => Array.isArray(r) && setSupervisors(r));
    apiFetch("/projects", {}, user.token).then((r) => Array.isArray(r) && setProjects(r));
    apiFetch("/items", {}, user.token).then((r) => Array.isArray(r) && setItems(r));
    apiFetch("/orders", {}, user.token).then((r) => Array.isArray(r) && setOrders(r));
  }, [user]);

  const loadEmployeeTasks = async (employeeId) => {
    if (!employeeId) return;
    setEmployeeTasksLoading(true);
    try {
      const res = await apiFetch(`/tasks/employee/${employeeId}`, {}, user.token);
      if (Array.isArray(res)) setEmployeeTasks(res);
    } catch (e) {
      console.error("Failed to load employee tasks", e);
    }
    setEmployeeTasksLoading(false);
  };

  const registerEmployee = async () => {
    const endpoint = regForm.role === "SUPERVISOR" ? "/auth/register-supervisor" : "/auth/register-employee";
    const body = {
      username: regForm.username,
      firstName: regForm.firstName,
      lastName: regForm.lastName,
      email: regForm.email,
      phone: regForm.phone,
      password: regForm.password,
      role: regForm.role,
      description: regForm.description,
    };
    const res = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }, user.token);
    setRegMsg(typeof res === "string" ? res : "Done");
    if (typeof res === "string" && res.toLowerCase().includes("success")) {
      setShowRegModal(false);
      apiFetch("/employees", {}, user.token).then((r) => Array.isArray(r) && setEmployees(r));
      apiFetch("/supervisors", {}, user.token).then((r) => Array.isArray(r) && setSupervisors(r));
      apiFetch("/users", {}, user.token).then((r) => Array.isArray(r) && setUsers(r));
    }
  };

  const updateEmpStatus = async (id, status) => {
  await apiFetch(
    `/employees/${id}/status?status=${status}`,
    { method: "PUT" },
    user.token
  );

  apiFetch("/employees", {}, user.token)
    .then((r) => Array.isArray(r) && setEmployees(r));

  apiFetch("/users", {}, user.token)
    .then((r) => Array.isArray(r) && setUsers(r));
};

  const emptyItemForm = {
    title: "",
    quantity: "",
    unitPrice: "",
    category: "",
    photoTitle: "",
    photoFile: null,
  };

  const uploadItemPhoto = async (itemId, replaceExisting = false) => {
  if (!itemForm.photoFile) return;

  const formData = new FormData();
  // Veoma važno: Spring Boot očekuje Integer, prosledi ga kao string/broj unutar FormData
  formData.append("itemId", String(itemId)); 
  formData.append("file", itemForm.photoFile);
  formData.append("title", itemForm.photoTitle || itemForm.title || "Item photo");
  formData.append("replaceExisting", String(replaceExisting));

  // Umjesto apiFetch, koristimo direktan fetch da nam 'Content-Type' ostane čist
  const response = await fetch("http://localhost:8080/api/item-photos/upload", {
    method: "POST",
    headers: {
      // PROVJERI: Ako tvoj backend koristi Bearer token, prosledi ga ovako
      "Authorization": `Bearer ${user.token}`
      // NAPOMENA: Ovdje NIKAKO ne piši 'Content-Type': 'multipart/form-data'. 
      // Pusti brauzer da to sam odradi jer on mora da generiše unikatni "boundary" string!
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const parsed = errorText ? JSON.parse(errorText) : null;
      errorMessage = parsed?.message || parsed?.error || "";
    } catch {
      // Server returned plain text.
    }
    throw new Error(
      errorMessage
        ? `Slanje slike nije uspilo na serveru. HTTP ${response.status}: ${errorMessage}`
        : `Slanje slike nije uspilo na serveru. HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result;
};

  const createItem = async () => {
    try {
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
      if (res?.idItem) {
        try {
          await uploadItemPhoto(res.idItem);
        } catch (uploadError) {
          console.error("Failed to upload item image", uploadError);
          setItemMsg(`Item created, but image upload failed: ${uploadError.message}`);
          return;
        }
        setItemMsg("Item created successfully");
        setShowItemModal(false);
        apiFetch("/items", {}, user.token).then((r) => Array.isArray(r) && setItems(r));
        setItemForm(emptyItemForm);
        setSelectedItem(null);
      } else {
        setItemMsg(typeof res === "string" ? res : "Item created successfully");
      }
    } catch (e) {
      console.error("Failed to create item", e);
      setItemMsg(e.message || "Failed to create item.");
    }
  };

  const activateUser = async (id) => {
    await apiFetch(`/users/${id}/activate`, { method: "PUT" }, user.token);
    apiFetch("/users", {}, user.token).then((r) => Array.isArray(r) && setUsers(r));
  };

  const deactivateUser = async (id) => {
    await apiFetch(`/users/${id}/deactivate`, { method: "PUT" }, user.token);
    apiFetch("/users", {}, user.token).then((r) => Array.isArray(r) && setUsers(r));
  };

  const openEditItem = (item) => {
    setSelectedItem(item);
    setItemForm({
      title: item.title || "",
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      category: item.category || "",
      photoTitle: "",
      photoFile: null,
    });
    setItemMsg("");
    setShowItemModal(true);
  };

  const saveItem = async () => {
    if (!selectedItem) return;
    const res = await apiFetch(
      `/items/${selectedItem.idItem}`,
      {
        method: "PUT",
        body: JSON.stringify({
          title: itemForm.title,
          quantity: parseInt(itemForm.quantity),
          unitPrice: parseFloat(itemForm.unitPrice),
          category: itemForm.category,
        }),
      },
      user.token
    );
    setItemMsg(typeof res === "string" ? res : "Item updated successfully");
    if (res.idItem) {
      try {
        await uploadItemPhoto(res.idItem, true);
      } catch (uploadError) {
        console.error("Failed to upload item image", uploadError);
        setItemMsg(`Item updated, but image upload failed: ${uploadError.message}`);
        return;
      }
      setShowItemModal(false);
      apiFetch("/items", {}, user.token).then((r) => Array.isArray(r) && setItems(r));
      setSelectedItem(null);
      setItemForm(emptyItemForm);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;
    await apiFetch(`/items/${id}`, { method: "DELETE" }, user.token);
    apiFetch("/items", {}, user.token).then((r) => Array.isArray(r) && setItems(r));
  };

  const updateOrderStatus = async (orderId, status) => {
    await apiFetch(`/orders/${orderId}/status?status=${status}`, { method: "PUT" }, user.token);
    apiFetch("/orders", {}, user.token).then((r) => Array.isArray(r) && setOrders(r));
    apiFetch("/items", {}, user.token).then((r) => Array.isArray(r) && setItems(r));
  };

  const openOrderDetails = async (orderId) => {
    const res = await apiFetch(`/orders/${orderId}`, {}, user.token);
    if (res && typeof res === "object") {
      setSelectedOrderDetails(res);
    }
  };

  const updateProjectVisibility = async (projectId, publicProject) => {
    await apiFetch(
      `/projects/${projectId}/public?publicProject=${publicProject}`,
      { method: "PUT" },
      user.token
    );
    apiFetch("/projects", {}, user.token).then((r) => Array.isArray(r) && setProjects(r));
  };

  const loadOrderComplaints = useCallback(async (orderId) => {
    const res = await apiFetch(`/orders/${orderId}/complaints`, {}, user.token);
    if (Array.isArray(res)) {
      setOrderComplaints((prev) => ({ ...prev, [orderId]: res }));
    }
  }, [user]);

  useEffect(() => {
    if (!initialSection) return;
    const timer = setTimeout(() => {
      setSection(initialSection);
      if (initialSection === "orders" && focusOrderId) {
        loadOrderComplaints(focusOrderId);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [focusNonce, focusOrderId, initialSection, loadOrderComplaints]);

  const statusColors = {
    todo: "#ff6b6b",
    in_progress: "#ffd93d",
    done: "#51cf66",
    cancelled: "#a5a5a5",
  };

  if (!user || user.role !== "SUPERVISOR") {
    return (
      <div className="empty" style={{ marginTop: 60 }}>
        <div className="empty-icon">🔒</div>
        <p>Supervisor access required</p>
      </div>
    );
  }

  const employeeUserIds = new Set(employees.map((e) => e.user?.idUser).filter(Boolean));
  const supervisorUserIds = new Set(supervisors.map((s) => s.user?.idUser).filter(Boolean));
  const clientUsers = users.filter((u) => !employeeUserIds.has(u.idUser) && !supervisorUserIds.has(u.idUser));
  const employeeUsers = users.filter((u) => employeeUserIds.has(u.idUser));
  const supervisorUsers = users.filter((u) => supervisorUserIds.has(u.idUser));

  const displayUsers =
    userTab === "clients" ? clientUsers :
    userTab === "employees" ? employeeUsers :
    supervisorUsers;

  const filteredEmployeeTasks =
    employeeTasksFilter === "all"
      ? employeeTasks
      : employeeTasks.filter((t) => t.status === employeeTasksFilter);

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div style={{ padding: "0 28px 24px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "1.1rem" }}>PoolPro</div>
          <div style={{ color: "rgba(255,255,255,.5)", fontSize: "0.8rem" }}>Admin Panel</div>
        </div>
        {[
          { id: "users", label: "👥 Users" },
          { id: "employee-tasks", label: "✅ Employee Tasks" },
          { id: "projects", label: "📋 Projects" },
          { id: "items", label: "📦 Items" },
          { id: "orders", label: "📝 Orders" },
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h1>Users</h1>
              <button className="btn-primary" onClick={() => { setRegMsg(""); setShowRegModal(true); }}>
                + Register Staff
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[
                { id: "clients", label: `👤 Clients (${clientUsers.length})` },
                { id: "employees", label: `🔧 Employees (${employeeUsers.length})` },
                { id: "supervisors", label: `🔑 Supervisors (${supervisorUsers.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`btn-${userTab === tab.id ? "primary" : "secondary"}`}
                  onClick={() => setUserTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "var(--mid)", padding: 24 }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    displayUsers.map((u) => (
                      <tr key={u.idUser}>
                        <td>{u.idUser}</td>
                        <td>{u.username}</td>
                        <td>{u.firstName} {u.lastName}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>
                          <span className={`status-badge ${u.status === "active" ? "status-done" : "status-cancelled"}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                         {u.status === "active" ? (
  <button className="btn-ghost" onClick={() => {
    const emp = employees.find((e) => e.user?.idUser === u.idUser);
    emp ? updateEmpStatus(emp.idEmployee, "inactive") : deactivateUser(u.idUser);
  }}>Deactivate</button>
) : (
  <button className="btn-primary" onClick={() => {
    const emp = employees.find((e) => e.user?.idUser === u.idUser);
    emp ? updateEmpStatus(emp.idEmployee, "active") : activateUser(u.idUser);
  }}>Activate</button>
)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === "employee-tasks" && (
          <>
            <h1>Employee Tasks</h1>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <select
                className="form-select"
                style={{ width: 280 }}
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setEmployeeTasksFilter("all");
                  setEmployeeTasks([]);
                  if (e.target.value) loadEmployeeTasks(e.target.value);
                }}
              >
                <option value="">— Select Employee —</option>
                {employees.map((e) => (
                  <option key={e.idEmployee} value={e.idEmployee}>
                    {e.user?.firstName} {e.user?.lastName}
                  </option>
                ))}
              </select>
              {selectedEmployeeId && (
                <button className="btn-secondary" onClick={() => loadEmployeeTasks(selectedEmployeeId)}>
                  Refresh
                </button>
              )}
            </div>

            {selectedEmployeeId && (
              <>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                  {["all", "todo", "in_progress", "done", "cancelled"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setEmployeeTasksFilter(status)}
                      style={{
                        padding: "6px 14px",
                        border: `2px solid ${employeeTasksFilter === status ? statusColors[status] || "#0093B2" : "#ccc"}`,
                        background: employeeTasksFilter === status ? (statusColors[status] || "#0093B2") + "20" : "transparent",
                        color: employeeTasksFilter === status ? statusColors[status] || "#0093B2" : "var(--mid)",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                      }}
                    >
                      {status === "all" ? "All" : status.replace("_", " ").toUpperCase()}
                      {" "}({status === "all" ? employeeTasks.length : employeeTasks.filter((t) => t.status === status).length})
                    </button>
                  ))}
                </div>

                {employeeTasksLoading ? (
                  <div style={{ color: "var(--mid)", padding: 20 }}>Loading tasks...</div>
                ) : filteredEmployeeTasks.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">📭</div>
                    <p>No tasks found</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {filteredEmployeeTasks.map((task) => (
                      <div
                        key={task.idTask}
                        style={{
                          background: "#fff",
                          border: "1px solid var(--light)",
                          borderRadius: 8,
                          padding: 16,
                          borderLeft: `4px solid ${statusColors[task.status] || "#ccc"}`,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>{task.title}</div>
                            <div style={{ fontSize: "0.9rem", color: "var(--mid)", marginBottom: 8 }}>{task.description}</div>
                            {task.deadline && (
                              <div style={{ fontSize: "0.85rem", color: "var(--mid)" }}>
                                📅 Deadline: {new Date(task.deadline).toLocaleDateString()}
                              </div>
                            )}
                            {task.project && (
                              <div style={{ fontSize: "0.85rem", color: "var(--mid)", marginTop: 4 }}>
                                📋 Project: {task.project.title || task.project}
                              </div>
                            )}
                          </div>
                          <span
                            style={{
                              padding: "4px 12px",
                              background: statusColors[task.status] || "#ccc",
                              color: "#fff",
                              borderRadius: 4,
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {task.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
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
                      <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                      <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="checkbox"
                            checked={Boolean(p.publicProject)}
                            onChange={(e) => updateProjectVisibility(p.idProject, e.target.checked)}
                          />
                          {p.publicProject ? "Public" : "Private"}
                        </label>
                      </td>
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
                  setItemForm(emptyItemForm);
                  setSelectedItem(null);
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
                    <th>Actions</th>
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
                      <td>
                        <button className="btn-secondary" onClick={() => openEditItem(item)}>Edit</button>
                        <button className="btn-ghost" onClick={() => deleteItem(item.idItem)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === "orders" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h1>Order Management</h1>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Total Price</th>
                    <th>View Items</th>
                    <th>Complaints</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.idOrder}
                      onDoubleClick={() => openOrderDetails(order.idOrder)}
                      style={{ cursor: "pointer" }}
                      title="Double click to open order details"
                    >
                      <td>{order.idOrder}</td>
                      <td>{order.clientFirstName || "—"}</td>
                      <td>{order.clientLastName || "—"}</td>
                      <td>{order.clientPhone || "—"}</td>
                      <td>{order.address}</td>
                      <td>{order.totalPrice?.toFixed(2) || "0.00"} KM</td>
                      <td>
                        <button className="btn-secondary" onClick={() => openOrderDetails(order.idOrder)}>
                          View Items
                        </button>
                      </td>
                      <td>
                        <button className="btn-secondary" onClick={() => loadOrderComplaints(order.idOrder)}>
                          Complaints
                        </button>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ width: "auto" }}
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.idOrder, e.target.value)}
                        >
                          <option value="pending">pending</option>
                          <option value="in_progress">in_progress</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.map((order) =>
              orderComplaints[order.idOrder] ? (
                <div key={`complaint-${order.idOrder}`} style={{ marginTop: 16, background: "var(--light)", padding: 16, borderRadius: 10 }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Order {order.idOrder} complaints</div>
                  {orderComplaints[order.idOrder].length === 0 ? (
                    <div style={{ color: "var(--mid)" }}>No complaints yet</div>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {orderComplaints[order.idOrder].map((complaint) => (
                        <button
                          key={complaint.idOrderComplaint}
                          className="complaint-card"
                          onClick={() => onComplaintReply?.(complaint)}
                        >
                          <div style={{ fontSize: "0.9rem", color: "var(--mid)", marginBottom: 6 }}>
                            {complaint.timestamp ? new Date(complaint.timestamp).toLocaleString() : "Unknown"}
                          </div>
                          <div>{complaint.comment}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </>
        )}
      </div>

      {selectedOrderDetails && (
        <div className="modal-overlay" onClick={() => setSelectedOrderDetails(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Order #{selectedOrderDetails.idOrder}</h2>
            <div style={{ color: "var(--mid)", marginBottom: 16 }}>
              Client: {selectedOrderDetails.clientFirstName || ""} {selectedOrderDetails.clientLastName || ""}
              {selectedOrderDetails.clientUsername ? ` (@${selectedOrderDetails.clientUsername})` : ""}
              <br />
              Phone: {selectedOrderDetails.clientPhone || "—"}
              <br />
              Address: {selectedOrderDetails.address}
              <br />
              Status: {selectedOrderDetails.status}
            </div>
            <div className="table-wrap" style={{ marginBottom: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrderDetails.items || []).map((item) => (
                    <tr key={item.idItem}>
                      <td>{item.title}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price?.toFixed?.(2) || item.price} KM</td>
                      <td>{item.subtotal?.toFixed?.(2) || item.subtotal} KM</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontWeight: 800, marginBottom: 16 }}>
              Total: {selectedOrderDetails.totalPrice?.toFixed?.(2) || selectedOrderDetails.totalPrice} KM
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedOrderDetails(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                <input className="form-input" value={regForm.firstName} onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" value={regForm.lastName} onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={regForm.username} onChange={(e) => setRegForm({ ...regForm, username: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={regForm.role} onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
              </select>
            </div>
            <div style={{ marginBottom: 16, color: "var(--mid)" }}>
              {regForm.role === "SUPERVISOR"
                ? "Creating a new supervisor account will allow this user to manage staff, projects and orders."
                : "Creating a new employee account will allow this user to access employee features."}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={regForm.description} onChange={(e) => setRegForm({ ...regForm, description: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRegModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={registerEmployee}>
                {regForm.role === "SUPERVISOR" ? "Register Supervisor" : "Register Employee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedItem ? "Edit Item" : "Add New Item"}</h2>
            {itemMsg && (
              <div className={`alert ${itemMsg.toLowerCase().includes("success") || itemMsg.toLowerCase().includes("created") ? "alert-success" : "alert-error"}`}>
                {itemMsg}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} placeholder="e.g., Pool Filter Pump" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} placeholder="e.g., Pumps" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price (KM)</label>
                <input className="form-input" type="number" step="0.01" value={itemForm.unitPrice} onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Item Image</label>
              <input
                className="form-input"
                type="file"
                accept="image/*"
                onChange={(e) => setItemForm({ ...itemForm, photoFile: e.target.files?.[0] || null })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Image Title</label>
              <input
                className="form-input"
                value={itemForm.photoTitle}
                onChange={(e) => setItemForm({ ...itemForm, photoTitle: e.target.value })}
                placeholder="e.g., Main product photo"
                maxLength={45}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowItemModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={selectedItem ? saveItem : createItem}>
                {selectedItem ? "Save Item" : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
