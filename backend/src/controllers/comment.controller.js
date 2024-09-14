import { comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate videoId
  if (!videoId?.trim()) {
    return res.status(400).json({ message: "VideoId is missing" });
  }

  if (!isValidObjectId(videoId)) {
    return res.status(400).json({ message: "VideoId is invalid" });
  }

  try {
    const allComments = await comment
      .find({ video: videoId })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .populate({
        path: "owner",
        select: "avatar fullName", // Specify the fields you need
      })
      .exec();

    return res.status(200).json({
      statuscode: 200,
      data: allComments,
      message: "All comments fetched successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new apiError(400, "videoId is missing");
  }

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "videoId is invalid");
  }

  const { content } = req.body;

  const newComment = await comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  await newComment.save();

  const createdComment = await comment
    .findById(newComment._id)
    .populate("owner", "avatar fullName");

  if (!createdComment) {
    throw new apiError(500, "Something went wrong while adding comment");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, createdComment, "Comment is added successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId?.trim()) {
    throw new apiError(400, "userCommentId is missing");
  }
  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "userCommentId is invalid");
  }

  const { content } = req.body;
  if (!content) {
    throw new apiError(400, "The message is missing");
  }

  try {
    // Perform the update operation
    const updatedComment = await comment
      .findByIdAndUpdate(
        commentId,
        {
          $set: { content },
        },
        { new: true }
      )
      .populate("owner");

    // Return the response
    return res.status(200).json({
      success: true,
      data: updatedComment,
      message: "Comment is updated successfully",
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update comment",
    });
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  console.log("user id", commentId);
  if (!commentId?.trim()) {
    throw new apiError(400, "userCommentId is missing");
  }

  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "userCommentId is invalid");
  }

  const deletedComment = await comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new apiError(500, "Something went wrong while deleting comments");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment is deleted Successfully"));
});

export { getVideoComments, addComment, deleteComment, updateComment };
