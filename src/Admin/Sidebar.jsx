import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  MdOutlineAccessTime,
  MdOutlineDashboard,
  MdOutlineEventBusy,
  MdOutlineFactCheck,
  MdOutlineSchedule,
  MdPeopleOutline,
} from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import logo from "../Assets/logo.jpg";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: MdOutlineDashboard,
      roles: ["admin"],
    },
    {
      name: "Users",
      path: "/users",
      icon: MdPeopleOutline,
      roles: ["admin"],
    },
    {
  name: "Check-in Logs",
  path: "/checkins",
  icon: MdOutlineAccessTime,
  roles: ["admin"],
},
{
  name: "Shifts",
  path: "/shifts",
  icon: MdOutlineSchedule,
  roles: ["admin"],
},
{
  name: "Attendance",
  path: "/attendance",
  icon: MdOutlineFactCheck,
  roles: ["admin"],
}
,
{
  name: "Leaves",
  path: "/leaves",
  icon: MdOutlineEventBusy,
  roles: ["admin"],
}



  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-xl transition-transform
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-0 flex justify-center border-b">
          <img src={logo} alt="Logo" className="w-56" />
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {filteredMenu.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium
                ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                }`
              }
            >
              <Icon className="text-xl" />
              {name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
