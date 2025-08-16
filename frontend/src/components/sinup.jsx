import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function SignUp({ onToggleLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setError("Please select a valid image file");
      setFile(null);
      setPreview(null);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("userName", userName);

    // Append files only if selected
    if (avatar) formData.append("avatar", avatar);
    if (coverImage) formData.append("coverImage", coverImage);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/users/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSuccess("Registration successful! Redirecting to login...");
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(
        "Signup Error:",
        err.response ? err.response.data.message : err.message
      );
      setError(
        err.response?.data?.message ||
          "Failed to register. Please check your details."
      );
      setSuccess("");
    }
  };

  return (
    <div className="signUpBody">
      <div className="signupContainer">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form className="space-y-4" onSubmit={handleSignUp}>
          <div>
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Avatar (optional)</label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setAvatar, setAvatarPreview)}
                className="hidden"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="cursor-pointer">
                Choose Avatar
              </label>
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="avatar-preview"
                />
              )}
            </div>
          </div>

          <div>
            <label>Cover Image (optional)</label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(e, setCoverImage, setCoverImagePreview)
                }
                className="hidden"
                id="cover-image-upload"
              />
              <label htmlFor="cover-image-upload" className="cursor-pointer">
                Choose Cover Image
              </label>
              {coverImagePreview && (
                <img
                  src={coverImagePreview}
                  alt="Cover Image Preview"
                  className="cover-image-preview"
                />
              )}
            </div>
          </div>

          <div className="formButton">
            <button type="submit">Sign Up</button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button onClick={onToggleLogin} className="toggleButton">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;