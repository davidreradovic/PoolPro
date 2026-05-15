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
  const [view, setView] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", idClient: "", idSupervisor: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/projects", {}, user?.token);
      if (Array.isArray(res)) setProjects(res);
    } catch {}
    setLoading(false);
  };

  const createProject = async () => {
    try {
      await apiFetch(
        "/projects",
        {
          method: "POST",
          body: JSON.stringify({
            ...form,
            idClient: parseInt(form.idClient),
            idSupervisor: parseInt(form.idSupervisor),
          }),
        },
        user?.token
      );
      fetchProjects();
      setShowModal(false);
    } catch {}
  };

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/projects/${id}/status?status=${status}`, { method: "PUT" }, user?.token);
      fetchProjects();
    } catch {}
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await apiFetch(`/projects/${id}`, { method: "DELETE" }, user?.token);
      fetchProjects();
    } catch {}
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
          {(user?.role === "SUPERVISOR" || user?.role === "EMPLOYEE") && (
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
              <label className="form-label">Client ID</label>
              <input
                className="form-input"
                type="number"
                value={form.idClient}
                onChange={(e) => setForm({ ...form, idClient: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Supervisor ID</label>
              <input
                className="form-input"
                type="number"
                value={form.idSupervisor}
                onChange={(e) => setForm({ ...form, idSupervisor: e.target.value })}
              />
            </div>
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
