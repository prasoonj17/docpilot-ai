import { useState, useRef, useEffect, useCallback } from "react";
import { useMascot } from "../auth/MascotContext";
import { sendChatMessage } from "../../api/chatApi";

export default function ChatBox({ activeSessionId }) {
  const { setBase, flash, typed } = useMascot();

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! Ask me any questions about our workspace documents.",
      citations: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const idleTimer = useRef(null);
  const typingTimer = useRef(null);

  // 1. Initial entry wave
  useEffect(() => {
    setBase("wave");
    flash("wave", 2800);
    const timer = setTimeout(() => {
      setBase("idle");
    }, 2900);
    return () => clearTimeout(timer);
  }, [setBase, flash]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Inactivity snooze
  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (!loading) {
      idleTimer.current = setTimeout(() => {
        setBase("idle");
      }, 12000);
    }
  }, [loading, setBase]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [resetIdleTimer]);

  // 2. Typing interaction
  const handleInputChange = (e) => {
    setInput(e.target.value);
    setBase("typing");
    typed();

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setBase("idle");
      resetIdleTimer();
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);

    setMessages((prev) => [...prev, { sender: "user", text: query, citations: [] }]);
    setInput("");
    setError("");
    setLoading(true);

    // 3. Thinking pose + excited sprint loop
    setBase("thinking");

    try {
      const data = await sendChatMessage({
        sessionId: activeSessionId,
        question: query,
      });

      const reply = data.answer || "";
      const isUnknown =
        reply.toLowerCase().includes("don't know") ||
        reply.toLowerCase().includes("not found") ||
        reply.toLowerCase().includes("cannot find") ||
        reply.toLowerCase().includes("based on the uploaded documents");

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: reply || "No response received.",
          citations: Array.isArray(data.citations) ? data.citations : [],
        },
      ]);

      // 4. Confused vs Success
      if (isUnknown) {
        setBase("sorry");
        flash("sorry", 3200);
        setTimeout(() => {
          setBase("idle");
          resetIdleTimer();
        }, 3200);
      } else {
        flash("success", 2400);
        setTimeout(() => {
          setBase("idle");
          resetIdleTimer();
        }, 2400);
      }
    } catch (err) {
      setError(err.message || "Failed to retrieve an answer.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I had trouble retrieving that from the documents.",
          citations: [],
        },
      ]);
      setBase("sorry");
      flash("sorry", 3000);
      setTimeout(() => {
        setBase("idle");
        resetIdleTimer();
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-inner-wrap">
      {error && <div className="alert alert--error chat-alert">{error}</div>}

      <div className="chat-window-feed">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${
              msg.sender === "user" ? "chat-bubble--user" : "chat-bubble--bot"
            }`}
          >
            <p className="chat-text">{msg.text}</p>

            {msg.citations && msg.citations.length > 0 && (
              <div className="citations-box">
                <span className="citations-title">Sources:</span>
                <ul>
                  {msg.citations.map((cite, cIdx) => (
                    <li key={cIdx}>
                      📄 <strong>{cite.document}</strong> (Page {cite.page})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-bubble chat-bubble--bot typing">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-bar-dock">
        <input
          type="text"
          placeholder="Ask a question about uploaded documents..."
          value={input}
          onChange={handleInputChange}
          onFocus={() => setBase("typing")}
          onBlur={() => {
            setBase("idle");
            resetIdleTimer();
          }}
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn--send"
        >
          Send
        </button>
      </form>
    </div>
  );
}