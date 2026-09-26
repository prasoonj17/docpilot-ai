import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import api from "./api";

const AuthContext = createContext(null);

// Reads the token out of localStorage and decodes it into a user object.
// Your backend already puts { user_id, email, role, exp } in the JWT payload
// (see /user/me), so we don't need a separate call just to know the role.
function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    // exp is in seconds since epoch; Date.now() is ms
    if (payload.exp * 1000 < Date.now()) {
      return null; // token expired
    }
    return payload; // { user_id, email, role, exp }
  } catch (err) {
    return null; // malformed token
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => decodeToken(localStorage.getItem("token")));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep state in sync if the token is changed/removed in another tab
  useEffect(() => {
    const onStorage = () => setUser(decodeToken(localStorage.getItem("token")));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      // Adjust the endpoint/body shape to match your actual login route
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.access_token;
      localStorage.setItem("token", token);
      const decoded = decodeToken(token);
      setUser(decoded);
      return decoded; // caller can redirect based on decoded.role
    } catch (err) {
      const message = err.response?.data?.detail || "Login failed. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  // Use this when some OTHER function already called the login API
  // (e.g. your api/authApi.js) and you just need AuthContext to store
  // the resulting token and pick up the decoded role/user from it.
  function loginWithToken(token) {
    localStorage.setItem("token", token);
    const decoded = decodeToken(token);
    setUser(decoded);
    return decoded; // caller can redirect based on decoded.role
  }

  const value = useMemo(
    () => ({
      user,               // { user_id, email, role, exp } or null
      role: user?.role ?? null,
      isAuthenticated: !!user,
      loading,
      error,
      login,
      loginWithToken,
      logout,
    }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an <AuthProvider>");
  return ctx;
}