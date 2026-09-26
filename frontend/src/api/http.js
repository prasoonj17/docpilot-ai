import { API_BASE_URL } from "../config";
import { getToken } from "../utils/token";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// FastAPI returns { detail: "text" } for HTTPException
// and { detail: [{ msg, loc, ... }] } for 422 validation errors.
function extractMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    const msgs = data.detail
      .map((d) => d?.msg?.replace(/^Value error, /, ""))
      .filter(Boolean);
    if (msgs.length) return msgs.join(". ");
  }
  if (typeof data.message === "string") return data.message;
  return fallback;
}

export async function request(path, { method = "GET", body, signal } = {}) {
  const token = getToken();
  let res;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new ApiError(
      "Can't reach the server. Check that the backend is running.",
      0
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    throw new ApiError(
      extractMessage(data, "Something went wrong. Try again."),
      res.status,
      data
    );
  }
  return data;
}
