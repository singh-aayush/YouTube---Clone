import { apiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { video } from "../models/Video.model.js";
import { tweet } from "../models/tweets.model.js";
import { comment } from "../models/comment.model.js";
import { playlist } from "../models/playlist.model.js";
import { isValidObjectId } from "mongoose";

const verifyIsOwnerForVideo = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      throw new apiError(400, "videoId is missing");
    }
    const newvideo = await video.findById(videoId);
    if (!newvideo) {
      throw new apiError(401, "Video is not found");
    }
    if (newvideo.owner.toString() !== req.user._id.toString()) {
      throw new apiError(401, "You are not the owner of this");
    }
    next();
  } catch (error) {
    throw new apiError(401, error?.message || "video not found");
  }
});

const verifyIsOwnerForTweet = asyncHandler(async (req, res, next) => {
  try {
    const { tweetId } = req.params;
    if (!tweetId?.trim()) {
      throw new apiError(400, "TweetId is Missing");
    }
    if (!isValidObjectId(tweetId)) {
      throw new apiError(400, "TweetId is invalid");
    }

    const newTweet = await tweet.findById(tweetId);
    if (!newTweet) {
      throw new apiError(400, "Tweet not found");
    }

    if (newTweet.owner.toString() !== req.user._id.toString()) {
      throw new apiError(400, "You are not the owner of this Tweet");
    }

    next();
  } catch (error) {
    throw new apiError(401, error?.message || "Tweet not found");
  }
});

const verifyIsOwnerForComment = asyncHandler(async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!commentId?.trim()) {
      throw new apiError(400, "CommentId is missing");
    }
    if (!isValidObjectId(commentId)) {
      throw new apiError(400, "CommentId is invalid");
    }

    const commentUser = await comment.findById(commentId);
    if (!commentUser) {
      throw new apiError(400, "Comment not found");
    }

    if (commentUser.owner.toString() !== req.user._id.toString()) {
      throw new apiError(400, "You are not the owner of this comment");
    }

    next();
  } catch (error) {
    throw new apiError(400, error?.message || "Comment is not Found");
  }
});

const verifyIsOwnerForPlaylist = asyncHandler(async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    if (!playlistId?.trim()) {
      throw new apiError(400, "PlaylistId is missing");
    }
    if (!isValidObjectId(playlistId)) {
      throw new apiError(400, "PlaylistId is invalid");
    }

    const newPlaylist = await playlist.findById(playlistId);
    if (!newPlaylist) {
      throw new apiError(400, "Playlist not found");
    }

    if (newPlaylist.owner.toString() !== req.user._id.toString()) {
      throw new apiError(400, "You are not the owner of this Playlist");
    }

    next();
  } catch (error) {
    throw new apiError(401, error?.message || "Playlist is not found");
  }
});

export {
  verifyIsOwnerForComment,
  verifyIsOwnerForPlaylist,
  verifyIsOwnerForTweet,
  verifyIsOwnerForVideo,
};
