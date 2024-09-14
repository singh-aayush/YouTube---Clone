import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ onLoginSuccess, onToggleSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/v1/users/login`, {
        email,
        password,
      });

      const { accessToken, sessionId, loggedInUser } = response.data.data;

      const channelId = loggedInUser.channel;
      localStorage.setItem("channelId", channelId);
      localStorage.setItem("userAvatar", loggedInUser.avatar);
      localStorage.setItem("name", loggedInUser.fullName);
      localStorage.setItem("userId", loggedInUser._id);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("sessionId", sessionId);

      if (onLoginSuccess) onLoginSuccess();

      navigate("/");
    } catch (error) {
      console.error("Login Error", error);
      setError("Failed to login. Please check your credentials.");
      alert("Failed to login. Please check your credentials.");
    }
  };

  return (
    <div className="wholeBody">
      <div className="loginContainer">
        <h2>Login</h2>
        <div className="loginDetails">
          <form className="loginForm" onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="formButton">
              <button type="submit">Login</button>
            </div>
          </form>
          <div className="signUpButtonInLoginPage">
            <p>Don't have an account?</p>
            <button onClick={onToggleSignup} className="toggleButton">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
