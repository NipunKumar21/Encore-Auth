import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { Eye,EyeOff } from "lucide-react";

// Define an interface for the expected error response
interface ErrorResponse {
  message: string;
}

const ResetPassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await axios.post("http://localhost:4000/auth/reset-password", {
        email,
        oldPassword,
        newPassword: password,
        otp,
      });
      setMessage("Password reset successfully!");
      setError(null);
      setShowButton(true);
    } catch (error) {
      console.error("Password reset failed:", error);
      const axiosError = error as AxiosError; // Cast to AxiosError
      const errorMessage = (axiosError.response?.data as ErrorResponse)?.message || "Unknown error"; // Use the defined interface
      setError("Password reset failed: " + errorMessage);
      setMessage(null);
      setShowButton(false);
    }
  };

  const handleButtonClick = () => {
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />
      {/* old password */}
      <div className="passwordContainer">
        <input
          type={showOldPassword ? "text" : "password"}
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <span
          id="toggleVisibility"
          onClick={() => {
            setShowOldPassword(!showOldPassword);
            setTimeout(() => {
              setShowOldPassword(false);
            }, 1000);
          }}
          className="toggle-password"
        >
          {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>

      {/* new password */}
      <div className="passwordContainer">
        <input  
          type={showNewPassword ? "text" : "password"}
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span
          id="toggleVisibility"
          onClick={() => {
            setShowNewPassword(!showNewPassword);
            setTimeout(() => {
              setShowNewPassword(false);
            }, 1000);
          }}
          className="toggle-password"
        >
          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>
      
      {/* confirm password */}
      <div className="passwordContainer">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <span
          id="toggleVisibility"
          onClick={() => {
            setShowConfirmPassword(!showConfirmPassword);
            setTimeout(() => {
              setShowConfirmPassword(false);
            }, 1000);
          }}
          className="toggle-password"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>

      <button type="submit">Reset Password</button>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      {showButton && (
        <button type="button" onClick={handleButtonClick}>
          Go to Sign up 
        </button>
      )}
    </form>
  );
};

export default ResetPassword;