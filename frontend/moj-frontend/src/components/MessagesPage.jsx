import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function MessagesPage({ setPage }) {
  const { user } = useAuth();
  console.log("DEBUG - Cijeli user objekat:", user);
  const userId = user?.id || user?.idUser;
  const [msgs, setMsgs] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [content, setContent] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    apiFetch("/users", {}, user.token).then(
      (r) => Array.isArray(r) && setUsers(r.filter((u) => u.idUser !== userId))
    );
  }, [user, userId]);

  const fetchConv = async () => {
    if (!receiverId || !userId) return;
    const res = await apiFetch(
      `/messages/conversation?user1Id=${userId}&user2Id=${receiverId}`,
      {},
      user.token
    );
    if (Array.isArray(res)) setMsgs(res);
  };

  const sendMsg = async () => {
    if (!content.trim() || !receiverId) return;
    await apiFetch(
      "/messages",
      { method: "POST", body: JSON.stringify({ receiverId: parseInt(receiverId), content }) },
      user.token
    );
    setContent("");
    fetchConv();
  };

  if (!user) {
    return (
      <div className="empty" style={{ marginTop: 60 }}>
        <div className="empty-icon">🔒</div>
        <p>Please sign in</p>
      </div>
    );
  }

  return (
    <div className="messages-layout">
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", marginBottom: 28 }}>
        Messages
      </h1>
      <div className="form-group">
        <label className="form-label">Conversation with</label>
        <select
          className="form-select"
          value={receiverId}
          onChange={(e) => {
            setReceiverId(e.target.value);
          }}
        >
          <option value="">Select user…</option>
          {users.map((u) => (
            <option key={u.idUser} value={u.idUser}>
              {u.firstName} {u.lastName} ({u.username})
            </option>
          ))}
        </select>
        <button className="btn-secondary" style={{ marginTop: 10 }} onClick={fetchConv}>
          Load Conversation
        </button>
      </div>
      <div style={{ minHeight: 300, background: "var(--light)", borderRadius: 10, padding: 20, marginTop: 8 }}>
        {msgs.length === 0 ? (
          <p style={{ color: "var(--mid)", fontSize: "0.9rem" }}>No messages yet</p>
        ) : (
          msgs.map((m) => (
            <div
              key={m.idMessage}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.senderId === userId ? "flex-end" : "flex-start",
              }}
            >
              <div className={`message-bubble ${m.senderId === userId ? "sent" : "recv"}`}>
                {m.content}
                <div className="message-ts">
                  {m.senderName} · {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ""}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="message-input-row">
        <input
          className="form-input"
          style={{ flex: 1 }}
          placeholder="Type a message…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
        />
        <button className="btn-primary" onClick={sendMsg}>
          Send
        </button>
      </div>
    </div>
  );
}
