import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiErrors.js";
import { generateSessionId } from "../utils/regenerateSessionId.js";
import { User } from "../models/User.model.js";
import { Channel } from "../models/channel.model.js";
import { video } from "../models/Video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { channel } from "diagnostics_channel";
import { subscribers } from "../models/subscription.model.js";
import mongoose, { Schema } from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const userAcessToken = await user.generateAccessToken();
    const userRefreshToken = await user.generateRefreshToken();

    user.refreshToken = userRefreshToken;
    await user.save({ validateBeforeSave: false });
    return { userAcessToken, userRefreshToken };
  } catch (error) {
    throw new apiError(500, "Something went wrong.");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, password, userName } = req.body;

    if (
      [fullName, email, password, userName].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new apiError(400, "All Fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
      throw new apiError(409, "User is already registered!!");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
      throw new apiError(400, "Avatar is must required!");
    }

    const avatarUploadCloudinary = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUploadCloudinary = coverImageLocalPath
      ? await uploadOnCloudinary(coverImageLocalPath)
      : null;

    if (!avatarUploadCloudinary) {
      throw new apiError(500, "Something went wrong in Uploading!");
    }

    const user = await User.create({
      fullName,
      email,
      password,
      avatar: avatarUploadCloudinary.url,
      coverImage: coverImageUploadCloudinary?.url || "",
      userName: userName.toLowerCase(),
    });

    const newChannel = await Channel.create({
      avatar: avatarUploadCloudinary.url,
      coverImage: coverImageUploadCloudinary?.url || "",
      userName: user.userName,
      owner: user._id,
      subscriptions: [],
    });

    user.channel = newChannel._id;
    await user.save();

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new apiError(500, "Something went wrong in User registration!!");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(200, createdUser, "User Successfully Registered!!")
      );
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      throw new apiError(400, "Username or Email is required.");
    }

    const user = await User.findOne({
      $or: [
        { username: new RegExp(`^${username}$`, "i") },
        { email: new RegExp(`^${email}$`, "i") },
      ],
    });

    if (!user) {
      throw new apiError(404, "User does not exist.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new apiError(401, "Invalid credentials.");
    }

    let sessionId = user.sessionId;
    if (!sessionId) {
      sessionId = generateSessionId();
      user.sessionId = sessionId;
      await user.save();
    }
    // console.log("login session id", sessionId);

    const { userAcessToken, userRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", userAcessToken, options)
      .cookie("refreshToken", userRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { loggedInUser, userAcessToken, userRefreshToken, sessionId },
          "User is successfully logged in!"
        )
      );
  } catch (error) {
    console.error("Login Error:", error);
    throw new apiError(500, "Internal Server Error");
  }
});

const userLogOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const user = await User.findById(req.user._id);
  if (user) {
    user.sessionId = null;
    await user.save();
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loged Out!!"));
});

const newRefreshedToken = asyncHandler(async (req, res) => {
  const incomingRefreshedToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshedToken) {
    throw new apiError(400, "Error in generating accesstoken");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshedToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = User.findOne(decodedToken?._id);

    if (!user) {
      throw new apiError(400, "Unable to find user please register agian.");
    }

    if (incomingRefreshedToken !== user?.refreshToken) {
      throw new apiError(400, "Your session is expired please login again.");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { userAcessToken, userNewRefreshedToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", userAcessToken, options)
      .cookie("refreshToken", userNewRefreshedToken, options)
      .json(
        new ApiResponse(
          200,
          { userAcessToken, userNewRefreshedToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new apiError(
      400,
      error?.message || "Something went wrong in refreshing access token"
    );
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new apiError(400, "User is not found", user);
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(400, "Old password Invalid");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password is Successfully Changed!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched Successfully."));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, userName } = req.body;

  if (!fullName || !userName || !email) {
    throw new apiError(400, "User is not found.");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullName, email, userName: userName },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Account Updated Successfully!!"));
});

const updateAvatarImage = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "Path of avatar image is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new apiError(400, "Error in uploading file on Server Database.");
  }

  const user = await User.findByIdAndUpdate(
    req.User?._id,
    {
      $set: { avatar: avatar.url },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image uploded successfully."));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new apiError(400, "Path of cover image is missing.");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new apiError(400, "Error in uploading file on Server Database.");
  }

  const user = await User.findByIdAndUpdate(
    User.req?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image uploded successfully."));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  if (!userName?.trim()) {
    throw new apiError(400, "Username is not found.");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscribers",
        foreignField: "_id",
        localField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscribers",
        foreignField: "_id",
        localField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        subscribedChannelCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        userName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        subscribedChannelCount: 1,
        fullName: 1,
        isSubscribed: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new apiError(400, "Invalid channel search");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User detail Fetched Successfully!!")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("watchHistory")
      .populate({
        path: "watchHistory",
        model: "video",
        populate: { path: "owner", model: "User" },
      });

    if (!user || !user.watchHistory.length) {
      return res.status(404).json({
        status: 404,
        message: "No watch history found.",
      });
    }

    const uniqueVideos = [];
    const seenVideoIds = new Set();

    user.watchHistory.forEach((videoEntry) => {
      const videoId = videoEntry._id.toString();
      if (!seenVideoIds.has(videoId)) {
        uniqueVideos.push(videoEntry);
        seenVideoIds.add(videoId);
      }
    });

    return res.status(200).json({
      status: 200,
      data: uniqueVideos,
      message: "Watch history fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching watch history:", error);
    return res.status(500).json({
      status: 500,
      message: "An error occurred while fetching watch history.",
    });
  }
});

export {
  registerUser,
  loginUser,
  userLogOut,
  newRefreshedToken,
  updatePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatarImage,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
