import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useMascot } from "../auth/MascotContext";
import { listSessions, createSession, sendMessage } from "../../api/chat";
import DocumentPanel from "../documents/DocumentPanel";
import Boy from "../character/Boy";

export default function ChatInterface() {
  const { user, isAdmin, logout } = useAuth();
  const { setMood } = useMascot();

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [documents, setDocuments] = useState([]);
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    listSessions().then((data) => {
      if (Array.isArray(data) && data.length) {
        setSessions(data);
        setActiveSessionId(data[0].id);
      }
    });
  }, []);

  const handleCreateSession = async () => {
    const newSession = await createSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isReplying) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);

    setIsReplying(true);
    setMood("loading"); // Dog runs laps while inference runs

    try {
      const response = await sendMessage({
        session_id: activeSessionId,
        question: userText,
        document_ids: documents.map((d) => d.id),
      });

      setMessages((prev) => [...prev, { role: "assistant", text: response.answer || response.text }]);
      setMood("happy");
    } catch {
      setMood("error"); // Dog barks if model generation fails
      setMessages((prev) => [...prev, { role: "assistant", text: "Error fetching answer." }]);
    } finally {
      setIsReplying(false);
      setTimeout(() => setMood("idle"), 3000); // Returns to sleep
    }
  };

  return (
    <div className="workspace-layout">
      {/* 1. Admin-Only Document Sidebar */}
      {isAdmin && (
        <DocumentPanel
          documents={documents}
          onRefresh={() => {/* fetch and setDocuments */}}
        />
      )}

      {/* 2. Main Chat Engine */}
      <section className="chat-viewport">
        <header className="chat-header">
          <div>
            <h2>{isAdmin ? "Admin Knowledge Workspace" : "Employee Assistant"}</h2>
            <p>Logged in as: <strong>{user?.email}</strong> ({user?.role})</p>
          </div>
          <button className="btn btn--ghost" onClick={logout}>Sign Out</button>
        </header>

        <div className="messages-flow">
          {messages.map((m, idx) => (
            <div key={idx} className={`msg-bubble msg-bubble--${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>

        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            placeholder="Ask a question about uploaded documents..."
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setMood("typing")} // Dog wakes up and watches
            onBlur={() => !isReplying && setMood("idle")} // Dog goes back to sleep
          />
          <button type="submit" className="btn" disabled={isReplying}>
            Send
          </button>
        </form>
      </section>

      {/* 3. Interactive Mascot Station */}
      <aside className="mascot-dock">
        <Boy formDir={-1} active={true} outfit={isAdmin ? "street" : "olive"} />
      </aside>
    </div>
  );
}