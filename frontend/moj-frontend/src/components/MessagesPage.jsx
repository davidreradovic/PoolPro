import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

const parseComplaintMessage = (content) => {
  const orderMatch = String(content || "").match(
    /^\[\[ORDER_COMPLAINT id_order_complaint="([^"]+)" order_id="([^"]+)"\]\]\n([\s\S]*)$/
  );

  if (orderMatch) {
    return {
      type: "order",
      complaintId: orderMatch[1],
      orderId: orderMatch[2],
      text: orderMatch[3],
    };
  }

  const projectMatch = String(content || "").match(
    /^\[\[PROJECT_COMPLAINT id_project_complaint="([^"]+)" project_id="([^"]+)" project_title="([^"]*)"\]\]\n([\s\S]*)$/
  );

  if (!projectMatch) return null;

  return {
    type: "project",
    complaintId: projectMatch[1],
    projectId: projectMatch[2],
    projectTitle: projectMatch[3],
    text: projectMatch[4],
  };
};

const getMessageDayKey = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toDateString();
};

const formatMessageDay = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
};

export function MessagesPage({ initialDraft }) {
  const { user } = useAuth();
  const userId = user?.id || user?.idUser;
  const [msgs, setMsgs] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [content, setContent] = useState("");
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [messageStatus, setMessageStatus] = useState("");
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const threadRef = useRef(null);
  const appliedDraftIdRef = useRef(null);

  const selectedUser = contacts.find((u) => Number(u.idUser) === Number(receiverId));

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [msgs, receiverId]);

  const loadUnread = useCallback(async () => {
    if (!userId || !user) return;

    try {
      const res = await apiFetch(`/messages/unread/${userId}`, {}, user.token);
      if (Array.isArray(res)) {
        setUnreadMessages(res);
      }
    } catch (e) {
      console.error("Failed to load unread messages", e);
    }
  }, [user, userId]);

  const fetchConv = useCallback(async (nextReceiverId = receiverId) => {
    if (!nextReceiverId || !userId || !user) return;

    setLoadingConversation(true);
    try {
      const res = await apiFetch(
        `/messages/conversation?user1Id=${userId}&user2Id=${nextReceiverId}`,
        {},
        user.token
      );
      if (Array.isArray(res)) {
        setMsgs(res);
        const unread = res.filter((m) => m.receiverId === userId && !m.isRead);
        if (unread.length > 0) {
          try {
            await Promise.all(
              unread.map((m) => apiFetch(`/messages/${m.idMessage}/read`, { method: "PUT" }, user.token))
            );
            loadUnread();
          } catch (e) {
            console.error("Failed to mark messages as read", e);
          }
        }
      } else {
        setMessageStatus(res || "Conversation could not be loaded.");
      }
    } catch (e) {
      setMessageStatus(`Failed to load conversation: ${e.message}`);
    } finally {
      setLoadingConversation(false);
    }
  }, [loadUnread, receiverId, user, userId]);

  const loadContacts = useCallback(async () => {
    if (!user) return;

    try {
      const res = await apiFetch("/messages/contacts", {}, user.token);
      if (!Array.isArray(res)) return;

      setContacts(res);
      if (res.length > 0 && !receiverId) {
        const firstReceiverId = String(res[0].idUser);
        setReceiverId(firstReceiverId);
        fetchConv(firstReceiverId);
      }
    } catch (e) {
      setMessageStatus(`Failed to load chats: ${e.message}`);
    }
  }, [fetchConv, receiverId, user]);

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      loadContacts();
      loadUnread();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadContacts, loadUnread, user]);

  useEffect(() => {
    if (!user || !initialDraft?.text || appliedDraftIdRef.current === initialDraft.id) return;

    let ignore = false;
    const timer = setTimeout(async () => {
      appliedDraftIdRef.current = initialDraft.id;
      setContent(initialDraft.text);

      if (initialDraft.receiver?.idUser) {
        const draftReceiver = initialDraft.receiver;
        setContacts((current) => {
          const exists = current.some((u) => Number(u.idUser) === Number(draftReceiver.idUser));
          return exists ? current : [draftReceiver, ...current];
        });
        setReceiverId(String(draftReceiver.idUser));
        setMobileChatOpen(true);
        fetchConv(draftReceiver.idUser);
        return;
      }

      if (receiverId) return;

      try {
        const res = await apiFetch("/users/message-recipients", {}, user.token);
        if (ignore || !Array.isArray(res) || res.length === 0) return;

        const firstRecipient = res[0];
        setContacts((current) => {
          const exists = current.some((u) => Number(u.idUser) === Number(firstRecipient.idUser));
          return exists ? current : [firstRecipient, ...current];
        });
        setReceiverId(String(firstRecipient.idUser));
        setMobileChatOpen(true);
        fetchConv(firstRecipient.idUser);
      } catch (e) {
        if (!ignore) setMessageStatus(`Failed to prepare message: ${e.message}`);
      }
    }, 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [fetchConv, initialDraft, receiverId, user]);

  useEffect(() => {
    if (!user || searchText.trim().length < 2) {
      const timer = setTimeout(() => {
        setSearchResults([]);
        setSearching(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let ignore = false;
    const searchUsers = async () => {
      setSearching(true);
      try {
        const res = await apiFetch(
          `/users/message-recipients/search?username=${encodeURIComponent(searchText.trim())}`,
          {},
          user.token
        );
        if (!ignore) {
          setSearchResults(Array.isArray(res) ? res : []);
        }
      } catch (e) {
        if (!ignore) setMessageStatus(`Search failed: ${e.message}`);
      } finally {
        if (!ignore) setSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 250);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [searchText, user]);

  const openConversation = (nextUser) => {
    const nextReceiverId = typeof nextUser === "object" ? nextUser.idUser : nextUser;
    if (typeof nextUser === "object") {
      setContacts((current) => {
        const exists = current.some((u) => Number(u.idUser) === Number(nextUser.idUser));
        return exists ? current : [nextUser, ...current];
      });
    }
    setReceiverId(String(nextReceiverId));
    setContent("");
    setMessageStatus("");
    setSearchText("");
    setSearchResults([]);
    setMobileChatOpen(true);
    fetchConv(nextReceiverId);
  };

  const sendMsg = async () => {
    const text = content.trim();
    if (!text || !receiverId) return;

    const optimisticMessage = {
      idMessage: `local-${Date.now()}`,
      senderId: userId,
      senderName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
      receiverId: Number(receiverId),
      content: text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMsgs((current) => [...current, optimisticMessage]);
    setContent("");
    setMessageStatus("");

    let sent = false;
    try {
      const res = await apiFetch(
        "/messages",
        { method: "POST", body: JSON.stringify({ receiverId: Number(receiverId), content: text }) },
        user.token
      );
      if (typeof res === "string") {
        setMessageStatus(res);
        return;
      }
      sent = true;
    } catch (e) {
      setMessageStatus(`Failed to send message: ${e.message}`);
    }

      if (sent) {
      try {
        await fetchConv(receiverId);
        await loadContacts();
        loadUnread();
      } catch (e) {
        console.error("Message sent, but refresh failed", e);
      }
    }
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
      <div className="messages-header">
        <h1>Messages</h1>
        <div className="messages-unread">Unread: <strong>{unreadMessages.length}</strong></div>
      </div>

      <div className={`messages-shell ${mobileChatOpen ? "mobile-chat-open" : ""}`}>
        <aside className="messages-sidebar">
          <div className="message-search">
            <input
              className="form-input"
              placeholder="Search username..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText.trim().length > 0 && searchText.trim().length < 2 && (
              <div className="messages-empty">Enter at least 2 characters</div>
            )}
            {searching && <div className="messages-empty">Searching...</div>}
            {searchResults.length > 0 && (
              <div className="message-search-results">
                {searchResults.map((u) => (
                  <button
                    key={u.idUser}
                    className="message-contact compact"
                    onClick={() => openConversation(u)}
                  >
                    <span>
                      <strong>{u.firstName} {u.lastName}</strong>
                      <small>@{u.username} · {u.role}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="messages-sidebar-title">Chats</div>
          {contacts.length === 0 ? (
            <div className="messages-empty sidebar-note">No previous chats</div>
          ) : (
            contacts.map((u) => {
              const unreadCount = unreadMessages.filter((m) => Number(m.senderId) === Number(u.idUser)).length;
              return (
                <button
                  key={u.idUser}
                  className={`message-contact ${Number(receiverId) === Number(u.idUser) ? "active" : ""}`}
                  onClick={() => openConversation(u.idUser)}
                >
                  <span>
                    <strong>{u.firstName} {u.lastName}</strong>
                    <small>@{u.username} · {u.role}</small>
                  </span>
                  {unreadCount > 0 && <em>{unreadCount}</em>}
                </button>
              );
            })
          )}
        </aside>

        <section className="messages-chat">
          <div className="messages-chat-title">
            <button
              className="messages-back-btn"
              type="button"
              onClick={() => setMobileChatOpen(false)}
            >
              Back
            </button>
            {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "Select a contact"}
          </div>

          <div className="messages-thread" ref={threadRef}>
            {loadingConversation ? (
              <p className="messages-empty">Loading conversation...</p>
            ) : msgs.length === 0 ? (
              <p className="messages-empty">No messages yet</p>
            ) : (
              msgs.map((m, index) => {
                const complaint = parseComplaintMessage(m.content);
                const sent = m.senderId === userId;
                const currentDay = getMessageDayKey(m.timestamp);
                const previousDay = getMessageDayKey(msgs[index - 1]?.timestamp);
                const showDaySeparator = currentDay && currentDay !== previousDay;

                return (
                  <div key={m.idMessage}>
                    {showDaySeparator && (
                      <div className="message-day-separator">
                        <span>{formatMessageDay(m.timestamp)}</span>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: sent ? "flex-end" : "flex-start",
                      }}
                    >
                      {complaint ? (
                        <div className={`complaint-message-card ${sent ? "sent" : "recv"}`}>
                          <div className="complaint-message-title">Sadrzaj zalbe</div>
                          <div className="complaint-message-order">
                            {complaint.type === "project"
                              ? `Projekat #${complaint.projectId} · ${complaint.projectTitle}`
                              : `Narudzba #${complaint.orderId}`}
                          </div>
                          <div className="complaint-message-content">{complaint.text}</div>
                          <div className="message-ts">
                            {m.senderName} · {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ""}
                          </div>
                        </div>
                      ) : (
                        <div className={`message-bubble ${sent ? "sent" : "recv"}`}>
                          {m.content}
                          <div className="message-ts">
                            {m.senderName} · {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ""}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="message-input-row">
            <input
              className="form-input"
              style={{ flex: 1 }}
              placeholder={receiverId ? "Type a message..." : "Select a contact first"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              disabled={!receiverId}
            />
            <button className="btn-primary" onClick={sendMsg} disabled={!receiverId || !content.trim()}>
              Send
            </button>
          </div>
          {messageStatus && (
            <div className="alert alert-danger" style={{ marginTop: 12 }}>
              {messageStatus}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
