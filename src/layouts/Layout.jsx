import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import OnboardingTour from "../components/OnboardingTour";

const Layout = ({ children }) => {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-gray-100">
      {location.pathname !== "/parent/login" && <Sidebar />}
      <main className="flex-1 2xl:w-[85%] lg:w-[80%] ">
        {location.pathname !== "/parent/login" && <Header />}
        {children}
        <OnboardingTour />
      </main>
    </div>
  );
};

export default Layout; 
