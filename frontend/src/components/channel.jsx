import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Channel() {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const response = await axios.get(`/api/v1/channel/${channelId}`);
        setChannel(response.data.data);
      } catch (error) {
        console.error("Failed to fetch channel data:", error);
      }
    };

    if (channelId) {
      fetchChannelData();
    } else {
      console.error("channelId is undefined");
    }
  }, [channelId]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === "videoFile") {
      setVideoFile(files[0]);
      if (files[0]) {
        setVideoPreview(URL.createObjectURL(files[0]));
      }
    } else if (name === "thumbnail") {
      setThumbnailFile(files[0]);
      if (files[0]) {
        setThumbnailPreview(URL.createObjectURL(files[0]));
      }
    }
  };

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [videoPreview, thumbnailPreview]);

  const handlePublishVideo = async (e) => {
    e.preventDefault();
    if (!videoFile || !thumbnailFile || !videoTitle || !videoDescription) {
      console.error("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", videoTitle);
    formData.append("description", videoDescription);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnailFile);

    try {
      setUploading(true);
      const response = await axios.post("/api/v1/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setUploadSuccess(true);
        setVideoTitle("");
        setVideoDescription("");
        setVideoFile(null);
        setThumbnailFile(null);
        setShowPublishForm(false); // Hide form after successful publish
      }
    } catch (error) {
      console.error("Failed to publish video:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailClick = async (e) => {
    try {
      Navigate(`/video/${e}`);
    } catch (error) {
      console.log("Error in finding the video by it's id", error);
    }
  };

  return (
    <div className="channelPage">
      <div className="channelInfo">
        {channel ? (
          <div className="channelDetails">
            <div className="coverImageOfChannel">
              <img
                src={channel.coverImage || "default-coverImage.png"}
                alt="Channel coverImage"
              />
              <div className="channelLogo">
                <img
                  src={channel.avatar || "default-avatar.png"}
                  alt="Channel Avatar"
                />
              </div>
            </div>

            <div className="channelNameAndSubscribers">
              <h2>{channel.userName}</h2>
              <p>{channel.subscribers.length} subscribers</p>

              {/* Button to show the publish form */}
              <div className="publishButtonInChannel">
                <button onClick={() => setShowPublishForm(true)}>
                  Publish
                </button>
              </div>
            </div>

            {/* Conditional rendering of the publish form */}
            {showPublishForm && (
              <div className="publishPage">
                <div className="publishVideoOfChannel">
                  <h3>Publish a video</h3>
                  <form onSubmit={handlePublishVideo}>
                    <label>Title</label>
                    <input
                      type="text"
                      placeholder="Video Title"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      required
                    />
                    <label>Description</label>
                    <textarea
                      className="videoDescriptionTextArea"
                      placeholder="Video Description"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      required
                    />
                    <label>Video file</label>
                    <div className="filePreviewContainer">
                      <input
                        className="uploadingThings"
                        type="file"
                        name="videoFile"
                        accept="video/*"
                        onChange={handleFileChange}
                        required
                      />
                      {videoPreview && (
                        <video className="filePreview" controls>
                          <source src={videoPreview} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                    <label>Thumbnail</label>
                    <div className="filePreviewContainer filePreviewContainerImage">
                      <input
                        className="uploadingThings"
                        type="file"
                        name="thumbnail"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                      />
                      {thumbnailPreview && (
                        <img
                          className="filePreview"
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                        />
                      )}
                    </div>
                    <button type="submit" disabled={uploading}>
                      {uploading ? "Publishing..." : "Publish"}
                    </button>
                    {uploadSuccess && <p>Video published successfully!</p>}
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>Loading channel info...</p>
        )}
      </div>
      <div className="channelVideos">
        <div className="channelVideoContainer">
          <h3 style={{ color: "white" }}>Your Videos...</h3>
          {channel && channel.videos.length > 0 ? (
            channel.videos.map((video) => (
              // <div key={video._id} className="videoCard">
              //   <img src={video.thumbnail} alt={video.title} />
              //   <h4>{video.title}</h4>
              //   <p>{video.description}</p>
              // </div>

              <div key={video._id} className="allFetchedVideos">
                <div
                  className="contentThumbnail"
                  onClick={() => handleThumbnailClick(video._id)}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="thumbnailImage"
                  />
                </div>
                <div className="contentDescription">
                  <div className="channelLogo">
                    <img src={channel.avatar} alt="channelLogo" />
                  </div>
                  <div className="videoDescription">
                    <h3>{video.title}</h3>
                    <div className="aboutChannel">
                      <a href="#">{channel.userName}</a>
                      <a href="#">{video.views} views</a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No videos published yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Channel;
