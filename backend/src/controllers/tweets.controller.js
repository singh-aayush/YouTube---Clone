import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { tweet } from "../models/tweets.model.js";
import { apiError } from "../utils/ApiErrors.js";
import { User } from "../models/User.model.js";
import { isValidObjectId } from "mongoose";

const createTweets = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new apiError(400, "Content must be required");
  }

  const newTweet = await tweet.create({
    content,
    owner: req.user._id,
  });

  const postedTweet = await tweet.findById(newTweet?._id);
  if (!postedTweet) {
    throw new apiError(500, "Something went wrong while posting tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, postedTweet, "Tweet is Posted successfully"));
});

const updatedTweets = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId?.trim()) {
    throw new apiError(400, "TweetId is missing");
  }

  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Tweetid is invalid");
  }

  const { content } = req.body;

  if (!content) {
    throw new apiError(400, "The content is not availabe");
  }
  const updatedTweet = await tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) {
    throw new apiError(500, "Something went wrong in updating Tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const getTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId?.trim()) {
    throw new apiError(400, "UserId is missing");
  }

  if (!isValidObjectId(userId)) {
    throw new apiError(400, "UserId is invalid");
  }

  const tweets = await tweet.find({
    owner: userId,
  });

  if (!tweets) {
    throw new apiError(500, "Something went wrong while fetching Tweeets");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const deleteTweets = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId?.trim()) {
    throw new apiError(400, "TweetId is missing");
  }

  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "TweetId is invalid");
  }

  const deletedTweet = await tweet.findByIdAndDelete(tweetId);
  if (!deletedTweet) {
    throw new apiError(500, "Something went wrong while deleting tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet is successfully Deleted"));
});

export { createTweets, updatedTweets, getTweets, deleteTweets };
