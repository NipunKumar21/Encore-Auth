import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
//import { useNavigate } from "react-router-dom";
import {Eye,EyeOff} from "lucide-react";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); 
  const [role,setRole]=useState('user');
  //const navigate=useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/auth/register", {
        email,
        password,
        role,
      });
      console.log("Registered:", response.data);
      setMessage("Registration successful!");
      setError(null);
    } catch (error) {
      console.error("Registration failed:", error);
      setError("Registration failed. Please try again.");
      setMessage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="passwordContainer">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span
          id="toggleVisibility"
          onClick={() => {
            setShowPassword(!showPassword);
            setTimeout(() => {
              setShowPassword(false);
            }, 1000);
          }}
          className="toggle-password"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>

      <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
      <br></br>

      <button type="submit">Register</button>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div>
        <p>
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default Register;
