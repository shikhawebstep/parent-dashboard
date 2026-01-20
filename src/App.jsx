import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'
import AccountInformation from "./pages/dashboard/AccountInformation";
import Layout from "./layouts/Layout";
import LoginPage from "./pages/auth/Login";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import { StepProvider } from "./context/StepContext";
import Booking from "./pages/dashboard/Booking";
import MyBookings from "./pages/dashboard/MyBookings";
import ReferFriend from "./pages/dashboard/ReferFriend";
import Surveys from "./pages/dashboard/Surveys";
import SurveyDetail from "./pages/dashboard/SurveyDetail";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <StepProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/parent" element={<AccountInformation />} />
            <Route path="/parent/booking" element={<Booking />} />
            <Route path="/parent/auth/login" element={<LoginPage />} />
            <Route path="/parent/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="parent/bookings" element={<MyBookings />} />
            <Route path="parent/refer" element={<ReferFriend />} />
            <Route path="parent/surveys" element={<Surveys />} />
            <Route path="parent/surveys/:id" element={<SurveyDetail />} />
            <Route path="*" element={<NotFound />} />
            {/* <Route path="/settings" element={<Settings />} /> */}
          </Routes>
        </Layout>
      </BrowserRouter>

    </StepProvider>
  );
}

export default App;
