import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";

const menu = [
  {
    name: "Account Profile",
    path: "/parent",
    icon: "/assets/dashboard.png",
    activeImg: "/assets/dashboard-active.png",
  },
  {
    name: "My Bookings",
    path: "/bookings",
    icon: "/assets/booking.png",
    activeImg: "/assets/booking-active.png",
  },
  {
    name: "Refer a friend",
    path: "/refer",
    icon: "/assets/refer.png",
    activeImg: "/assets/refer-active.png",
  },
  {
    name: "Surveys",
    path: "/surveys",
    icon: "/assets/online-learning.png",
    activeImg: "/assets/online-learning-active.png",
  },
  {
    name: "Settings",
    path: "/settings",
    icon: "/assets/setting-02.png",
    activeImg: "/assets/setting-active.png",
  },
];

const Sidebar = () => {
  return (
    <aside
      className="w-64 min-h-screen text-white bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url('/assets/sidebarBg.png')" }}
    >
      {/* LOGO */}
      <div className="p-6 mt-16">
        <img src="/assets/whiteParentLogo.png" alt="Logo" />
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-[12px] text-[18px] font-semibold transition
              ${isActive ? "bg-[#0DD180]" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? item.activeImg : item.icon}
                  className="w-5"
                  alt=""
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="p-4">
        <button className="p-3 flex items-center gap-3 text-[18px] font-semibold hover:text-red-300">
          <img src="/assets/logout-04.png" alt="" className="w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
