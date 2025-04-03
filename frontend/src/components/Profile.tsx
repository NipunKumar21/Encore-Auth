import useAuth from "../hooks/useAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/profile.css";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<{ email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error("error in fetching user data :", err);
      setError("Failed to fetch user data.");
    }
  };

  //call fetchUserData
  useEffect(() => {
    fetchUserData();
  }, []);

  //function to handle logout
  const handleLogOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
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

  useAuth();

  return (
    <div>
      <header className="text-gray-600 body-font fixed top-0 left-0 right-0 bg-grey-700 z-10">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
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
            <span className="ml-3 text-xl">My-App</span>
          </a>
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
            <a
              className="mr-5 hover:text-gray-900 cursor-pointer"
              onClick={() => navigate("/home")}
            >
              Home
            </a>
            <a
              className="mr-5 hover:text-gray-900 cursor-pointer"
              onClick={() => navigate("/admin")}
            >
              Admin-Page
            </a>
          </nav>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-3 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                      onClick={() => navigate("/profile")}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                    >
                      My Profile
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => navigate("/settings")}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                    >
                      Settings
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => navigate("/activity")}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
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
      {/* user profile content */}
      <div className="profile-container">
        <h1>Profile</h1>
        {error && <div className="error-message">{error}</div>}
        {userData ? (
          <div className="profile-details">
            <div className="profile-header">
            </div>
            <div className="profile-info">
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg border">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Profile
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  This is some information about the user.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Full name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData.email.split("@")[0]}
                    </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Email address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData.email}
                    </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Phone number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      (123) 456-7890
                    </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      123 Main St
                      <br />
                      Anytown, USA 12345
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading user data ...</p>
        )}
      </div>
      <button id="logout" onClick={handleLogOut}>
              Sign out{" "}
            </button>
    </div>
  );
};

export default Profile;
