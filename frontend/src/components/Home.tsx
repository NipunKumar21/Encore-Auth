import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useAuth();
  
  //function to handle logout
  const handleLogOut = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      console.log("Token:", token);
      const response = await axios.post(
        "http://localhost:4000/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Clearing  the token from local storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        alert("Logged out successfully!");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      console.error("LogOut failed:", error);
      alert("LogOut failed !!");
    }
  };


  return (
    <div>
      <header className="text-gray-600 body-font fixed top-0 left-0 right-0 bg-gray-800 z-10">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-10 h-10 text-white p-2 bg-blue-500 rounded-full"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="ml-3 text-xl text-white">My-App</span>
          </a>
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
            <a
              className="mr-5 hover:text-white cursor-pointer "
              onClick={() => navigate("/home")}
            >
              Home
            </a>
            <a
              className="mr-5 hover:text-white cursor-pointer "
              onClick={() => navigate("/admin")}
            >
              Admin-Page
            </a>
          </nav>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-3 py-3 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
              <div className="absolute right-0 mt-2 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-48 dark:bg-gray-700">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                  <li>
                    <a
                      onClick={() => navigate('/profile')}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                    >
                      My Profile
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => navigate('/settings')}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                    >
                      Settings
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => navigate('/activity')}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                    >
                      Activity Log
                    </a>
                  </li>
                  <li className="border-t border-gray-200 dark:border-gray-600">
                    <a onClick={handleLogOut}
                      className="block px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-red-400 cursor-pointer"
                    >
                      Sign out
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="pt-24">{/* Your main content goes here */}
        <h2>Welcome to the Home Page</h2>
      </div>
    </div>
  );
};

export default Home;
