import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";
import { FeedbackProvider } from "./context/FeedbackContext";
import { SkillProvider } from "./context/SkillContext";
import SkillDetail from "./components/profile/SkillDetail";
import SetPassword from "./components/auth/SetPassword";
import Detail from "./components/profile/see-details/Detail";
import BookFreeTrial from "./components/booking/BookFreeTrial";
import AddToWaitingList from "./components/booking/AddToWaitingList";
import OneToOneBookingForm from "./components/booking/OneToOneBooking";
import BookMembership from "./components/booking/BookMembership";
import { PhoneInputProvider } from "./context/PhoneInputContext";
import { CommonProvider } from "./context/CommonContext";
import HolidayWaitingList from "./components/booking/HolidayWaitingList";

// Layout wrapper route — renders sidebar + header around its children
function LayoutRoute({ children }) {
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <StepProvider>
      <ProfileProvider>
        <SkillProvider>
          <FeedbackProvider>
            <PhoneInputProvider>
              <BrowserRouter>
                <CommonProvider>
                  <Routes>

                    {/* ── Auth pages — NO sidebar/header ── */}
                    <Route path="/auth/login"           element={<LoginPage />} />
                    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/auth/reset-password"  element={<ResetPasswordPage />} />
                    <Route path="/auth/set-password"    element={<SetPassword />} />

                    {/* ── 404 — NO sidebar/header ── */}
                    <Route path="*" element={<NotFound />} />

                    {/* ── Dashboard routes — WITH sidebar/header via Layout ── */}
                    <Route element={<LayoutRoute><Surveys /></LayoutRoute>} path="/surveys" />
                    <Route element={<LayoutRoute><SurveyDetail /></LayoutRoute>} path="/surveys/:id" />
                    <Route element={<LayoutRoute><AccountInformation /></LayoutRoute>} path="/" />
                    <Route element={<LayoutRoute><Booking /></LayoutRoute>} path="/booking" />
                    <Route element={<LayoutRoute><OneToOneBookingForm /></LayoutRoute>} path="/one-to-one-booking" />
                    <Route element={<LayoutRoute><BookFreeTrial /></LayoutRoute>} path="/book-free-trial" />
                    <Route element={<LayoutRoute><AddToWaitingList /></LayoutRoute>} path="/waiting-list" />
                    <Route element={<LayoutRoute><HolidayWaitingList /></LayoutRoute>} path="/holiday-waiting-list" />
                    <Route element={<LayoutRoute><BookMembership /></LayoutRoute>} path="/book-membership" />
                    <Route element={<LayoutRoute><MyBookings /></LayoutRoute>} path="/bookings" />
                    <Route element={<LayoutRoute><ReferFriend /></LayoutRoute>} path="/refer" />
                    <Route element={<LayoutRoute><Detail /></LayoutRoute>} path="/account-information/see-details" />
                    <Route element={<LayoutRoute><SkillDetail /></LayoutRoute>} path="/skills/:id" />
                    <Route element={<LayoutRoute><Settings /></LayoutRoute>} path="/settings" />

                  </Routes>
                </CommonProvider>
              </BrowserRouter>
            </PhoneInputProvider>
          </FeedbackProvider>
        </SkillProvider>
      </ProfileProvider>
    </StepProvider>
  );
}

export default App;
