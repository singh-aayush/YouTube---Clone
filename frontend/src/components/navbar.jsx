import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../Images-frontend/pngwing.com.png";
import { useAuth } from "./authcontext.jsx"; // Import the useAuth hook

function Navbar() {
  const [userAvatar, setUserAvatar] = useState("");
  const [logoClicked, setLogoClicked] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State to hold search query
  const navigate = useNavigate();
  const { logout } = useAuth(); // Destructure logout from the context

  useEffect(() => {
    const avatar = localStorage.getItem("userAvatar");
    if (avatar) {
      setUserAvatar(avatar);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "/api/v1/users/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("sessionId");

      logout();
      window.location.href = "/login";
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

  // Handle search query input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      try {
        // Make API call to fetch videos based on the search query
        const response = await axios.get(`/api/v1/video`, {
          params: { query: searchQuery }, // Send query as part of the request
        });

        // Pass the results to the search results page or display them
        navigate("/search", { state: { videos: response.data.data } });
      } catch (error) {
        console.error("Search Error", error);
      }
    }
  };

  // Fetch all videos when the button is clicked
  const handleFetchAllVideos = async () => {
    try {
      const response = await axios.get(`/api/v1/video`);
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
            <button className="searchBarButton" onClick={handleFetchAllVideos}>
              Search
            </button>{" "}
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
