import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Blocks unauthenticated users — redirects to /login
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // Wait for auth check to finish

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
