import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Define an interface for the expected error response
interface ErrorResponse {
  message: string;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/auth/forgot-password", {
        email,
      });
      setMessage("Password reset link sent to your email.");
      setError(null);
      setShowButton(true);
    } catch (error) {
      console.error("Failed to send reset link:", error);
      const axiosError = error as AxiosError;
      const errorMessage = (axiosError.response?.data as ErrorResponse)?.message || "Unknown error";
      setError("Failed to send reset link: " + errorMessage);
      setMessage(null);
      setShowButton(false);
    }
  };

  const handleButtonClick = () => {
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Send Reset Link
          </button>

          {message && (
            <div className="p-3 bg-green-900/50 text-green-400 rounded-md border border-green-800">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-900/50 text-red-400 rounded-md border border-red-800">
              {error}
            </div>
          )}
          {showButton && (
            <button
              type="button"
              onClick={handleButtonClick}
              className="w-full p-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
            >
              Go to Sign In
            </button>
          )}
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-400">
            Remembered your password?{" "}
            <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;