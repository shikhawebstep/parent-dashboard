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
function App() {
  return (
    <StepProvider>
      <ProfileProvider>
        <SkillProvider>
          <FeedbackProvider>
            <PhoneInputProvider>
              <BrowserRouter>
              <CommonProvider>

                <Layout>
                  <Routes>
                    <Route path="/" element={<AccountInformation />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/one-to-one-booking" element={<OneToOneBookingForm />} />
                    <Route path="/book-free-trial" element={<BookFreeTrial />} />
                    <Route path="/waiting-list" element={<AddToWaitingList />} />
                    <Route path="/holiday-waiting-list" element={<HolidayWaitingList />} />
                    <Route path="/book-membership" element={<BookMembership />} />
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/auth/set-password" element={<SetPassword />} />
                    <Route path="/bookings" element={<MyBookings />} />
                    <Route path="/refer" element={<ReferFriend />} />
                    <Route path="/surveys" element={<Surveys />} />
                    <Route path="/surveys/:id" element={<SurveyDetail />} />
                    <Route path="/account-information/see-details" element={<Detail />} />
                    <Route path="/skills/:id" element={<SkillDetail />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>

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
