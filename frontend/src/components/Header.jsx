import { Bell, User } from "lucide-react";

export default function Header({ title }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5 text-gray-500" />
        <User className="w-7 h-7 text-gray-600" />
      </div>
    </header>
  );
}