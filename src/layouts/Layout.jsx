import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import OnboardingTour from "../components/OnboardingTour";
import MobileMenu from "./MobileMenu";
import HeaderBanner from "./HeaderBanner";
import Middleware from "./Middleware";

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔒 Login & Forgot Password (No Middleware, No Sidebar/Header)
  if (location.pathname === "/auth/login" || location.pathname === "/auth/forgot-password") {
    return (
      <div className="flex containerMain min-h-screen bg-gray-100">
        <main className="flex-1 w-full bg-white xl:bg-transparent">
          {children}
        </main>
      </div>
    );
  }

  // 🛡️ Protected Pages (Wrapped in Middleware)
  return (
    <Middleware>
      <div className="flex containerMain min-h-screen bg-gray-100">
        <Sidebar />

        {/* Mobile Menu Overlay */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        <main className="flex-1 w-full lg:w-[80%] 2xl:w-[85%] w-full bg-white xl:bg-transparent">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
          <div className="block lg:hidden md:p-6 p-4 pb-0">
            <HeaderBanner />
          </div>
          {children}
          <OnboardingTour />
        </main>
      </div>
    </Middleware>
  );
};

export default Layout; 
