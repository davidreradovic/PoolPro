import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

const TASK_COLUMNS = ["todo", "in_progress", "done", "cancelled"];
const TASK_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

export function ProjectDetailPage({ project, setPage }) {
  const { user } = useAuth();
  const projectId = project?.idProject || project?.id;
  const token = user?.token;
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskComments, setTaskComments] = useState([]);
  const [taskPhotos, setTaskPhotos] = useState([]);
  const [taskCommentText, setTaskCommentText] = useState("");
  const [taskPhotoFile, setTaskPhotoFile] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [projectComments, setProjectComments] = useState([]);
  const [projectCommentText, setProjectCommentText] = useState("");
  const [projectComplaints, setProjectComplaints] = useState([]);
  const [projectComplaintText, setProjectComplaintText] = useState("");
  const [projectComplaintMessage, setProjectComplaintMessage] = useState("");
  const [showProjectComplaints, setShowProjectComplaints] = useState(false);
  const projectCommentsRef = useRef(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    deadline: "",
    idEmployee: "",
  });

  const loadTasks = async () => {
    if (!projectId) return;
    try {
      const res = await apiFetch(`/projects/${projectId}/tasks`, {}, token);
      if (Array.isArray(res)) setTasks(res);
    } catch (e) {
      console.error("Failed to load project tasks", e);
    }
  };

  const loadProjectComments = async () => {
    if (!projectId) return;
    try {
      const res = await apiFetch(`/project-comments/project/${projectId}`);
      if (Array.isArray(res)) {
        setProjectComments(res);
      }
    } catch (e) {
      console.error("Failed to load project comments", e);
    }
  };

  const loadProjectComplaints = async () => {
    if (!projectId || !user) return;
    try {
      const res = await apiFetch(`/projects/${projectId}/complaints`, {}, user.token);
      if (Array.isArray(res)) {
        setProjectComplaints(res);
      }
    } catch (e) {
      console.error("Failed to load project complaints", e);
    }
  };

  const loadTaskDetails = async (task) => {
    setSelectedTask(task);
    setTaskCommentText("");
    setTaskPhotoFile(null);

    const [commentsRes, photosRes] = await Promise.allSettled([
      apiFetch(`/task-comments/task/${task.idTask}`, {}, user?.token),
      apiFetch(`/photos/task/${task.idTask}`, {}, user?.token),
    ]);

    setTaskComments(commentsRes.status === "fulfilled" && Array.isArray(commentsRes.value) ? commentsRes.value : []);
    setTaskPhotos(photosRes.status === "fulfilled" && Array.isArray(photosRes.value) ? photosRes.value : []);
  };

  useEffect(() => {
    if (!project) return;
    const timer = setTimeout(() => {
      loadTasks();
      loadProjectComments();
      if (user?.role === "CLIENT" || user?.role === "SUPERVISOR") {
        loadProjectComplaints();
      }
      if (user?.role === "SUPERVISOR") {
        apiFetch("/employees", {}, user?.token).then((r) => Array.isArray(r) && setEmployees(r));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [project, user]);

  useEffect(() => {
    const commentsPanel = projectCommentsRef.current;
    if (!commentsPanel) return;
    commentsPanel.scrollTop = commentsPanel.scrollHeight;
  }, [projectComments]);

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
    setTaskForm({ title: "", description: "", deadline: "", idEmployee: "" });
    setShowTaskModal(false);
    loadTasks();
  };

  const updateTaskStatus = async (taskId, status) => {
    await apiFetch(`/tasks/${taskId}/status?status=${status}`, { method: "PUT" }, user?.token);
    await loadTasks();
    setSelectedTask((current) => (current?.idTask === taskId ? { ...current, status } : current));
  };

  const assignTask = async (taskId, employeeId) => {
    if (!employeeId) return;
    await apiFetch(`/tasks/${taskId}/assign/${employeeId}`, { method: "PUT" }, user?.token);
    await loadTasks();
  };

  const unassignTask = async (taskId) => {
    await apiFetch(`/tasks/${taskId}/unassign`, { method: "PUT" }, user?.token);
    await loadTasks();
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    await apiFetch(`/tasks/${taskId}`, { method: "DELETE" }, user?.token);
    setSelectedTask(null);
    await loadTasks();
  };

  const postTaskComment = async () => {
    if (!selectedTask || !taskCommentText.trim()) return;
    await apiFetch(
      "/task-comments",
      {
        method: "POST",
        body: JSON.stringify({ taskId: selectedTask.idTask, content: taskCommentText }),
      },
      user?.token
    );
    setTaskCommentText("");
    await loadTaskDetails(selectedTask);
  };

  const postTaskPhoto = async () => {
    if (!selectedTask || !taskPhotoFile) return;
    const formData = new FormData();
    formData.append("file", taskPhotoFile);

    await apiFetch(
      `/photos/task/${selectedTask.idTask}/upload`,
      { method: "POST", body: formData },
      user?.token
    );
    setTaskPhotoFile(null);
    await loadTaskDetails(selectedTask);
  };

  const postProjectComment = async () => {
    if (!projectCommentText.trim() || !user) return;
    try {
      await apiFetch(
        "/project-comments",
        {
          method: "POST",
          body: JSON.stringify({
            projectId,
            content: projectCommentText,
          }),
        },
        user?.token
      );
      setProjectCommentText("");
      loadProjectComments();
    } catch (e) {
      console.error("Failed to submit project comment", e);
    }
  };

  const submitProjectComplaint = async () => {
    const comment = projectComplaintText.trim();
    if (!comment) {
      setProjectComplaintMessage("Please write a complaint first.");
      return;
    }

    try {
      await apiFetch(
        `/projects/${projectId}/complaints`,
        { method: "POST", body: JSON.stringify({ comment }) },
        user?.token
      );
      setProjectComplaintText("");
      setProjectComplaintMessage("Complaint sent.");
      setShowProjectComplaints(true);
      loadProjectComplaints();
    } catch (e) {
      setProjectComplaintMessage(`Failed to send complaint: ${e.message}`);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <div className="breadcrumb">
        <span onClick={() => setPage("projects")}>Projects</span> / {project?.title}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem" }}>{project?.title}</h1>
          <p style={{ color: "var(--mid)", marginTop: 6 }}>{project?.description}</p>
        </div>
        {user?.role === "SUPERVISOR" && (
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
            + Add Task
          </button>
        )}
      </div>

      <div className="tasks-board">
        {TASK_COLUMNS.map((status) => (
          <div key={status} className="task-column">
            <div className="task-col-title">
              {TASK_LABELS[status]} ({tasks.filter((task) => task.status === status).length})
            </div>
            {tasks.filter((task) => task.status === status).map((task) => (
              <button key={task.idTask} className="task-name-button" onClick={() => loadTaskDetails(task)}>
                {task.title}
              </button>
            ))}
          </div>
        ))}
      </div>

      {(user?.role === "CLIENT" || user?.role === "SUPERVISOR") && (
        <div style={{ marginTop: 32, padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 12px 28px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Project Complaints</h2>
              <p style={{ margin: "4px 0 0", color: "var(--mid)", fontSize: "0.95rem" }}>
                Send a project complaint directly to supervisors.
              </p>
            </div>
            <button className="btn-secondary" onClick={() => setShowProjectComplaints((open) => !open)}>
              {showProjectComplaints ? "Hide" : "Open"}
            </button>
          </div>

          {showProjectComplaints && (
            <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
              {projectComplaints.length === 0 ? (
                <div style={{ color: "var(--mid)", fontSize: "0.9rem" }}>No complaints yet.</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {projectComplaints.map((complaint) => (
                    <div key={complaint.idProjectComplaint} style={{ padding: 12, background: "var(--light)", borderRadius: 8 }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: 6 }}>
                        {complaint.timestamp ? new Date(complaint.timestamp).toLocaleString() : "Unknown date"}
                      </div>
                      <div>{complaint.comment}</div>
                    </div>
                  ))}
                </div>
              )}

              {user?.role === "CLIENT" && (
                <div>
                  <textarea
                    className="form-textarea"
                    placeholder="Submit a complaint or question for this project"
                    value={projectComplaintText}
                    onChange={(e) => setProjectComplaintText(e.target.value)}
                    style={{ minHeight: 90 }}
                  />
                  {projectComplaintMessage && (
                    <div style={{ color: "var(--mid)", fontSize: "0.9rem", marginTop: 8 }}>
                      {projectComplaintMessage}
                    </div>
                  )}
                  <button className="btn-primary" style={{ marginTop: 10 }} onClick={submitProjectComplaint}>
                    Send Complaint
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 32, padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 12px 28px rgba(0,0,0,0.06)" }}>
        <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Project Comments</h2>
        <p style={{ margin: "4px 0 18px", color: "var(--mid)", fontSize: "0.95rem" }}>Feedback related to this project.</p>

        <div className="project-comments-panel" ref={projectCommentsRef}>
          {projectComments.length === 0 ? (
            <div className="empty" style={{ margin: 0, padding: "20px 0" }}>
              <p>No comments yet</p>
            </div>
          ) : (
            projectComments.map((comment) => (
              <div key={comment.idProjectComment} className="project-comment-card">
                <div style={{ fontWeight: 700 }}>{comment.username}</div>
                <div>{comment.content}</div>
              </div>
            ))
          )}
        </div>

        <textarea
          className="form-textarea"
          placeholder="Add a project comment..."
          value={projectCommentText}
          onChange={(e) => setProjectCommentText(e.target.value)}
          style={{ minHeight: 100, marginBottom: 12 }}
        />
        <button className="btn-primary" onClick={postProjectComment}>
          Post Comment
        </button>
      </div>

      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal task-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
              <div>
                <h2>{selectedTask.title}</h2>
                {selectedTask.description && <p style={{ color: "var(--mid)", marginTop: 6 }}>{selectedTask.description}</p>}
                {selectedTask.deadline && <p style={{ color: "var(--mid)", marginTop: 8 }}>Deadline: {selectedTask.deadline}</p>}
              </div>
              <button className="btn-ghost" onClick={() => setSelectedTask(null)}>
                Close
              </button>
            </div>

            {(user?.role === "SUPERVISOR" || user?.role === "EMPLOYEE") && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                <select
                  className="form-select"
                  style={{ width: 180 }}
                  value={selectedTask.status}
                  onChange={(e) => updateTaskStatus(selectedTask.idTask, e.target.value)}
                >
                  {TASK_COLUMNS.map((status) => (
                    <option key={status} value={status}>
                      {TASK_LABELS[status]}
                    </option>
                  ))}
                </select>
                {user?.role === "SUPERVISOR" && (
                  <>
                    <select
                      className="form-select"
                      style={{ width: 220 }}
                      value={selectedTask.employee?.idEmployee || ""}
                      onChange={(e) => assignTask(selectedTask.idTask, e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">Assign / Reassign</option>
                      {employees.map((employee) => (
                        <option key={employee.idEmployee} value={employee.idEmployee}>
                          {employee.user?.firstName} {employee.user?.lastName}
                        </option>
                      ))}
                    </select>
                    <button className="btn-secondary" onClick={() => unassignTask(selectedTask.idTask)}>
                      Unassign
                    </button>
                    <button className="btn-danger" onClick={() => deleteTask(selectedTask.idTask)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <h3 style={{ marginBottom: 12 }}>Task Photos</h3>
              {taskPhotos.length === 0 ? (
                <p style={{ color: "var(--mid)" }}>No photos uploaded.</p>
              ) : (
                <div className="task-modal-photo-grid">
                  {taskPhotos.map((photo) => (
                    <button
                      key={photo.idPhoto || photo.img}
                      className="task-modal-photo"
                      style={{ backgroundImage: `url(${photo.imgUrl || photo.img})` }}
                      onClick={() => setPreviewPhoto(photo.imgUrl || photo.img)}
                      aria-label="Preview task photo"
                    />
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <input
                  className="form-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTaskPhotoFile(e.target.files?.[0] || null)}
                />
                <button className="btn-primary" onClick={postTaskPhoto} disabled={!taskPhotoFile}>
                  Upload
                </button>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <h3 style={{ marginBottom: 12 }}>Task Comments</h3>
              {taskComments.length === 0 ? (
                <p style={{ color: "var(--mid)" }}>No comments yet.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {taskComments.map((comment) => (
                    <div key={comment.idTaskComment} style={{ padding: 12, background: "var(--light)", borderRadius: 8 }}>
                      <div style={{ fontWeight: 700 }}>{comment.username}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: 6 }}>
                        {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ""}
                      </div>
                      <div>{comment.content}</div>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                className="form-textarea"
                value={taskCommentText}
                onChange={(e) => setTaskCommentText(e.target.value)}
                placeholder="Write a task comment..."
                style={{ minHeight: 90, marginTop: 14 }}
              />
              <button className="btn-primary" style={{ marginTop: 8 }} onClick={postTaskComment}>
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}

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
                <option value="">Unassigned</option>
                {employees.map((employee) => (
                  <option key={employee.idEmployee} value={employee.idEmployee}>
                    {employee.user?.firstName} {employee.user?.lastName}
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

      {previewPhoto && (
        <div className="image-preview-overlay" onClick={() => setPreviewPhoto(null)}>
          <button className="image-preview-close" onClick={() => setPreviewPhoto(null)}>
            x
          </button>
          <img src={previewPhoto} alt="task preview" className="image-preview" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
