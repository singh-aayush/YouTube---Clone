import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../Images-frontend/pngwing.com.png";
import { useAuth } from "./authcontext.jsx"; // Import the useAuth hook
import { API_BASE_URL } from "../config/api.js";

function Navbar() {
  const [userAvatar, setUserAvatar] = useState("");
  const [logoClicked, setLogoClicked] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const avatar = localStorage.getItem("userAvatar");
    if (avatar) {
      setUserAvatar(avatar);
    }
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/users/logout`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );

      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("sessionId");

      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  const handleLogoClick = () => {
    setLogoClicked(!logoClicked);
    navigate("/");
  };

  const toggleProfileMenu = () => {
    setProfileMenuVisible(!profileMenuVisible);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/video`, {
          params: { query: searchQuery },
          headers: getAuthHeaders(),
        });
        navigate("/search", { state: { videos: response.data.data } });
      } catch (error) {
        console.error("Search Error", error);
      }
    }
  };

  const handleFetchAllVideos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/video`, {
        headers: getAuthHeaders(),
      });
      navigate("/search", { state: { videos: response.data.data } });
      setSearchQuery("");
    } catch (error) {
      console.error("Error fetching all videos", error);
    }
  };

  return (
    <div className="header">
      <div className={`navbar ${logoClicked ? "logoClicked" : ""}`}>
        <div className="navLogo" onClick={handleLogoClick}>
          <img src={logo} alt="videoTube.logo" />
          <h2>FreeTube</h2>
        </div>
        <div className="searchBar">
          <form className="searchBarForm" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              name="SearchInput"
              id="SearchBar"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              autoComplete="off"
            />
            <button
              type="button"
              className="searchBarButton"
              onClick={handleFetchAllVideos}
            >
              Search
            </button>
          </form>
        </div>
        <div className="yourProfile">
          <img src={userAvatar} alt="userProfile" onClick={toggleProfileMenu} />
          <div className={`profileMenu ${profileMenuVisible ? "show" : ""}`}>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
