import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // Get email from state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("OTP:", otp);

    try {
      const response = await axios.post(
        "http://localhost:4000/auth/verify-2fa-otp",
        {
          email,
          otp,
          purpose: "login",
        }
      );
      // Store tokens in local storage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      console.log("Access Token:", response.data.accessToken);
      console.log("Refresh Token:", response.data.refreshToken);
      Swal.fire({
        icon: 'success',
        title: 'OTP verified successfully!',
        confirmButtonText: 'OK',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/home');
        }
      });
      //navigate("/home"); // Redirect to home after successful verification
    } catch (error: unknown) {
      const axiosError = error as AxiosError; // Type assertion
      console.error("Verification failed:", axiosError.response?.data);
      Swal.fire({
        icon: 'success',
        title: 'Verification failed. Please check your OTP.',
        confirmButtonText: 'OK',
      })

    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen border-amber-100">
      <div className="p-8 border-2 border-teal-700 shadow-[2px_2px_rgba(0,_98,_90,_0.4),_5px_5px_rgba(0,_98,_90,_0.4),_10px_10px_rgba(0,_98,_90,_0.3),_15px_15px_rgba(0,_98,_90,_0.2),_20px_20px_rgba(0,_98,_90,_0.1),_25px_25px_rgba(0,_98,_90,_0.05)] rounded-lg  w-96">
        <h2 className="text-2xl font-semibold text-center mb-2">Enter verification code</h2>
        <p className="text-sm text-center text-gray-500 mb-4">Type or paste the 6-digit code sent to your email inbox.</p>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 ">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="h-12 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Verify
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-500">Didn't receive the code? <a href="#" className="text-blue-600">Resend</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
