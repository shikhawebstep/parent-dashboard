import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import OnboardingTour from "../OnboardingTour";

const Layout = ({ children }) => {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-gray-100">
      {location.pathname !== "/parent/login" && <Sidebar />}
      <main className="flex-1">
        {location.pathname !== "/parent/login" && <Header />}
        {children}
        <OnboardingTour />
      </main>
    </div>
  );
};

export default Layout; 
