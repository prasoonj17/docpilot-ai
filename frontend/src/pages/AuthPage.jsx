import { useNavigate } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import { useAuth } from "../auth/AuthContext";

export default function AuthPage({ initialMode = "login" }) {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  function handleAuthenticated(data) {
    // 1. Update React state + localStorage synchronously
    const userData = loginUser(data);

    // 2. Strict case-insensitive check
    const isAdmin = userData?.role === "admin";
    const destination = isAdmin ? "/admin" : "/employee";

    navigate(destination, { replace: true });
  }

  return (
    <main className="auth-page">
      <AuthCard
        initialMode={initialMode}
        onAuthenticated={handleAuthenticated}
        onModeChange={(mode) => navigate(`/${mode}`, { replace: true })}
      />
    </main>
  );
}