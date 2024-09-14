import React from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const Navigate = useNavigate();

  const handleLogout = () => {
    // Remove tokens from localStorage
    console.log("login token0", accessToken, sessionId);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("sessionId");

    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    axios
      .post("/api/v1/users/logout")
      .then(() => {
        Navigate("/login");
      })
      .catch((error) => {
        console.error("Logout Error", error);
      });
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default Logout;
