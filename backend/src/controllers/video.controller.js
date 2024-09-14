import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/User.model.js";
import VideoSession from "../models/videoSession.model.js";
import { video } from "../models/Video.model.js";
import { apiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { extractPublicId } from "cloudinary-build-url";
import { Channel } from "../models/channel.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  deleteVideoFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideo = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  let videoQuery = {};

  if (query) {
    videoQuery = {
      ...videoQuery,
      $or: [
        { title: new RegExp(query, "i") },
        { description: new RegExp(query, "i") },
      ],
    };
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new apiError(400, "userId is missing");
    }
    videoQuery = { ...videoQuery, owner: userId };
  }

  // Now find the video in DB
  const totalVideos = await video.countDocuments(videoQuery);
  let sortCriteria = {};
  if (sortBy) {
    sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
  }

  // Retrieve video based on pagination, query and sort
  const videos = await video
    .find(videoQuery)
    .populate("owner", "userName avatar subscribers subscriptions channel")
    .sort(sortCriteria)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Video fetched successfully"));
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new apiError(400, "All fields are required!");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  if (!videoFileLocalPath) {
    throw new apiError(400, "Video file path is not found.");
  }

  const thumbnailFileLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailFileLocalPath) {
    throw new apiError(400, "Thumbnail path is not found.");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  if (!videoFile) {
    throw new apiError(400, "Error in uploading video file to cloudinary");
  }

  const thumbnailFile = await uploadOnCloudinary(thumbnailFileLocalPath);
  if (!thumbnailFile) {
    throw new apiError(400, "Error in uploading thubnail file to cloudinary");
  }

  // saving in DB
  try {
    const newVideo = await video.create({
      videoFile: videoFile?.url,
      thumbnail: thumbnailFile?.url,
      title,
      description,
      duration: videoFile?.duration,
      owner: req.user._id,
    });

    const uploadedVideo = await video.findById(newVideo?._id);
    if (!uploadedVideo) {
      throw new apiError(500, "Something went wrong in uploading video");
    }

    const channel = await Channel.findOne({ owner: req.user._id });

    if (!channel) {
      throw new apiError(404, "Channel not found");
    }

    channel.videos.push(uploadedVideo._id);
    await channel.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          uploadedVideo,
          "Your video is Successfully Published"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          error?.message || "Something went wrong while uploading File."
        )
      );
  }

  // saving in DB
  // const newVideo = await video.create({
  //   videoFile: videoFile?.url,
  //   thumbnailFile: thumbnailFile?.url,
  //   title,
  //   description,
  //   duration: videoFile?.duration,
  //   owner: req.user._id,
  // });

  // const uploadedVideo = await newVideo.findById(video._id);
  // if (!uploadedVideo) {
  //   throw new apiError(500, "Something went wrong in uploading video");
  // }

  // return res
  //   .status(201)
  //   .json(new ApiResponse(201, uploadedVideo, "Video uploaded successfully"));
});

const getVedioById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new apiError(400, "VideoId is missing");
  }

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid videoId format");
  }

  const allVideos = await video
    .findById(videoId)
    .populate("owner", "userName avatar subscribers subscriptions channel")
    .exec();
  if (!allVideos) {
    throw new apiError(400, "Video is not found in the DataBase");
  }

  const user = await User.findById(req.user?._id);
  if (user) {
    if (!Array.isArray(user.watchHistory)) {
      user.watchHistory = [];
    }

    if (!user.watchHistory.includes(videoId)) {
      user.watchHistory.push(videoId);
      await user.save();
    }
  }

  // Increment the views count

  // allVideos.views += 1;
  // const view = await allVideos.save({ validateBeforSave: false });
  // if (!view) {
  //   throw new apiError(400, "Something went wrong in incrementing views");
  // }

  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "Video fetched by Id successfully"));
});

const trackVideoView = asyncHandler(async (req, res) => {
  const { videoId, sessionId } = req.body;

  if (!videoId || !sessionId) {
    throw new apiError(400, "Missing videoId or sessionId");
  }

  // Fetch video
  const allFetchVideo = await video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found");
  }

  // Check if the session view already exist
  const sessionView = await VideoSession.findOne({ sessionId, videoId });

  if (!sessionView) {
    // Create a new session view
    const newSessionView = new VideoSession({ sessionId, videoId });
    try {
      await newSessionView.save();
    } catch (error) {
      throw new apiError(500, "Failed to save session view");
    }

    // Increment the view count atomically
    const updatedVideo = await video.findOneAndUpdate(
      { _id: videoId },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedVideo) {
      throw new apiError(404, "Failed to increment view count for video");
    }

    res.status(200).json({ success: true, data: updatedVideo });
  } else {
    res.status(200).json({ success: true, data: video });
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new apiError(400, "VideoId is missing");
  }

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid videoId format");
  }

  const { title, description } = req.body;
  if (!title || !description) {
    throw new apiError(400, "All fields are required");
  }

  const thumbnailLocalFilePath = req.file?.path;
  if (!thumbnailLocalFilePath) {
    throw new apiError(400, "Thumbnail local file is missing");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);

  if (!thumbnail.url) {
    throw new apiError(400, "Error while uploading on cloudinary");
  }

  // Deleting old avatar

  const oldVideo = await findById(videoId);
  const oldThumbnailURL = oldVideo.thumbnail;
  if (!oldThumbnailURL) {
    throw new apiError(400, "Old thumbnail is not found");
  }

  const video = await video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
        title,
        description,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new apiError(400, "VideoId is missing");
  }

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid videoId format");
  }

  const fileVideo = await video.findByIdAndDelete(videoId);
  if (!fileVideo) {
    throw new apiError(400, "Something went wrong while deleting video");
  }

  // Delete video from cloudinary
  const cloudinaryVideo = extractPublicId(video.videoFile);
  const videoFile = await deleteVideoFromCloudinary(cloudinaryVideo);
  if (!videoFile) {
    throw new apiError(
      500,
      "Something went wrong while deleting video from cloud"
    );
  }

  // Delete thumbnail from cloudinary
  const cloudinaryThumbnail = extractPublicId(video.thumbnail);
  const thumbnailFile = await deleteFromCloudinary(cloudinaryThumbnail);
  if (!thumbnailFile) {
    throw new apiError(
      500,
      "Something went wrong while deleting thumbnail from cloud"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new apiError(400, "VideoId is missing");
  }

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid VideoId format");
  }

  const toggleVideo = await video.findById(videoId);
  toggleVideo.isPublished = !toggleVideo.isPublished;
  await toggleVideo.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Status toggle successfully"));
});

export {
  getAllVideo,
  publishVideo,
  getVedioById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  trackVideoView,
};
