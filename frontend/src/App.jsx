import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import AuthPage from "./pages/AuthPage";           // your login/signup flip card
import AdminDashboard from "./pages/AdminDashboard"; // step 2: upload + file list
import EmployeeDashboard from "./pages/EmployeeDashboard"; // step 3: chat UI
import Unauthorized from "./pages/Unauthorized";
import "./styles/theme.css";
import "./styles/auth.css";
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/signup" element={<AuthPage initialMode="signup" />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={["admin", "employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* default: send people to login; ProtectedRoute + login handler
              take care of sending them to the right dashboard */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}