import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/auth/verify-otp", {
        email,
        otp,
      });
      alert("OTP verified successfully!");
      setTimeout(() => {
        navigate("/"); // Redirect to login page
      }, 1000);
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Verification failed. Please check your OTP.");
    }
  };

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:4000/auth/send-otp", {
        email
      });
      setOtpSent(true);
      

    } catch (error) {
      console.error("failed to send otp", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Verify Registered Account</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="button" onClick={handleSendOtp}>
        Send OTP
      </button>{" "}
      {/* Button to send OTP */}
      {otpSent && <p>OTP has been sent to your email!</p> && ( // Conditionally render OTP input if OTP has been sent
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify otp</button>
        </>
      )}
    </form>
  );
};

export default VerifyOtp;
