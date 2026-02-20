import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  MdOutlineAccessTime,
  MdOutlineDashboard,
  MdOutlineEventBusy,
  MdOutlineFactCheck,
  MdOutlineSchedule,
  MdPeopleOutline,
} from "react-icons/md";
import { FiLogOut, FiChevronRight } from "react-icons/fi";
import logo from "../Assets/logo.jpg";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { name: "Dashboard",    path: "/",          icon: MdOutlineDashboard,  roles: ["admin"] },
  { name: "Users",        path: "/users",     icon: MdPeopleOutline,     roles: ["admin"] },
  { name: "Check-in Logs",path: "/checkins",  icon: MdOutlineAccessTime, roles: ["admin"] },
  { name: "Shifts",       path: "/shifts",    icon: MdOutlineSchedule,   roles: ["admin"] },
  { name: "Attendance",   path: "/attendance",icon: MdOutlineFactCheck,  roles: ["admin"] },
  { name: "Leaves",       path: "/leaves",    icon: MdOutlineEventBusy,  roles: ["admin"] },
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  // Get initials from user name
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  return (
    <>
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 flex flex-col
          bg-white border-r border-gray-100 shadow-xl
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* ── Logo area ── */}
        <div className="flex items-center justify-center px-5 py-4 border-b border-gray-100 shrink-0">
          <img src={logo} alt="Logo" className="h-24 w-auto object-cover" />
        </div>

        {/* ── User profile chip ── */}
        <div className="mx-4 mt-4 mb-2 px-3 py-3 rounded-2xl bg-indigo-50 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 text-white text-xs font-bold flex items-center justify-center shadow-sm shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {user?.name || "Admin"}
            </p>
            <p className="text-[11px] text-indigo-500 font-medium capitalize">{user?.role || "admin"}</p>
          </div>
        </div>

        {/* ── Section label ── */}
        <p className="px-6 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Main Menu
        </p>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {filteredMenu.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
              className={({ isActive }) => `
                group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-150
                ${isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Active left accent bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white/40" />
                  )}

                  <Icon
                    className={`text-[19px] shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-500"
                    }`}
                  />

                  <span className="flex-1">{name}</span>

                  {isActive && (
                    <FiChevronRight className="text-white/60 text-sm" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Logout ── */}
        <div className="px-3 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={logout}
            className="
              group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-sm font-medium text-gray-500
              hover:bg-red-50 hover:text-red-500 transition-all
            "
          >
            <FiLogOut className="text-[17px] group-hover:text-red-500 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;