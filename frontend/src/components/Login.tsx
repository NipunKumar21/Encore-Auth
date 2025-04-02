import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/auth/login", {
        email,
        password,
      });
      console.log("Logged in:", response.data);
      // Store tokens in local storage or context
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      // Log expiration details
      const accessPayload = JSON.parse(
        atob(response.data.accessToken.split(".")[1])
      );
      const refreshPayload = JSON.parse(
        atob(response.data.refreshToken.split(".")[1])
      );

      console.log(
        "Access Token Expiration:",
        new Date(accessPayload.exp * 1000).toString()
      );
      console.log(
        "Refresh Token Expiration:",
        new Date(refreshPayload.exp * 1000).toString()
      );

      navigate("/home"); // Redirect to homepage
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen ">
      <div className=" p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-white mb-1">
              Email ID
            </label>
            <input
              type="email"
              id="login-email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <label htmlFor="login-password" className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="login-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              
            />
            <span
              onClick={() =>{ setShowPassword(!showPassword);
                setTimeout(() => {
                  setShowPassword(false);
                }, 1000);
              }}
              className="absolute right-3 top-17 transform -translate-y-1/2 cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
          <Link to="/forgot-Password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div className="mt-6">
          <h3 className="text-center mb-4">Or</h3>
          <button className="w-full flex items-center justify-center mb-4 p-2 border rounded-md shadow-sm hover:bg-gray-50">
            <img
              className="mr-2 h-5"
              src="https://static.cdnlogo.com/logos/g/35/google-icon.svg"
              alt="Google Icon"
            />
            Log in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
