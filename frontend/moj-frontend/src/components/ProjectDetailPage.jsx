import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function ProjectDetailPage({ project, setPage }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    deadline: "",
    idEmployee: "",
  });

  useEffect(() => {
    if (!project) return;
    apiFetch(`/projects/${project.idProject}/tasks`, {}, user?.token).then(
      (r) => Array.isArray(r) && setTasks(r)
    );
    apiFetch("/employees", {}, user?.token).then((r) => Array.isArray(r) && setEmployees(r));
  }, [project, user]);

  const createTask = async () => {
    await apiFetch(
      "/tasks",
      {
        method: "POST",
        body: JSON.stringify({
          idProject: project.idProject,
          title: taskForm.title,
          description: taskForm.description,
          deadline: taskForm.deadline || null,
          idEmployee: taskForm.idEmployee ? parseInt(taskForm.idEmployee) : null,
        }),
      },
      user?.token
    );
    apiFetch(`/projects/${project.idProject}/tasks`, {}, user?.token).then(
      (r) => Array.isArray(r) && setTasks(r)
    );
    setShowTaskModal(false);
  };

  const updateTaskStatus = async (taskId, status) => {
    await apiFetch(`/tasks/${taskId}/status?status=${status}`, { method: "PUT" }, user?.token);
    apiFetch(`/projects/${project.idProject}/tasks`, {}, user?.token).then(
      (r) => Array.isArray(r) && setTasks(r)
    );
  };

  const cols = ["todo", "in_progress", "done", "cancelled"];
  const colLabels = { todo: "To Do", in_progress: "In Progress", done: "Done", cancelled: "Cancelled" };

  return (
    <div style={{ padding: "40px" }}>
      <div className="breadcrumb">
        <span onClick={() => setPage("projects")}>Projects</span> / {project?.title}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem" }}>
            {project?.title}
          </h1>
          <p style={{ color: "var(--mid)", marginTop: 6 }}>{project?.description}</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className={`status-badge status-${project?.status}`}>{project?.status}</span>
          {user?.role === "SUPERVISOR" && (
            <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
              + Add Task
            </button>
          )}
          {(user?.role === "CLIENT" || user?.role === "SUPERVISOR") && (
            <button className="btn-secondary" onClick={() => setPage("messages")}>
              💬 Messages
            </button>
          )}
        </div>
      </div>
      <div className="tasks-board">
        {cols.map((col) => (
          <div key={col} className="task-column">
            <div className="task-col-title">{colLabels[col]}</div>
            {tasks.filter((t) => t.status === col).map((t) => (
              <div key={t.idTask} className="task-card">
                <h4>{t.title}</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--mid)", marginTop: 4 }}>
                  {t.description?.slice(0, 80)}
                </p>
                {t.employee && <div className="assignee">👤 {t.employee}</div>}
                {t.deadline && <div className="deadline">📅 {t.deadline}</div>}
                {(user?.role === "SUPERVISOR" || user?.role === "EMPLOYEE") && (
                  <select
                    className="form-select"
                    style={{ marginTop: 8, fontSize: "0.8rem" }}
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.idTask, e.target.value)}
                  >
                    {cols.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Task</h2>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                className="form-input"
                type="date"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assign to Employee</label>
              <select
                className="form-select"
                value={taskForm.idEmployee}
                onChange={(e) => setTaskForm({ ...taskForm, idEmployee: e.target.value })}
              >
                <option value="">— Unassigned —</option>
                {employees.map((emp) => (
                  <option key={emp.idEmployee} value={emp.idEmployee}>
                    {emp.user?.firstName} {emp.user?.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowTaskModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={createTask}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
