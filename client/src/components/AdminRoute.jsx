import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Blocks non-admin users — redirects to home
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
