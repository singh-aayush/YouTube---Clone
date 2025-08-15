import React, { useEffect, useState } from "react";
import VideoPlayer from "./videoPlayer.jsx";
import { API_BASE_URL } from "../config/api.js";
import axios from "axios";

function VideoPage() {
  const [videoData, setVideoData] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // Get token from localStorage
        if (!token) {
          console.error("Access token not found");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/v1/video/${currentVideoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add token to headers
            },
          }
        );
        setVideoData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch video data:", error);
      }
    };

    if (currentVideoId) {
      fetchVideo();
    }
  }, [currentVideoId]);

  return (
    <div>
      {videoData ? (
        <VideoPlayer videoData={videoData} currentVideoId={currentVideoId} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default VideoPage;
