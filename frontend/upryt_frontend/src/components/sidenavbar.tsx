import React, { useRef, useState, useEffect } from "react";
import {
  HomeIcon,
  ChartBarIcon,
  ViewfinderCircleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import UprytLogo from "../assets/uprytblue.png";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "../components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar";

import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/reducers/userSlice"; // ✅ correct import
import { Link } from "react-router-dom";

const links = [
  { name: "Dashboard", icon: <HomeIcon className="w-6 h-6" /> },
  { name: "Posture Scan", icon: <ViewfinderCircleIcon className="w-6 h-6" /> },
  // { name: "Analytics", icon: <ChartBarIcon className="w-6 h-6" /> },
];

const SideNavbar = () => {
  const dispatch = useDispatch();

  // ✅ Correct slice access
  const user = useSelector((state: any) => state.user.currentUser);

  const [collapsed, setCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const profileRef = useRef(null);

  const profilePictureUrl = user?.profilePictureUrl || "";

  const dateString = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !(profileRef.current as any).contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout()); // ✅ clear Redux state
    // Redirect or clear session manually if needed
    window.location.href = "/login"; // optional redirect
  };

  return (
    <div className={`flex flex-col h-screen bg-white border-r border-gray-200 relative ${collapsed ? "w-20" : "w-64"} duration-300`}>

      {/* Logo and date */}
      <div className="flex flex-col items-center p-4 border-b border-gray-200">
        <img
          src={UprytLogo}
          alt="Upryt Logo"
          className={`cursor-pointer mb-2 ${collapsed ? "w-8 h-8" : "w-24 h-auto"}`}
        />
        {!collapsed && <div className="text-xs text-gray-500 select-none">{dateString}</div>}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {links.map(({ name, icon }) => (
          <a
            key={name}
            href={`/${name.toLowerCase().replace(/\s+/g, '')}`}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-950 hover:bg-blue-100 hover:text-blue-950 cursor-pointer transition-colors"
            title={collapsed ? name : undefined}
          >
            <div className="flex-shrink-0">{icon}</div>
            {!collapsed && <span className="text-sm font-medium">{name}</span>}
          </a>
        ))}
      </nav>

      {/* Profile toggle */}
      <div className="p-4 border-t border-gray-200 relative" ref={profileRef}>
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
          onClick={() => setIsProfileOpen((prev) => !prev)}
        >
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={profilePictureUrl || undefined} alt={user?.fullName} />
            <AvatarFallback>
              {(user?.fullName || "U")
                .split(" ")
                .map((n: any) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>}
        </div>

        {/* Profile dropdown */}
        {isProfileOpen && (
          <div className="absolute bottom-14 left-4 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-50">
            <Link
              to={"/my-profile"}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              My Profile
            </Link>
            <button
              onClick={() => setLogoutDialogOpen(true)}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-5 left-4 bg-white p-2 hover:bg-blue-100 transition"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Bars3Icon className="w-6 h-6 text-gray-600" />
      </button>

      {/* Logout Alert Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>This will end your current session.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SideNavbar;
