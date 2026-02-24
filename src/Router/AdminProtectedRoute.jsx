import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const isAdminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";

  if (!isAdminLoggedIn) {
    return <Navigate to="/register-admin" replace />;
  }

  return children;
}
