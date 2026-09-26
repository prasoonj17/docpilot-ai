import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useDocuments } from "../hooks/useDocuments";
import UploadForm from "../components/documents/UploadForm";
import Sidebar from "../components/chat/Sidebar";
import ChatBox from "../components/chat/ChatBox";
import Boy from "../components/character/Boy";
import { MascotProvider, useMascot } from "../components/auth/MascotContext";
import { getSessions, createSession, deleteSession } from "../api/chatApi";
import "../styles/dashboard.css";

function AdminDashboardContent() {
  const { user, logout } = useAuth();
  const { flash, typed } = useMascot();

  // Navbar View Toggle: "upload" | "chat"
  const [activeTab, setActiveTab] = useState("upload");

  // Document Management State
  const {
    documents = [],
    loading: docsLoading,
    error: docsError,
    uploading,
    uploadDocument,
    deleteDocument,
  } = useDocuments();

  // Chat Session State
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(1);

  async function loadSessions() {
    try {
      const data = await getSessions();
      if (Array.isArray(data) && data.length > 0) {
        setSessions(data);
        setActiveSessionId(data[0].session_id || data[0].id);
      } else {
        handleNewSession();
      }
    } catch {
      setActiveSessionId(1);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleNewSession() {
    try {
      typed();
      const newSess = await createSession();
      const id = newSess.session_id || newSess.id || Date.now() % 100000;
      setSessions((prev) => [newSess, ...prev]);
      setActiveSessionId(id);
      flash("happy", 1500);
    } catch {
      const tempId = Date.now() % 100000;
      setActiveSessionId(tempId);
    }
  }

  async function handleDeleteSession(id) {
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => (s.session_id || s.id) !== id));
      flash("error", 1200);
      if (activeSessionId === id) {
        handleNewSession();
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  }

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    typed();
  };

  return (
    <div className="admin-page-layout">
      {/* Top Navbar with Segmented Toggle */}
      <header className="admin-navbar">
        <div className="navbar-brand">
          <span className="badge-shield">🛡️ Admin Console</span>
          <h1>AI Workspace Admin</h1>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="admin-nav-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "upload" ? "is-active" : ""}`}
            onClick={() => handleTabSwitch("upload")}
          >
            📑 Knowledge Base & Upload
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "chat" ? "is-active" : ""}`}
            onClick={() => handleTabSwitch("chat")}
          >
            💬 Document Assistant
          </button>
        </div>

        <div className="navbar-actions">
          <div className="admin-user-pill">
            <span className="admin-avatar">A</span>
            <span className="admin-email">{user?.email || "admin@workspace.internal"}</span>
          </div>
          <button type="button" className="btn btn--logout-dark" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {/* View 1: Knowledge Base Upload Center */}
      {activeTab === "upload" && (
        <main className="admin-grid-container">
          {docsError && <div className="alert alert--error admin-alert">{docsError}</div>}

          <div className="admin-workspace-grid">
            {/* Upload Box */}
            <section className="admin-card upload-card-wrapper">
              <div className="card-header">
                <h2>Upload Document</h2>
                <span className="card-subtitle">PDFs will be parsed and indexed for RAG vector search</span>
              </div>
              <UploadForm onUpload={uploadDocument} uploading={uploading} />
            </section>

            {/* Document List */}
            <section className="admin-card inventory-card-wrapper">
              <div className="card-header space-between">
                <div>
                  <h2>Document Library</h2>
                  <span className="card-subtitle">Indexed source files for chat citations</span>
                </div>
                <span className="badge-count">{documents.length} Files</span>
              </div>

              {docsLoading ? (
                <div className="admin-loading-state">Loading indexed files...</div>
              ) : documents.length === 0 ? (
                <div className="inventory-empty">
                  <span className="empty-icon">📁</span>
                  <p>No documents uploaded yet</p>
                  <small>Upload a PDF file to enable assistant answers</small>
                </div>
              ) : (
                <ul className="admin-doc-list">
                  {documents.map((doc) => {
                    const docId = doc.id;
                    const name = doc.title || doc.file_name || `Document #${docId}`;
                    return (
                      <li key={docId} className="admin-doc-item">
                        <div className="doc-item-meta">
                          <span className="doc-icon">📄</span>
                          <div className="doc-text">
                            <span className="doc-name" title={name}>{name}</span>
                            <span className="doc-id">ID: #{docId}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="doc-delete-btn"
                          title="Delete document"
                          onClick={() => deleteDocument(docId)}
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </main>
      )}

      {/* View 2: Full Document Chat Assistant with Character Studio */}
      {activeTab === "chat" && (
        <div className="admin-chat-layout">
          <Sidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => {
              setActiveSessionId(id);
              typed();
            }}
            onCreateSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            userEmail={user?.email}
            onLogout={logout}
          />

          <main className="dashboard-main">
            <header className="dashboard-main-header">
              <div>
                <h1>Admin Assistant</h1>
                <span className="session-pill">Session #{activeSessionId}</span>
              </div>
            </header>

            <section className="dashboard-workspace">
              <div className="chat-column">
                <ChatBox key={activeSessionId} activeSessionId={activeSessionId} />
              </div>

              <aside className="companion-studio">
                <div className="studio-card">
                  <span className="studio-label">Active Companion</span>
                  <div className="stage-pedestal">
                    <Boy formDir={-1} active outfit="street" />
                  </div>
                  <div className="studio-info">
                    <p className="studio-name">Buddy & Milo</p>
                    <span className="studio-tip">Testing document citations live</span>
                  </div>
                </div>
              </aside>
            </section>
          </main>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <MascotProvider>
      <AdminDashboardContent />
    </MascotProvider>
  );
}