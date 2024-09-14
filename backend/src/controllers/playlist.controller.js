import { playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { apiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";
import { video } from "../models/Video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new apiError(400, "All fields are required");
  }

  const newPlaylist = await playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  const createPlaylist = await playlist.findById(newPlaylist._id);
  if (!createPlaylist) {
    throw new apiError(500, "Something went wrong while creating new Playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, createPlaylist, "Playlist is created Successfully")
    );
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId?.trim()) {
    throw new apiError(400, "userId is missing");
  }
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "userId is invalid");
  }

  const allPlaylists = await playlist.find({
    owner: userId,
  });
  if (!allPlaylists) {
    throw new apiError(400, "something went wrong while fetching the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, allPlaylists, "All Playlist fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "playlistId is invalid");
  }

  const playlist = await playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(400, "Something went wrong while fetching the playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "playlistId is invalid");
  }

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "videoId is invalid");
  }

  const playlist = await playlist.findById(playlistId);
  const video = await video.findById(videoId);

  if (!playlist) {
    throw new apiError(400, "Playlist is not found");
  }
  if (!video) {
    throw new apiError(400, "Video is not found");
  }

  playlist.video.push(videoId);

  // Video add to playlist
  const updatedPlaylist = await playlist.save({ validateBeforeSave: false });

  if (!updatedPlaylist) {
    throw new apiError(
      400,
      "Something went wrong while adding video to playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "New video added to Playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "playlistId is invalid");
  }
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "videoId is invalid");
  }

  const playlist = await playlist.findById(playlistId);
  const video = await video.findById(videoId);
  if (!playlist) {
    throw new apiError(400, "Playlist is not found");
  }
  if (!video) {
    throw new apiError(400, "video is not found");
  }

  playlist.video.pull(videoId);

  //   Update the playlist
  const updatedPlaylist = await playlist.save({ validateBeforeSave: false });

  if (!updatedPlaylist) {
    throw new apiError(400, "Something went wrong while updating playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from Playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "playlistId is invalid");
  }

  const deletedPlaylist = await playlist.findByIdAndDelete(playlistId);
  if (!deletedPlaylist) {
    throw new apiError(500, "Something went wrong while deleting playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted Successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  console.log("id", playlistId);
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "playlistId is invalid");
  }
  if (!name || !description) {
    throw new apiError(400, "All fields are required");
  }

  const updatedPlaylist = await playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new apiError(400, "Something went wrong while updating playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist is Updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
