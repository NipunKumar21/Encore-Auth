import useAuth from "../hooks/useAuth";
import useUserRole from "../hooks/useUserRole";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<{ email: string; role: string; created_at: string } | null>(null);
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
        Swal.fire({
          icon: 'success',
          title: 'Logged out successfully!',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/');
          }
        });
      }
    } catch (error) {
      console.error("LogOut failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Log out failed !!',
        confirmButtonText: 'OK',
      });
    }
  };

  useAuth();

  // Format date helper function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <header className="text-gray-300 body-font bg-gray-800 shadow-md z-10">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
            <h2 className="ml-3 text-xl">Profile</h2>
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
      
      {/* user profile content */}
      <div className="flex-grow container mx-auto px-4 py-8 mt-16">
        {error && <div className="p-3 bg-red-900/50 text-red-400 rounded-md border border-red-800 mb-4">{error}</div>}
        {userData ? (
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700 mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-white">
                User Profile
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-400">
                This is some information about the user.
              </p>
            </div>
            <div className="border-t border-gray-700 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-700">
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                    {userData.email.split("@")[0]}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">
                    Email address
                  </dt>
                  <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                    {userData.email}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">
                    User Role
                  </dt>
                  <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                    {userData.role}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">
                    Phone number
                  </dt>
                  <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                    (123) 456-7890
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">
                    Address
                  </dt>
                  <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                    123 Main St
                    <br />
                    Anytown, USA 12345
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">
                    Created At
                  </dt>
                  <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                    {userData.created_at ? formatDate(userData.created_at) : 'Not available'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <p className="text-white">Loading user data ...</p>
        )}
        
        <div className="flex justify-end">
          <button 
            id="logout" 
            onClick={handleLogOut}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
