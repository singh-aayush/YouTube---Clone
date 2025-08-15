import React from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import axios from "axios";

function Logout() {
  const Navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const sessionId = localStorage.getItem("sessionId");

      // Remove tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("sessionId");

      // Clear cookies
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Send logout request to backend with Authorization header
      await axios.post(
        `${API_BASE_URL}/api/v1/users/logout`,
        {},
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        }
      );

      Navigate("/login");
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default Logout;
