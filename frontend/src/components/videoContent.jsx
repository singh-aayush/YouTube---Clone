import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function VideoContent() {
  const [videoData, setVideoData] = useState([]);
  const [userAvatar, setUserAvatar] = useState("");
  const [userChannelName, setUserChannelName] = useState("");
  const [error, setError] = useState();
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // Use accessToken for auth
        if (!token) {
          console.error("Access token not found");
          setError("You are not authorized to view videos");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/v1/video`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setVideoData(response.data.data);
      } catch (error) {
        console.error("error fetching", error);
        setError("Failed to fetch video data");
      }
    };

    fetchVideos();

    const avatar = localStorage.getItem("userAvatar");
    const channelName = localStorage.getItem("name");
    if (avatar) setUserAvatar(avatar);
    if (channelName) setUserChannelName(channelName);
  }, []);

  const handleThumbnailClick = async (videoId) => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        console.error("Session ID not found");
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Access token not found");
        return;
      }

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

  return (
    <div className="videoContent">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {videoData.length > 0 ? (
        videoData.map((video) => (
          <div key={video._id} className="allFetchedVideos">
            <div
              className="contentThumbnail"
              onClick={() => handleThumbnailClick(video._id)}
            >
              <img
                src={video.thumbnail}
                alt="videoThumbnail"
                className="thumbnailImage"
              />
            </div>
            <div className="contentDescription">
              <div className="channelLogo">
                <img src={video.owner.avatar} alt="channelLogo" />
              </div>
              <div className="videoDescription">
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

export default VideoContent;
