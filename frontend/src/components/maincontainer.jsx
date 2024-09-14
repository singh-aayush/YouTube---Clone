import { Outlet, useLocation } from "react-router-dom";
import Slidebar from "./slidebar";

function MainContainer() {
  const location = useLocation();
  const isVideoPlayer = location.pathname.startsWith("/video/");

  return (
    <div className="mainContainer">
      {!isVideoPlayer && <Slidebar />}
      <div className={`contentContainer ${isVideoPlayer ? "fullWidth" : ""}`}>
        <Outlet />
      </div>
    </div>
  );
}

export default MainContainer;
