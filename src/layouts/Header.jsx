
import { Menu, User, Settings, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { showConfirm, showSuccess } from "../../utils/swalHelper";
import NotificationPopup, { notificationsData } from "../components/NotificationPopup";
const Header = ({ onMenuClick }) => {
  const [dateTime, setDateTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notificationsData.reduce((acc, group) => {
    return acc + group.items.filter(item => item.unread).length;
  }, 0);

  const parentData = JSON.parse(localStorage.getItem("parentData"));
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    showConfirm("Are you sure?", "You want to logout?", "Yes, logout!").then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("parentToken");
        navigate("/parent/auth/login");
        showSuccess("Logged Out!", "You have been logged out.");
      }
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <header className="w-full bg-white border-b shadow-[rgba(0,0,0,0.1)_0px_5px_7px_-5px,_rgba(0,0,0,0.04)_0px_3px_10px_-5px]">
      <div className="w-full px-6 py-4 pt-[20px] 2xl:pt-[40px] pb-[20px] flex items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-[#fff]"
            onClick={onMenuClick}
          >
            <Menu size={28} />
          </button>

          <div className="hidden lg:block">
            <p className="text-[18px] lg:text-[26px] font-medium text-[#282829] m-0">Hi {parentData?.firstName && parentData?.lastName ? `${parentData.firstName} ${parentData.lastName}` : parentData?.email || "N/A"}</p>
            <h1 className="text-[24px] lg:text-[36px] m-0 font-semibold text-gray-900 leading-tight">
              Account Information
            </h1>
          </div>
        </div>
        <img src="/assets/whiteParentLogo.png" alt="" className="block lg:hidden max-w-[200px]" />

        {/* Right Section */}
        <div className="flex items-center 2xl:gap-8 gap-3">

          {/* Back Button */}
          <button className="bg-[#00A6E3] hidden lg:block  hover:bg-sky-600 text-white 2xl:px-6 px-3 glory py-3 rounded-full 2xl:text-[18px] text-[16px] font-semibold transition">
            Go back to the website
          </button>

          {/* Notification */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative hidden lg:flex border rounded-full 2xl:h-[54px] 2xl:w-[54px] h-[40px] w-[40px] items-center justify-center transition-all ${isNotificationOpen ? 'bg-[#00A6E3] border-[#00A6E3]' : 'border-[#E2E1E5]'}`}
            >
              <img src="/assets/notification-02.png" alt="notification"
                className={`2xl:w-6 2xl:h-6 w-4 h-4 transition-all ${isNotificationOpen ? 'brightness-0 invert' : 'text-gray-600'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && <NotificationPopup />}
          </div>

          {/* Date */}
          <div className="text-right text-sm text-gray-600 hidden lg:block">
            <p className="font-semibold 2xl:text-[18px] text-[16px] text-gray-900">
              {dateTime.toLocaleDateString("en-US", { weekday: "long" })}
            </p>
            <p className="text-[14px] font-semibold text-[#717073]">
              {dateTime.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}


            </p>
          </div>

          {/* Profile */}
          <div
            className="relative flex items-center gap-2 cursor-pointer lg:border-l border-[#E2E1E5] lg:ps-5"
            ref={dropdownRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img
              src="/assets/user.png"
              alt="User"
              className="w-[52px] lg:h-[52px] rounded-full object-cover"
            />
            <span className="2xl:text-[18px] text-[14px] hidden lg:block  font-semibold text-[#282829]">
              {parentData?.firstName && parentData?.lastName
                ? `${parentData.firstName} ${parentData.lastName}`
                : parentData?.email || "N/A"}
            </span>
            <img
              src="/assets/Arrows-down.png"
              alt="notification"
              className={`w-4 hidden lg:block text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-4 w-60 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1 lg:hidden">
                    <p className="font-semibold text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">parent@example.com</p>
                  </div>

                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-slate-50 hover:text-[#00A6E3] rounded-xl transition-all group">
                      <div className="p-2 bg-gray-50 text-gray-500 group-hover:bg-[#00A6E3]/10 group-hover:text-[#00A6E3] rounded-lg transition-colors">
                        <User size={18} />
                      </div>
                      My Profile
                    </button>

                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-slate-50 hover:text-[#00A6E3] rounded-xl transition-all group">
                      <div className="p-2 bg-gray-50 text-gray-500 group-hover:bg-[#00A6E3]/10 group-hover:text-[#00A6E3] rounded-lg transition-colors">
                        <Settings size={18} />
                      </div>
                      Settings
                    </button>
                  </div>

                  <div className="h-px bg-gray-100 my-2" />

                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all group">
                    <div className="p-2 bg-red-50 text-red-500 group-hover:bg-red-100 rounded-lg transition-colors">
                      <LogOut size={18} />
                    </div>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
