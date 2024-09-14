import React, { useEffect, useState } from "react";
import VideoPlayer from "./videoPlayer.jsx";
import axios from "axios";

function VideoPage() {
  const [videoData, setVideoData] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`/api/v1/video/${currentVideoId}`);
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
