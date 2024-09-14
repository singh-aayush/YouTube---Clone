import React, { useState, useEffect } from "react";
import Axios from "axios";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const response = await Axios.get("/api/v1/users/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === 200) {
          setHistory(response.data.data);
        } else {
          setHistory([]);
        }
      } catch (err) {
        setError("Failed to fetch history");
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="userHistoryPage">
      <div className="userHistory">
        <h1 style={{ margin: "0px" }}>Your History...</h1>
        {history.length === 0 ? (
          <p style={{ color: "white" }}>No videos watched yet.</p>
        ) : (
          <div className="videoContent">
            {history.map((video) => (
              <div key={video._id} className="allFetchedVideos">
                <div
                  className="contentThumbnail"
                  onClick={() => (window.location.href = `/video/${video._id}`)}
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
                      <a href={`/channel/${video.owner._id}`}>
                        {video.owner.userName}
                      </a>
                      <a href="#">{video.views} views</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
