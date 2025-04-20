//simple OAuth callback component to handle the redirects
import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const processedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Skip if we've already processed this code
      if (processedRef.current) {
        console.log("Code already processed, skipping");
        return;
      }
      
      console.log("Starting handleCallback");
      const params = new URLSearchParams(location.search);
      const code = params.get("code");
      console.log("Code received:", code);

      if (!code) {
        console.log("No code received, showing error alert");
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          text: "No authorization code received",
          confirmButtonText: "OK",
        }).then(() => {
          console.log("Navigating to home after error");
          navigate("/", { replace: true });
        });
        return;
      }

      try {
        const isGoogle = location.pathname.includes("google");
        const endpoint = isGoogle ? "/auth/google/callback" : null;
        console.log("Endpoint determined:", endpoint);

        if (!endpoint) {
          throw new Error("Invalid OAuth provider");
        }

        console.log("Making API request to:", `http://localhost:4000${endpoint}`);
        const response = await axios.get(`http://localhost:4000${endpoint}`, {
          params: { code },
        });
        console.log("API response received:", response.data);

        if (response.data.accessToken && response.data.refreshToken) {
          console.log("Storing tokens in localStorage");
          localStorage.setItem("accessToken", response.data.accessToken);
          localStorage.setItem("refreshToken", response.data.refreshToken);
          
          // Mark as processed to prevent duplicate processing
          processedRef.current = true;
          
          console.log("Showing success alert");
          await Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: "You have been successfully logged in!",
            confirmButtonText: "OK",
          });
          
          console.log("Navigating to home");
          navigate("/home", { replace: true });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        // Only show error if we haven't processed successfully yet
        if (!processedRef.current) {
          Swal.fire({
            icon: "error",
            title: "Authentication Failed",
            text: "Failed to complete authentication. Please try again.",
            confirmButtonText: "OK",
          }).then(() => {
            console.log("Navigating to home after error");
            navigate("/", { replace: true });
          });
        }
      }
    };
    handleCallback();
  }, [location.search, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="test-center">
        <h2 className="text-2xl font-bold mb-4">
          Completing Authentication...
        </h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default OAuthCallback;
