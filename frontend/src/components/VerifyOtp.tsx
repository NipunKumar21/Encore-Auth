import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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
      Swal.fire({
        icon: 'success',
        title: 'OTP verified successfully!',
        confirmButtonText: 'OK',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/');
        }
      });

    } catch (error) {
      console.error("Verification failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'OTP Verification failed',
        text:'Please check your OTP.',
        confirmButtonText: 'OK',
      })
    }
  };

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:4000/auth/send-otp", {
        email
      });
      setOtpSent(true);
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent',
        text: 'OTP has been sent to your email!',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error("failed to send otp", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to send OTP',
        text: 'Please try again later.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Registered Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4 border-2 border-teal-700 shadow-[2px_2px_rgba(0,_98,_90,_0.4),_5px_5px_rgba(0,_98,_90,_0.4),_10px_10px_rgba(0,_98,_90,_0.3),_15px_15px_rgba(0,_98,_90,_0.2),_20px_20px_rgba(0,_98,_90,_0.1),_25px_25px_rgba(0,_98,_90,_0.05)] rounded-lg p-6">
          <div>
            <label
              htmlFor="verify-email"
              className="block text-sm font-medium text-white mb-1"
            >
              Email ID
            </label>
            <input
              type="email"
              id="verify-email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button 
            type="button" 
            onClick={handleSendOtp}
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Send OTP
          </button>
          
          {otpSent && (
            <>
              <div>
                <label
                  htmlFor="verify-otp"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="verify-otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                type="submit"
                className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Verify OTP
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
