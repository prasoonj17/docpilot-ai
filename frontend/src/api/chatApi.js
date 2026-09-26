import { apiClient } from "./client";

export function getSessions() {
  return apiClient("/chat-session/");
}

export function createSession() {
  return apiClient("/chat-session/", { method: "POST" });
}

export function renameSession(sessionId, title) {
  return apiClient(`/chat-session/${sessionId}`, {
    method: "PUT",
    body: { title },
  });
}

export function deleteSession(sessionId) {
  return apiClient(`/chat-session/${sessionId}`, {
    method: "DELETE",
  });
}

export function sendChatMessage({ sessionId, question, documentIds = null }) {
  return apiClient("/chat/", {
    method: "POST",
    body: {
      session_id: sessionId,
      question,
      document_ids: documentIds,
    },
  });
}