import { Link } from "react-router-dom";
import { LayoutDashboard, Users, GraduationCap, BookOpen } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-blue-700 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-8">EduDemy</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 hover:text-yellow-300">
          <LayoutDashboard /> Dashboard
        </Link>
        <Link to="/students" className="flex items-center gap-2 hover:text-yellow-300">
          <GraduationCap /> Students
        </Link>
        <Link to="/teachers" className="flex items-center gap-2 hover:text-yellow-300">
          <BookOpen /> Teachers
        </Link>
        <Link to="/management" className="flex items-center gap-2 hover:text-yellow-300">
          <Users /> Management
        </Link>
      </nav>
    </aside>
  );
}