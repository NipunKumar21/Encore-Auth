import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResetButton, setShowResetButton] = useState(false);
  const navigate =useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/auth/forgot-password", { email });
      console.log(response);
      setMessage(response.data.message);
      setError(null);
     setShowResetButton(true);
      
    } catch (error) {
      console.error("Error sending reset email:", error);
      setError("Failed to send reset email. Please try again.");
      setMessage(null);
      setShowResetButton(false);
    }
  };

  const handleResetButtonClick=()=>{
    navigate("/resetPassword");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send Reset Link</button>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      {showResetButton && ( // Conditionally render the reset button
        <button type="button" onClick={handleResetButtonClick}>
          Go to Reset Password
        </button>
      )}
      <div>
        <p>
          Remembered your password?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default ForgotPassword;