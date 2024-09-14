import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { videos } = location.state || { videos: [] }; // Get videos from the location state

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`); // Navigate to the video player page
  };

  console.log("vidoes", videos);
  return (
    <div className="searchContainer">
      <div className="searchResultFromDatabase">
        <h2>Search Results</h2>
        {videos.length > 0 ? (
          videos.map((video) => (
            <div
              className="videoOfSearchResult"
              key={video._id}
              onClick={() => handleVideoClick(video._id)}
            >
              <img src={video.thumbnail} alt={video.title} />
              <div className="videoDetailsOfSearchResult">
                <div>
                  <div className="videoNameAndDescription">
                    <h3>{video.title}</h3>
                    <p>{video.views} views</p>
                  </div>
                  <p>{video.description}</p>
                </div>
                <div className="channelDetailOfSearchResult">
                  <img src={video.owner.avatar} />
                  <p>{video.owner?.userName}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
