import React from "react";

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  userEmail,
  onLogout,
}) {
  return (
    <aside className="chat-sidebar dark-theme">
      {/* Header with New Chat trigger */}
      <div className="sidebar-header">
        <button
          type="button"
          className="btn btn--prime-new"
          onClick={onCreateSession}
        >
          <span className="plus-icon">+</span>
          <span>New Chat</span>
        </button>
      </div>

      {/* Sessions list */}
      <div className="sidebar-section-title">
        <span>Recent Conversations</span>
        <span className="badge-count">{sessions.length}</span>
      </div>

      <div className="sidebar-list">
        {sessions.length === 0 ? (
          <div className="sidebar-empty">
            <span className="empty-sparkle">✨</span>
            <p>No chat history yet</p>
            <small>Start a new thread above</small>
          </div>
        ) : (
          sessions.map((sess) => {
            const id = sess.session_id || sess.id;
            const isCurrent = id === activeSessionId;

            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                className={`sidebar-item ${isCurrent ? "is-selected" : ""}`}
                onClick={() => onSelectSession(id)}
              >
                <div className="item-left">
                  <span className="chat-indicator-icon">
                    {isCurrent ? "🔥" : "💬"}
                  </span>
                  <span className="sidebar-item-title" title={sess.title || `Session #${id}`}>
                    {sess.title || `Session #${id}`}
                  </span>
                </div>

                <button
                  type="button"
                  className="sidebar-delete-btn"
                  title="Delete chat session"
                  aria-label="Delete chat"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(id);
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Premium dark footer */}
      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar-initial">
            {(userEmail || "U")[0].toUpperCase()}
          </div>
          <div className="user-meta">
            <span className="user-email-text">{userEmail || "Employee"}</span>
            <span className="user-status-online">
              <span className="live-dot"></span> Online
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn--logout-dark"
          onClick={onLogout}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}