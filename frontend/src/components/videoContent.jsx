import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function VideoContent() {
  const [videoData, setVideoData] = useState([]);
  const [userAvatar, setUserAvatar] = useState("");
  const [userChannelName, setUserChannelName] = useState("");
  const [error, setError] = useState();
  const Navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/v1/video`)
      .then((response) => {
        setVideoData(response.data.data);
      })
      .catch((error) => {
        console.log("error fetching", error);
        setError("Failed to fetch video data");
      });

    const avatar = localStorage.getItem("userAvatar");
    const channelName = localStorage.getItem("name");
    if (avatar) {
      setUserAvatar(avatar);
    }
    if (channelName) {
      setUserChannelName(channelName);
    }
  }, []);

  const handleThumbnailClick = async (videoId) => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        console.error("Session ID not found");
        return;
      }

      axios
        .post("/api/v1/video/views", { videoId, sessionId })
        .catch((error) => {
          console.error("Failed to track video view", error);
        });

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
