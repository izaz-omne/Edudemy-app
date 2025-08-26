import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI, usersAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token && !user) {
        try {
          const userData = await usersAPI.getCurrentUser();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [user]);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ username, password });
      
      const { access_token, user: userData } = response;
      
      // Store token and user data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Navigate based on role
      const redirectPath = getRedirectPath(userData.role);
      navigate(redirectPath, { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    if (location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  };

  const getRedirectPath = (role) => {
    switch (role) {
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
        return '/dashboard';
    }
  };

  const isAdmin = () => {
    return ['superadmin', 'admin'].includes(user?.role);
  };

  const isTeacher = () => {
    return user?.role === 'teacher';
  };

  const isStudent = () => {
    return user?.role === 'student';
  };

  const isManagement = () => {
    return ['superadmin', 'admin', 'management'].includes(user?.role);
  };

  const isAcademics = () => {
    return ['superadmin', 'admin', 'academics'].includes(user?.role);
  };

  const isSuperAdmin = () => {
    return user?.role === 'superadmin';
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user && !!localStorage.getItem('access_token'), 
      login, 
      logout,
      loading,
      isAdmin,
      isTeacher,
      isStudent,
      isManagement,
      isAcademics,
      isSuperAdmin,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
