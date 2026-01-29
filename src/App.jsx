import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import './App.css'
import AccountInformation from "./pages/dashboard/AccountInformation";
import Layout from "./layouts/Layout";
import LoginPage from "./pages/auth/Login";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import { StepProvider } from "./context/StepContext";
import { ProfileProvider } from "./context/ProfileContext";
import Booking from "./pages/dashboard/Booking";
import MyBookings from "./pages/dashboard/MyBookings";
import ReferFriend from "./pages/dashboard/ReferFriend";
import Surveys from "./pages/dashboard/Surveys";
import SurveyDetail from "./pages/dashboard/SurveyDetail";
import NotFound from "./pages/NotFound";
import { FeedbackProvider } from "./context/FeedbackContext";
import { SkillProvider } from "./context/SkillContext";
import SkillDetail from "./components/profile/SkillDetail";

function App() {
  return (
    <StepProvider>
      <ProfileProvider>
        <SkillProvider>
          <FeedbackProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/parent" replace />} />
                  <Route path="/parent" element={<AccountInformation />} />
                  <Route path="/parent/booking" element={<Booking />} />
                  <Route path="/parent/auth/login" element={<LoginPage />} />
                  <Route path="/parent/auth/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/parent/auth/reset-password" element={<ResetPasswordPage />} />
                  <Route path="parent/bookings" element={<MyBookings />} />
                  <Route path="parent/refer" element={<ReferFriend />} />
                  <Route path="parent/surveys" element={<Surveys />} />
                  <Route path="parent/surveys/:id" element={<SurveyDetail />} />
                  <Route path="parent/skills/:id" element={<SkillDetail />} />
                  <Route path="*" element={<NotFound />} />
                  {/* <Route path="/settings" element={<Settings />} /> */}
                </Routes>
              </Layout>
            </BrowserRouter>
          </FeedbackProvider>

        </SkillProvider>
      </ProfileProvider>
    </StepProvider>
  );
}

export default App;
