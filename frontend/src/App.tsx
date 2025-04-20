import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import "./App.css";
import Profile from "./components/Profile";
import ResetPassword from "./components/ResetPassword";
import VerifyOtp from "./components/VerifyOtp";
import ForgotPassword from "./components/ForgotPassword";
import TwoFALogin from "./components/TwoFALogin";
import Settings from "./components/Settings";
import UserManagement from "./components/UserManagement";
import OAuthCallback from "./components/OAuthCallback";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth/google/callback" element={<OAuthCallback />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/two-fa-login" element={<TwoFALogin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/forgot-Password" element={<ForgotPassword />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
