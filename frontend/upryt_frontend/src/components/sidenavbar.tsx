import React, { useState } from "react";
import {
  HomeIcon,
  ChartBarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon ,
  BookOpenIcon,
  ViewfinderCircleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import UprytLogo from '../assets/uprytblue.png'

const links = [
  { name: "Dashboard", icon: <HomeIcon className="w-6 h-6" /> },
  { name: "Posture Scan", icon: <ViewfinderCircleIcon className="w-6 h-6" /> },
  { name: "Analytics", icon: <ChartBarIcon className="w-6 h-6" /> },
  { name: "Learn", icon: <BookOpenIcon className="w-6 h-6" /> },
  { name: "Settings", icon: <Cog6ToothIcon className="w-6 h-6" /> },
];

const SideNavbar = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Format current date
  const dateString = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`flex flex-col h-screen bg-white border-r border-gray-200
      ${collapsed ? "w-20" : "w-64"} duration-300`}>
      
      {/* Top section with logo and date */}
      <div className="flex flex-col items-center p-4 border-b border-gray-200">
        {/* Upryt logo image */}
        <img
          src={UprytLogo}
          alt="Upryt Logo"
          className={`cursor-pointer mb-2 ${
            collapsed ? "w-8 h-8" : "w-24 h-auto"
          }`}
          title="Upryt Logo"
        />

        {/* Current date */}
        {!collapsed && (
          <div className="text-xs text-gray-500 select-none">{dateString}</div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {links.map(({ name, icon }) => (
          <a
            key={name}
            href={`/${name.toLowerCase().replace(" ", "")}`}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-950 hover:bg-blue-100 hover:text-blue-950 cursor-pointer transition-colors"
            title={collapsed ? name : undefined}
          >
            <div className="flex-shrink-0">{icon}</div>
            {!collapsed && <span className="text-sm font-medium">{name}</span>}
          </a>
        ))}
      </nav>

      {/* Bottom logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          className="flex items-center gap-3 w-full text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-md px-3 py-2 transition-colors"
          onClick={() => alert("Logging out...")}
          title={collapsed ? "Logout" : undefined}
        >
          <ArrowLeftOnRectangleIcon  className="w-6 h-6" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-5 left-4 bg-white p-2 hover:bg-blue-100 transition"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Bars3Icon className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  );
};

export default SideNavbar;
