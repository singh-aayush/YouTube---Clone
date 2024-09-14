import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignUp({ onToggleLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("userName", userName);
    if (avatar) formData.append("avatar", avatar);
    if (coverImage) formData.append("coverImage", coverImage);

    try {
      await axios.post("/api/v1/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Registration successful! Please log in.");
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(
        "Signup Error:",
        error.response ? error.response.data.message : error.message
      );
      setError(
        error.response?.data?.message ||
          "Failed to register. Please check your details."
      );
      setSuccess("");
    }
  };

  return (
    <div className="signUpBody">
      <div className="signupContainer">
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form className="signupForm" onSubmit={handleSignUp}>
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
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
          <label>Username</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <label>Avatar</label>
          <input
            className="fileInputOfSignUpPage"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
          <label>Cover Image</label>
          <input
            className="fileInputOfSignUpPage"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files[0])}
          />
          <div className="formButton">
            <button type="submit">Sign Up</button>
          </div>
        </form>
        <div className="signUpButtonInLoginPage">
          <p>Already have an account? </p>
          <button onClick={onToggleLogin} className="toggleButton">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
