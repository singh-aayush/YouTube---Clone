import { apiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { like } from "../models/likes.model.js";
import { subscribers } from "../models/subscription.model.js";
import { video } from "../models/Video.model.js";
import mongoose from "mongoose";

const getChannelStatus = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const totalVideoViews = await video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.user._id) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  const totalSubscribers = await subscribers.countDocuments({
    channel: req.user._id,
  });

  const totalVideo = await video.countDocuments({ owner: req.user._id });

  const totalLikes = await like.countDocuments({
    videos: { $in: await video.find({ owner: req.user._id }, "_id") },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        totalVideoViews,
        totalLikes,
        totalSubscribers,
        totalVideo,
        "Channel stats Fetched Successfully"
      )
    );
});

const getChannelVideo = asyncHandler(async (req, res) => {
  const videos = await video.find({
    owner: req.user._id,
  });

  if (!videos) {
    throw new apiError(
      500,
      "Something went wrong while fetching videos of user"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "Videos of channel Fetched successfully")
    );
});

export { getChannelStatus, getChannelVideo };
