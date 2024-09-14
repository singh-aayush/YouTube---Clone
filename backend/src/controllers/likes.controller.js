import mongoose, { isValidObjectId } from "mongoose";
import { comment } from "../models/comment.model.js";
import { like } from "../models/likes.model.js";
import { apiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { video } from "../models/Video.model.js";

const toggleVidoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new apiError(400, "videoId is missing");
  }

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "videoId is invalid");
  }

  const existingLikes = await like.findOne({
    videos: videoId,
    owner: req.user?._id,
  });

  let likedVideo;

  if (existingLikes) {
    await like.findByIdAndDelete(existingLikes._id);

    await video.findByIdAndUpdate(videoId, { $inc: { likes: -1 } });

    likedVideo = await video.findById(videoId);
    return res
      .status(200)
      .json(new ApiResponse(200, likedVideo, "Like is deleted Successfully"));
  } else {
    await like.create({
      videos: videoId,
      owner: req.user?._id,
    });

    await video.findByIdAndUpdate(videoId, { $inc: { likes: 1 } });
    likedVideo = await video.findById(videoId);
    if (!likedVideo) {
      throw new apiError(500, "Something went wrong while liking video");
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideo, "Video liked successfully"));
});

const toggleCommetLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId?.trim()) {
    throw new apiError(400, "commentId is missing");
  }

  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "commentId is invalid");
  }

  const existingLike = await like.findOne({
    comment: commentId,
    owner: req.user?._id,
  });

  if (existingLike) {
    // Remove the existing like
    await like.findByIdAndDelete(existingLike._id);

    // Decrement the like count in the comment
    await comment.findByIdAndUpdate(commentId, {
      $inc: { likes: -1 },
    });

    const updatedComment = await comment.findById(commentId);
    if (!updatedComment) {
      throw new apiError(
        500,
        "Something went wrong while updating the comment"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedComment,
          "Like removed from comment successfully"
        )
      );
  } else {
    // Add a new like
    await like.create({
      comment: commentId,
      owner: req.user?._id,
    });

    // Increment the like count in the comment
    await comment.findByIdAndUpdate(commentId, {
      $inc: { likes: 1 },
    });

    const likedComment = await comment.findById(commentId);

    if (!likedComment) {
      throw new apiError(500, "Something went wrong while liking a comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likedComment, "Comment liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId?.trim()) {
    throw new apiError(400, "tweetId is missing");
  }

  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "tweetId is invalid");
  }

  const existingLikes = await like.findOne({
    tweets: tweetId,
    owner: req.user?._id,
  });

  if (existingLikes) {
    console.log("yes");
    await like.findByIdAndDelete(existingLikes._id);
    return res
      .status(201)
      .json(new ApiResponse(200, {}, "Liked removed from tweet Successfully"));
  } else {
    console.log("no");
    const newLike = await like.create({
      tweets: tweetId,
      owner: req.user?._id,
    });

    const likedTweet = await like.findById(newLike._id);
    if (!likedTweet) {
      throw new ApiResponse(500, "Something went wrong while Liking tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likedTweet, "Tweet is liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await like.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $unwind: "$videos",
    },
    {
      $lookup: {
        from: "likes",
        localField: "videos._id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        $likeCount: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        _id: "$videos._id",
        title: "$videos.title",
        description: "$videos.description",
        videoFile: "$videos.videoFile",
        thumbnail: "$videos.thumbnail",
        duration: "$videos.duration",
        views: "$videos.views",
        owner: "$videos.owner",
        likesCount: "$likesCount",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched Successfully")
    );
});

export { toggleVidoLike, toggleCommetLike, toggleTweetLike, getLikedVideos };
