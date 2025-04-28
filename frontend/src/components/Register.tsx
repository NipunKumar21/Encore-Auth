import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [role] = useState("user");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/auth/register", {
        email,
        password,
        role,
      });
      console.log("Registered:", response.data);
      //Message("Registration successful!");
      setError(null);
      Swal.fire({
        icon: 'success',
        title: 'Registration successful!',
        confirmButtonText: 'OK',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/verify-otp");
        }
      });
      // setTimeout(() => {
      //   navigate("/verify-otp");
      // }, 1000);
    } catch (error) {
      console.error("Registration failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Registration failed. Please try again',
        confirmButtonText: 'OK',
      })
      // setError("Registration failed. Please try again.");
      
      setMessage(null);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen ">
      <div className=" p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4 border-2 border-teal-700 shadow-[2px_2px_rgba(0,_98,_90,_0.4),_5px_5px_rgba(0,_98,_90,_0.4),_10px_10px_rgba(0,_98,_90,_0.3),_15px_15px_rgba(0,_98,_90,_0.2),_20px_20px_rgba(0,_98,_90,_0.1),_25px_25px_rgba(0,_98,_90,_0.05)] rounded-lg ">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-white mb-1"
            >
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
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-white mb-1"
            >
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
              onClick={() => {
                setShowPassword(!showPassword);
                setTimeout(() => {
                  setShowPassword(false);
                }, 1000);
              }}
              className="absolute right-3 top-17 transform -translate-y-1/2 cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* <br></br>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="p-2 border rounded-md">
            <option value="user" className="text-black">User</option>
            <option value="admin" className="text-black">Admin</option>
          </select>
          <br></br> */}

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign Up
          </button>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </form>
        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
