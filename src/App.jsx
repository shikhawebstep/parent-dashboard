import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'
import AccountInformation from "./components/dashboard/profile/AccountInformation";
import Layout from "./components/dashboard/common/pages/Layout";
import LoginPage from "./components/admin/pages/LoginPage";
import { StepProvider } from "./components/dashboard/profile/booking/context/StepContext";
import Booking from "./components/dashboard/profile/booking/Booking";

function App() {
  return (
    <StepProvider>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/parent" element={<AccountInformation />} />
          <Route path="/parent/booking" element={<Booking />} />
          <Route path="/parent/login" element={<LoginPage />} />
          {/* <Route path="/bookings" element={<MyBookings />} />
          <Route path="/refer" element={<ReferFriend />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/settings" element={<Settings />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>

    </StepProvider>
  );
}

export default App;
