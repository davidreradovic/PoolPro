import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

function TasksBoardView({ projects, user }) {
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    const load = async () => {
      const results = await Promise.allSettled(
        projects.map((p) => apiFetch(`/projects/${p.idProject}/tasks`, {}, user?.token))
      );
      const tasks = results.flatMap((r) =>
        r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []
      );
      setAllTasks(tasks);
    };
    load();
  }, [projects, user]);

  const cols = ["todo", "in_progress", "done", "cancelled"];
  const colLabels = { todo: "To Do", in_progress: "In Progress", done: "Done", cancelled: "Cancelled" };

  return (
    <div className="tasks-board">
      {cols.map((col) => (
        <div key={col} className="task-column">
          <div className="task-col-title">
            {colLabels[col]} ({allTasks.filter((t) => t.status === col).length})
          </div>
          {allTasks.filter((t) => t.status === col).map((t) => (
            <div key={t.idTask} className="task-card">
              <h4>{t.title}</h4>
              <p style={{ fontSize: "0.82rem", color: "var(--mid)" }}>{t.description?.slice(0, 60)}</p>
              {t.employee && <div className="assignee">👤 {t.employee}</div>}
              {t.deadline && <div className="deadline">📅 {t.deadline}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ProjectsPage({ setPage, setSelectedProject }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [view, setView] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", idClient: "", publicProject: false });
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const userId = user.id || user.idUser;
      const path = user?.role === "CLIENT" ? `/projects/client/${userId}` : "/projects";
      const res = await apiFetch(path, {}, user?.token);
      if (Array.isArray(res)) setProjects(res);
    } catch (e) {
      console.error("Failed to load projects", e);
    }
    setLoading(false);
  };

  const fetchClients = async () => {
    try {
      const res = await apiFetch("/users/clients", {}, user?.token);
      if (Array.isArray(res)) {
        setClients(res);
        if (res.length > 0 && !form.idClient) {
          setForm((current) => ({ ...current, idClient: String(res[0].idClient) }));
        }
      }
    } catch (e) {
      console.error("Failed to load clients", e);
    }
  };

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      fetchProjects();
      if (user.role === "SUPERVISOR") {
        fetchClients();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  const createProject = async () => {
    try {
      await apiFetch(
        "/projects",
        {
          method: "POST",
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            idClient: parseInt(form.idClient),
            publicProject: form.publicProject,
          }),
        },
        user?.token
      );
      fetchProjects();
      setShowModal(false);
      setForm({
        title: "",
        description: "",
        idClient: clients[0]?.idClient ? String(clients[0].idClient) : "",
        publicProject: false,
      });
    } catch (e) {
      console.error("Failed to create project", e);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/projects/${id}/status?status=${status}`, { method: "PUT" }, user?.token);
      fetchProjects();
    } catch (e) {
      console.error("Failed to update project status", e);
    }
  };

  const updateVisibility = async (id, publicProject) => {
    try {
      await apiFetch(`/projects/${id}/public?publicProject=${publicProject}`, { method: "PUT" }, user?.token);
      fetchProjects();
    } catch (e) {
      console.error("Failed to update project visibility", e);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await apiFetch(`/projects/${id}`, { method: "DELETE" }, user?.token);
      fetchProjects();
    } catch (e) {
      console.error("Failed to delete project", e);
    }
  };

  if (!user) {
    return (
      <div className="empty" style={{ marginTop: 60 }}>
        <div className="empty-icon">🔒</div>
        <p>Please sign in to view projects</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setPage("auth")}>
          Sign In
        </button>
      </div>
    );
  }

  const statusColor = (s) =>
    ({
      todo: "status-todo",
      in_progress: "status-in_progress",
      done: "status-done",
      cancelled: "status-cancelled",
    }[s] || "status-todo");

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button className={`btn-ghost ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>
            ☰ List
          </button>
          <button className={`btn-ghost ${view === "board" ? "active" : ""}`} onClick={() => setView("board")}>
            ⊞ Board
          </button>
          {user?.role === "SUPERVISOR" && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + New Project
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <p>No projects found</p>
        </div>
      ) : view === "list" ? (
        projects.map((p) => (
          <div
            key={p.idProject}
            className="project-card"
            onClick={() => {
              setSelectedProject(p);
              setPage("project-detail");
            }}
          >
            <div className="project-card-info">
              <h3>{p.title || p.name}</h3>
              <p>{p.description?.slice(0, 80)}{p.description?.length > 80 ? "…" : ""}</p>
              {p.createdAt && <p style={{ marginTop: 4 }}>{new Date(p.createdAt).toLocaleDateString()}</p>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className={`status-badge ${statusColor(p.status)}`}>{p.status}</span>
              {user?.role === "SUPERVISOR" && (
                <label
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--mid)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(p.publicProject)}
                    onChange={(e) => updateVisibility(p.idProject, e.target.checked)}
                  />
                  Public
                </label>
              )}
              {user?.role === "SUPERVISOR" && (
                <select
                  className="form-select"
                  style={{ width: "auto", fontSize: "0.82rem" }}
                  value={p.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateStatus(p.idProject, e.target.value)}
                >
                  <option value="todo">todo</option>
                  <option value="in_progress">in_progress</option>
                  <option value="done">done</option>
                  <option value="cancelled">cancelled</option>
                </select>
              )}
              {user?.role === "SUPERVISOR" && (
                <button
                  className="btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(p.idProject);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <TasksBoardView projects={projects} user={user} />
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Project</h2>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Client</label>
              <select
                className="form-select"
                value={form.idClient}
                onChange={(e) => setForm({ ...form, idClient: e.target.value })}
              >
                <option value="">Select client...</option>
                {clients.map((client) => (
                  <option key={client.idClient} value={client.idClient}>
                    {client.firstName} {client.lastName} ({client.username})
                  </option>
                ))}
              </select>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <input
                type="checkbox"
                checked={form.publicProject}
                onChange={(e) => setForm({ ...form, publicProject: e.target.checked })}
              />
              <span style={{ color: "var(--mid)", fontWeight: 700 }}>Show this project on Home page</span>
            </label>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={createProject}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
