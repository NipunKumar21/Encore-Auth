import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuth=()=>{
    const navigate = useNavigate();

    const isTokenExpired = (token: string): boolean => {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    };

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken || isTokenExpired(accessToken)) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            navigate("/"); // Redirect to login page
        }
    }, [navigate]);
};

export default useAuth;