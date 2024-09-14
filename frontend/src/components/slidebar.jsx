import { Link } from "react-router-dom";
import { useState } from "react";

function Slidebar() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const channelId = localStorage.getItem("channelId");

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleNavClick = () => {
    setIsSidebarVisible(false);
  };

  return (
    <div className="sideBarToggleContainer">
      {/* Toggle button, only shown on small screens */}
      <button
        className={`sidebarToggleButton ${
          isSidebarVisible ? "activeToggleButton" : ""
        }`}
        onClick={toggleSidebar}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div className={`sideBarContainer ${isSidebarVisible ? "show" : "hide"}`}>
        <ul className="sideBar">
          <Link to="/" className="home" onClick={handleNavClick}>
            <li>Home</li>
          </Link>

          {/* <Link to="/subscription" className="subscription">
          <li>Subscription</li>
        </Link> */}

          <Link to={`/channel/${channelId}`} onClick={handleNavClick}>
            <li>Your Channel</li>
          </Link>

          <Link to="/history" onClick={handleNavClick}>
            <li>History</li>
          </Link>

          {/* <Link to="/playlist" className="playlist">
          <li>Playlist</li>
        </Link> */}

          {/* <Link to="/liked-videos">
          <li>Like Videos</li>
        </Link> */}

          <Link to="/help" onClick={handleNavClick}>
            <li>Help</li>
          </Link>

          <Link to="/send-feedback" onClick={handleNavClick}>
            <li>Send Feedback</li>
          </Link>
        </ul>
      </div>
    </div>
  );
}

export default Slidebar;
