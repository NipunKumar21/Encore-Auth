import useAuth from "../hooks/useAuth";
import useUserRole from "../hooks/useUserRole";
//import { useNavigate } from "react-router-dom";
import TwoFAPopup from "./TwoFAPopup";
import axios from "axios";
import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";

const Settings: React.FC = () => {
  useAuth();
  const navigate=useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<{ email: string; role: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userRole, loading } = useUserRole();

  //function to fetch user data
  const fetchUserData = async () => {   
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:4000/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
      console.log("User data:", response.data);
    } catch (err) {
      console.log(error);
      console.error("error in fetching user data :", err);
      setError("Failed to fetch user data.");
    }
  };

  //call fetchUserData
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <header className="text-gray-300 body-font bg-gray-800 shadow-md z-10">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
            <h2 className="ml-3 text-xl">Settings</h2>
          </a>
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
            <a
              className="mr-5 hover:text-white cursor-pointer"
              onClick={() => navigate("/home")}
            >
              Home
            </a>
            {!loading && userRole === 'admin' && (
              <a
                className="mr-5 hover:text-white cursor-pointer"
                onClick={() => navigate("/admin/users")}
              >
                User Management
              </a>
            )}
          </nav>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-3 text-center inline-flex items-center"
              type="button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 z-10 bg-gray-800 divide-y divide-gray-700 rounded-lg shadow-lg w-48 border border-gray-700">
                <ul className="py-2 text-sm text-gray-300">
                  <li>
                    <a
                      onClick={() => navigate("/profile")}
                      className="block px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer"
                    >
                      My Profile
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => navigate("/settings")}
                      className="block px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer"
                    >
                      Settings
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => navigate("/activity")}
                      className="block px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer"
                    >
                      Activity Log
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex-grow container mx-auto px-4 py-8 mt-16">
        {error && <div className="p-3 bg-red-900/50 text-red-400 rounded-md border border-red-800 mb-4">{error}</div>}
        
        <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-bold mb-4 text-white">Two-Factor Authentication</h2>
          <div className="flex justify-between items-center">
            <p className="text-gray-300 flex-grow mr-4">
              Protect your account with an additional layer of security by enabling
              two-factor authentication.
            </p>
            <div>
              <TwoFAPopup userEmail={userData?.email} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
