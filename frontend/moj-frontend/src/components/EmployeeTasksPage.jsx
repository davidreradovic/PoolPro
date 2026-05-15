import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function EmployeeTasksPage({ setPage }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Get employee by userId
        const userId = user.id || user.idUser;
        if (!userId) return;
        const empRes = await apiFetch(`/employees/user/${userId}`, {}, user.token);
        if (empRes && empRes.idEmployee) {
          setEmployee(empRes);

          // Get tasks for this employee
          const tasksRes = await apiFetch(
            `/tasks/employee/${empRes.idEmployee}`,
            {},
            user.token
          );
          if (Array.isArray(tasksRes)) {
            setTasks(tasksRes);
          }
        }
      } catch (e) {
        console.error("Failed to fetch employee tasks", e);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await apiFetch(
        `/tasks/${taskId}/status?status=${newStatus}`,
        { method: "PUT" },
        user.token
      );
      if (typeof res === "string" && res.includes("success") || res.idTask) {
        // Refresh tasks
        if (employee) {
          const tasksRes = await apiFetch(
            `/tasks/employee/${employee.idEmployee}`,
            {},
            user.token
          );
          if (Array.isArray(tasksRes)) {
            setTasks(tasksRes);
          }
        }
      }
    } catch (e) {
      console.error("Failed to update task status", e);
    }
  };

  const filteredTasks =
    filter === "all"
      ? tasks
      : tasks.filter((t) => t.status === filter);

  const statusColors = {
    todo: "#ff6b6b",
    in_progress: "#ffd93d",
    done: "#51cf66",
    cancelled: "#a5a5a5",
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
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", marginBottom: 28 }}>
        My Tasks
      </h1>

      {employee && (
        <div style={{ background: "var(--light)", padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <div style={{ fontSize: "0.9rem", color: "var(--mid)" }}>Employee Profile</div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: 4 }}>
            {employee.description || "No description"}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <label className="form-label">Filter by Status</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "todo", "in_progress", "done", "cancelled"].map((status) => (
            <button
              key={status}
              className={`status-badge ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
              style={{
                padding: "8px 16px",
                border: `2px solid ${filter === status ? statusColors[status] || "#0093B2" : "#ccc"}`,
                background: filter === status ? (statusColors[status] || "#0093B2") + "20" : "transparent",
                color: statusColors[status] || "#0093B2",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              {status === "all" ? "All Tasks" : status.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <p>No tasks {filter !== "all" ? `in status "${filter}"` : ""}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filteredTasks.map((task) => (
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
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, marginBottom: 4 }}>{task.title}</h3>
                  <p style={{ color: "var(--mid)", fontSize: "0.9rem", margin: 0, marginBottom: 8 }}>
                    {task.description}
                  </p>
                  {task.deadline && (
                    <div style={{ fontSize: "0.85rem", color: "var(--mid)" }}>
                      📅 Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      padding: "4px 12px",
                      background: statusColors[task.status] || "#ccc",
                      color: "#fff",
                      borderRadius: 4,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      marginBottom: 12,
                    }}
                  >
                    {task.status.replace("_", " ").toUpperCase()}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {task.status !== "done" && task.status !== "cancelled" && (
                  <>
                    {task.status === "todo" && (
                      <button
                        className="btn-secondary"
                        style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                        onClick={() => updateTaskStatus(task.idTask, "in_progress")}
                      >
                        Start Task
                      </button>
                    )}
                    {task.status === "in_progress" && (
                      <button
                        className="btn-secondary"
                        style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                        onClick={() => updateTaskStatus(task.idTask, "done")}
                      >
                        Mark Done
                      </button>
                    )}
                    <button
                      className="btn-ghost"
                      style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                      onClick={() => updateTaskStatus(task.idTask, "cancelled")}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
