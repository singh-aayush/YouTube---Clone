import axios from "axios";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";
import { useNavigate } from "react-router-dom";

function ContentSideBar({ currentVideoId }) {
  const [videoData, setVideoData] = useState([]);
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("Access token not found");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/v1/video`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setVideoData(response.data.data);
      } catch (error) {
        console.log("Error fetching data in ContentSideBar", error);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoPlay = async (videoId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionId = localStorage.getItem("sessionId");

      if (!token) {
        console.error("Access token not found");
        return;
      }
      if (!sessionId) {
        console.error("Session ID not found");
        return;
      }

      // Send the view increment request to the server with token
      await axios.post(
        `${API_BASE_URL}/api/v1/video/views`,
        { videoId, sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Navigate(`/video/${videoId}`);
    } catch (error) {
      console.error("Failed to track video view", error);
    }
  };

  // Filter the fetching video
  const filterVideos = videoData.filter(
    (video) => video._id !== currentVideoId
  );

  return (
    <div className="sideVideoContentContainer">
      {filterVideos.length > 0 ? (
        filterVideos.map((video) => (
          <div key={video._id} className="sideVideoContents">
            <div
              className="sideVideos"
              onClick={() => handleVideoPlay(video._id)}
            >
              <div className="sideVideoThumbnail">
                <img
                  src={video.thumbnail}
                  alt="videoThumbnail"
                  className="thumbnailImage"
                />
              </div>
              <div className="sideVideosDetails">
                <h3>{video.title}</h3>
                <div className="aboutChannel">
                  <a href="#">{video.owner.userName}</a>
                  <a href="#">{video.views} views</a>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ContentSideBar;
