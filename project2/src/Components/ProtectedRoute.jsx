import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const isloggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");

  if (!isloggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If user is not authorized for this role, redirect to their dashboard or home
    // For a student trying to access mentor dashboard:
    const username = localStorage.getItem("username");
    if (userRole === 'student') {
      return <Navigate to={`/dashboard/${username}`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
export default ProtectedRoute;
