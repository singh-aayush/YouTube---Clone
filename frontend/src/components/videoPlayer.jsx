import React, { useEffect, useState } from "react";
import axios from "axios";
import ContentSideBar from "./contentSideBar";
import { useParams } from "react-router-dom";

function VideoPlayer() {
  const [video, setVideo] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [channelId, setChannelId] = useState("");
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [userChannelName, setUserChannelName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [error, setError] = useState("");
  // const videoId = window.location.pathname.split("/")[2];
  const { videoId } = useParams();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.get(`/api/v1/video/${videoId}`);
        const fetchedVideo = response.data.data;

        if (fetchedVideo.owner) {
          const initialSubscriberCount = fetchedVideo.owner.subscribers || 0;
          setVideo({
            ...fetchedVideo,
            owner: {
              ...fetchedVideo.owner,
              subscribers: initialSubscriberCount,
            },
          });
          const subscriptionStatus = await checkSubscription(
            fetchedVideo.owner.channel
          );
          setSubscribed(subscriptionStatus);
        }
      } catch (error) {
        console.log("Error fetching video", error);
        setError("Failed to fetch video");
      }
    };

    fetchVideoData();
    fetchComments(currentPage);

    const avatar = localStorage.getItem("userAvatar");
    const channelName = localStorage.getItem("name");
    const channel = localStorage.getItem("channelId");
    if (avatar) {
      setUserAvatar(avatar);
    }
    if (channelName) {
      setUserChannelName(channelName);
    }
    if (channel) {
      setChannelId(channel);
    }
  }, [videoId]);

  const fetchComments = async (page) => {
    try {
      const response = await axios.get(`/api/v1/comment/${videoId}/comments`, {
        params: { page, limit: 40 },
      });

      if (response.data.success) {
        const newComments = response.data.data;
        setHasMoreComments(newComments.length > 0);

        // Update comments state
        setComments((prevComments) => [
          ...prevComments,
          ...newComments.filter(
            (comment) => !prevComments.some((c) => c._id === comment._id)
          ),
        ]);
      } else {
        console.log("Failed to fetch comments:", response.data.message);
      }
    } catch (error) {
      console.log("Failed to fetch comments:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1;
      if (bottom && hasMoreComments) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMoreComments]);

  const checkSubscription = async (channelId) => {
    if (!channelId) return false;
    try {
      const response = await axios.get(`/api/v1/subscription/u/${channelId}`);
      return response.data.message === "Subscribed";
    } catch (error) {
      console.log("Failed to check subscription status:", error);
      return false;
    }
  };

  const handleSubscribed = async (e) => {
    e.stopPropagation();

    if (video?.owner?._id === localStorage.getItem("userId")) {
      setError("You cannot subscribe to your own channel.");
      return;
    }

    try {
      const videoOwnerChannelId = video?.owner?.channel;
      if (!videoOwnerChannelId) {
        console.error("Video owner's Channel ID not found");
        return;
      }

      setSubscribed((prevSubscribed) => !prevSubscribed);

      const updatedSubscriberCount = subscribed
        ? video.owner.subscribers - 1
        : video.owner.subscribers + 1;

      setVideo((prevVideo) => ({
        ...prevVideo,
        owner: { ...prevVideo.owner, subscribers: updatedSubscriberCount },
      }));

      const response = await axios.post(
        `/api/v1/subscription/toggle/${videoOwnerChannelId}`
      );

      if (response.status === 200) {
        // Optionally, fetch the updated subscriber count from the backend if necessary
        const newSubscriberCount = response.data.subscriberCount;
        setVideo((prevVideo) => ({
          ...prevVideo,
          owner: { ...prevVideo.owner, subscribers: newSubscriberCount },
        }));
      } else {
        setSubscribed((prevSubscribed) => !prevSubscribed);
        setError(response.data.message || "Failed to toggle subscription");
      }
    } catch (error) {
      console.log("Failed to toggle subscribe button:", error);
    }
  };

  const handlePlay = () => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      console.error("Session ID not found");
      return;
    }

    axios.post("/api/v1/video/views", { videoId, sessionId }).catch((error) => {
      console.error("Failed to track video view", error);
    });
  };

  const handlePostComment = async (commentText) => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        console.log("Session ID not found for comment");
        return;
      }

      const response = await axios.post(`/api/v1/comment/${videoId}/comments`, {
        content: commentText,
        sessionId,
      });

      if (response.data.statuscode === 201 && response.data.success) {
        setComments([]);
        fetchComments(1);

        // Clear the comment input
        setCommentInput("");
      } else {
        console.log(
          "Failed to post comment:",
          response.data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.log(
        "Failed to post comment:",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      const response = await axios.patch(`/api/v1/comment/c/${commentId}`, {
        content: editedCommentText,
      });

      if (response.status === 200) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId ? response.data.data : comment
          )
        );
        setEditingCommentId(null);
        setEditedCommentText("");
      }
    } catch (error) {
      console.log("Failed to edit comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.delete(`/api/v1/comment/c/${commentId}`);

      if (response.status === 200) {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment._id !== commentId)
        );
      }
    } catch (error) {
      console.log("Failed to delete comment:", error);
    }
  };

  const handleEditInputChange = (event) => {
    setEditedCommentText(event.target.value);
  };

  const handleCommentInputChange = (event) => {
    setCommentInput(event.target.value);
  };

  const handleCommentSubmit = () => {
    if (commentInput.trim()) {
      handlePostComment(commentInput);
    }
  };

  const handleLikeVideo = async () => {
    try {
      const response = await axios.post(`/api/v1/like/toggle/v/${videoId}`);

      if (response.status === 200) {
        // Update the video state to reflect the new like count
        const updatedVideo = response.data.data.likes;
        setVideo((prevVideo) => ({
          ...prevVideo,
          likes: updatedVideo,
        }));
      }
    } catch (error) {
      console.error(
        "Failed to like video:",
        error.response?.data || error.message
      );
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await axios.post(`/api/v1/like/toggle/c/${commentId}`);

      if (response.status === 200) {
        // Update the comments state to reflect the new like count
        const updatedLikes = response.data.data.likes;

        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, likes: updatedLikes }
              : comment
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to like comment:",
        error.response?.data || error.message
      );
    }
  };

  const toggleComments = () => {
    setIsCommentsVisible(!isCommentsVisible);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsSmallScreen(true);
        setIsCommentsVisible(false); // Hide comments by default on small screens
      } else {
        setIsSmallScreen(false);
        setIsCommentsVisible(true); // Show comments by default on larger screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize the state

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="videoPlayerContainer">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {video ? (
        <div className="videoPlayer">
          {!isSmallScreen && <ContentSideBar currentVideoId={videoId} />}
          <video
            controls
            width="100%"
            src={video.videoFile}
            onPlay={handlePlay}
          ></video>
          <div className="videoInfo">
            <h2>{video.title}</h2>
            <div className="videoPlayerAboutChannel">
              <div className="videoPlayerChannelLogo">
                <img src={video.owner.avatar} alt="channelLogo" />
              </div>
              <div className="aboutOwnerAndSubscribers">
                <h3>{video.owner.userName}</h3>
                <p>{video.owner.subscribers} subscribers</p>
              </div>
              {userId !== video.owner._id && (
                <div
                  className="subscribeButtonInVideoPlayer"
                  onClick={handleSubscribed}
                >
                  <button>{subscribed ? "Unsubscribe" : "Subscribe"}</button>
                </div>
              )}
              <div className="videoLikes">
                <button onClick={handleLikeVideo}>
                  Like {video.likes || 0}
                </button>
              </div>
            </div>

            <div className="VideoPlayerDescriptionSection">
              <p>{video.views} views</p>
              <p>{video.description}</p>
            </div>
          </div>
          <div className="commentSectionOfVideoPlayer">
            <div className="commentWrittenByYou">
              <div className="yourComment">
                <div className="yourCommentLogo">
                  <img
                    src={userAvatar || "default-avatar.png"}
                    alt="Your Avatar"
                  />
                </div>
                <div className="commentInput">
                  <input
                    type="text"
                    placeholder="Comment..."
                    value={commentInput}
                    onChange={handleCommentInputChange}
                    required
                  />
                </div>
                <div className="commentButton">
                  <button onClick={handleCommentSubmit}>Post</button>
                </div>
              </div>
            </div>
            {isSmallScreen && (
              <button onClick={toggleComments} className="toggleCommentsButton">
                {isCommentsVisible ? "Hide Comments" : "Show Comments"}
              </button>
            )}
            {isCommentsVisible && (
              <>
                {comments.length > 0 ? (
                  [...comments].reverse().map((comment) => (
                    <div className="allCommentOnThisVideo" key={comment._id}>
                      <div className="commentOwnerLogo">
                        <img
                          src={comment.owner?.avatar || "default-avatar.png"}
                          alt="User Avatar"
                        />
                      </div>
                      <div className="commentTextSection">
                        <div className="commentUserName">
                          <h3>{comment.owner?.fullName}</h3>
                        </div>
                        <div className="peopleCommentsMassage">
                          {editingCommentId === comment._id ? (
                            <div className="editCommentSection">
                              <input
                                type="text"
                                value={editedCommentText}
                                onChange={handleEditInputChange}
                              />
                              <button
                                onClick={() => handleEditComment(comment._id)}
                              >
                                Save
                              </button>
                              <button onClick={() => setEditingCommentId(null)}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p>{comment.content}</p>
                          )}
                        </div>
                        <div className="commentActions">
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                          >
                            Like {comment.likes || 0}
                          </button>
                          {comment.owner._id ===
                            localStorage.getItem("userId") && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditedCommentText(comment.content);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No comments yet</p>
                )}
              </>
            )}
          </div>
          {isSmallScreen && <ContentSideBar currentVideoId={videoId} />}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default VideoPlayer;
