import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'
import AccountInformation from "./pages/dashboard/AccountInformation";
import Layout from "./layouts/Layout";
import LoginPage from "./pages/auth/Login";
import { StepProvider } from "./context/StepContext";
import Booking from "./pages/dashboard/Booking";
import MyBookings from "./pages/dashboard/MyBookings";
import ReferFriend from "./pages/dashboard/ReferFriend";
import Surveys from "./pages/dashboard/Surveys";
import SurveyDetail from "./pages/dashboard/SurveyDetail";

function App() {
  return (
    <StepProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/parent" element={<AccountInformation />} />
            <Route path="/parent/booking" element={<Booking />} />
            <Route path="/parent/login" element={<LoginPage />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/refer" element={<ReferFriend />} />
            <Route path="/surveys" element={<Surveys />} />
            <Route path="/surveys/:id" element={<SurveyDetail />} />
            {/* <Route path="/settings" element={<Settings />} /> */}
          </Routes>
        </Layout>
      </BrowserRouter>

    </StepProvider>
  );
}

export default App;
