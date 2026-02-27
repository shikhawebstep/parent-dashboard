import { NavLink } from "react-router-dom";
import { X, ChevronDown, Bell, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showConfirm, showSuccess } from "../../utils/swalHelper";

// Reusing the same menu items from Sidebar
const menu = [
    {
        name: "Account Profile",
        path: "/",
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
const parentData = JSON.parse(localStorage.getItem("parentData"));

const MobileMenu = ({ isOpen, onClose }) => {
    const [dateTime, setDateTime] = useState(new Date());
    const navigate = useNavigate();

    const handleLogout = () => {
        onClose(); // Close mobile menu first
        showConfirm("Are you sure?", "You want to logout?", "Yes, logout!").then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("parentToken");
                navigate("/auth/login");
                showSuccess("Logged Out!", "You have been logged out.");
            }
        });
    };

    useEffect(() => {
        if (!isOpen) return; // Only run timer when menu is open
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    return (
        <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"}`}>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Menu Container */}
            <div
                className={`relative w-[85%] max-w-[320px] h-full bg-[#0056B3] text-white flex flex-col p-6 overflow-y-auto transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{
                    backgroundImage: "url('/assets/sidebarBg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                {/* Header: Title + Close Button */}
                <div className="flex justify-end items-center mb-6">
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                {/* Date Section */}
                <div className="mb-6">
                    <p className="text-[18px] font-semibold">
                        {dateTime.toLocaleDateString("en-US", { weekday: "long" })}
                    </p>
                    <p className="text-[14px] font-medium">
                        {dateTime.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}{" "}
                        |{" "}
                        {dateTime.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                        })}
                    </p>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 mb-8">
                    <img
                        src="/assets/user.png"
                        alt="John Doe"
                        className="w-12 h-12 rounded-full border-2 border-white object-cover"
                    />
                    <span className="text-[18px] font-bold">{parentData?.firstName && parentData?.lastName
                        ? `${parentData.firstName} ${parentData.lastName}`
                        : parentData?.email || "N/A"}</span>
                </div>

                {/* Menu Links */}
                <nav className="flex-1  space-y-1">
                    {menu.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end
                            onClick={onClose}
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

                {/* Action Buttons */}
                <div className="space-y-4 mb-8 mt-3">
                    <button className="w-full bg-white text-[#002855] font-bold py-3 rounded-full flex items-center justify-center gap-2">
                        <Bell size={20} />
                        Notifications
                    </button>
                    <button className="w-full bg-[#00A6E3] hover:bg-[#0095CC] text-white font-bold py-3 rounded-full">
                        Go back to the website
                    </button>
                </div>

                {/* Logout */}
                <button onClick={handleLogout} className="flex items-center gap-2 font-semibold text-white/90 hover:text-white mt-auto">
                    <img src="/assets/logout-04.png" alt="" className="w-5 brightness-200" />
                    Logout
                </button>

            </div>
        </div>
    );
};

export default MobileMenu;
