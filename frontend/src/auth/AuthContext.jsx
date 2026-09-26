import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Decodes JWT payload without external libraries
function decodeToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app refresh
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  function loginUser(authResponse) {
    const token =
      authResponse.token ||
      authResponse.access_token ||
      authResponse.data?.token ||
      authResponse.data?.access_token;

    // Decode token claims if present
    const claims = decodeToken(token) || {};

    // 1. Resolve raw role from response body OR token payload
    const rawRole =
      authResponse.role ||
      authResponse.user?.role ||
      authResponse.data?.role ||
      authResponse.data?.user?.role ||
      claims.role ||
      claims.user_role ||
      (authResponse.is_admin || claims.is_admin || claims.is_superuser ? "admin" : null) ||
      "employee";

    // 2. Normalize to lowercase string ("Admin" -> "admin")
    const normalizedRole = String(rawRole).trim().toLowerCase();

    // 3. Resolve user email
    const email =
      authResponse.email ||
      authResponse.user?.email ||
      authResponse.data?.email ||
      claims.sub ||
      claims.email ||
      "";

    const userData = {
      role: normalizedRole,
      email,
    };

    if (token) localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    return userData;
  }

  function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        loginUser,
        logoutUser,
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}