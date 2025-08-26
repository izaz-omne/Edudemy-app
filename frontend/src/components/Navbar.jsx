import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-3 py-1 rounded hover:bg-blue-500/20 ${
        pathname === to ? "bg-blue-500/20 font-semibold" : ""
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">EduDemy</span>
        {user?.role === "admin" && (
          <>
            <NavLink to="/admin">Dashboard</NavLink>
            <NavLink to="/students">Students</NavLink>
            <NavLink to="/batches">Batches</NavLink>
            <NavLink to="/teachers">Teachers</NavLink>
          </>
        )}
        {user?.role === "teacher" && (
          <>
            <NavLink to="/teacher">Dashboard</NavLink>
            <NavLink to="/classes">My Classes</NavLink>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm opacity-90">Hi, {user?.username}</span>
        <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
          Logout
        </button>
      </div>
    </nav>
  );
}
