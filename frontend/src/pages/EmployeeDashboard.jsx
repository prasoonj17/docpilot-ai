import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/chat/Sidebar";
import ChatBox from "../components/chat/ChatBox";
import Boy from "../components/character/Boy";
import { MascotProvider, useMascot } from "../components/auth/MascotContext";
import { getSessions, createSession, deleteSession } from "../api/chatApi";
import "../styles/dashboard.css";

function DashboardInner() {
  const { user, logoutUser } = useAuth();
  const { flash, typed } = useMascot();
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

  return (
    <div className="dashboard-layout">
      {/* Zone 1: Dark Sidebar */}
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
        onLogout={logoutUser}
      />

      {/* Zone 2: Main Workspace */}
      <main className="dashboard-main">
        <header className="dashboard-main-header">
          <div>
            <h1>Document Assistant</h1>
            <span className="session-pill">Session #{activeSessionId}</span>
          </div>
        </header>

        <section className="dashboard-workspace">
          {/* Centered Chat Feed */}
          <div className="chat-column">
            <ChatBox key={activeSessionId} activeSessionId={activeSessionId} />
          </div>

          {/* Zone 3: Dedicated Companion Deck */}
          <aside className="companion-studio">
            <div className="studio-card">
              <span className="studio-label">Active Companion</span>
              <div className="stage-pedestal">
                <Boy formDir={-1} active outfit="street" />
              </div>
              <div className="studio-info">
                <p className="studio-name">Buddy & Milo</p>
                <span className="studio-tip">Watching your document queries live</span>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default function EmployeeDashboard() {
  return (
    <MascotProvider>
      <DashboardInner />
    </MascotProvider>
  );
}