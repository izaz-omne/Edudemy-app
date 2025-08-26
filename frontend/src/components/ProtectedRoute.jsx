import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ requireRole }) {
  const { isAuthenticated, user, hasRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requireRole && !hasRole(requireRole)) {
    // Role mismatch → send to their home dashboard
    const getHomePath = () => {
      switch (user?.role) {
        case 'superadmin':
        case 'admin':
          return '/admin';
        case 'management':
          return '/management';
        case 'academics':
          return '/academics';
        case 'teacher':
          return '/teacher';
        case 'student':
          return '/student';
        default:
          return '/login';
      }
    };
    
    return <Navigate to={getHomePath()} replace />;
  }
  
  return <Outlet />;
}
