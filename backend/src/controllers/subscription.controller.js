import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { Channel } from "../models/channel.model.js";
import { apiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { subscribers } from "../models/subscription.model.js";
import { isValidObjectId } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!channelId?.trim()) throw new apiError(400, "Channel ID is missing");
    if (!isValidObjectId(channelId))
      throw new apiError(400, "Channel ID is invalid");

    const channelExists = await Channel.exists({ _id: channelId });
    const userExists = await User.exists({ _id: userId });

    if (!userExists) throw new apiError(400, "User does not exist");
    if (!channelExists) throw new apiError(400, "Channel does not exist");

    const channel = await Channel.findById(channelId);
    if (!channel) throw new apiError(400, "Channel does not exist");

    const channelOwnerId = channel.owner;

    if (userId.toString() === channelOwnerId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot subscribe to your own channel." });
    }

    const existingSubscription = await subscribers.findOne({
      channel: channelId,
      subscriber: userId,
    });

    if (existingSubscription) {
      // Unsubscribe logic
      await subscribers.deleteOne({ channel: channelId, subscriber: userId });
      await Channel.updateOne(
        { _id: channelId },
        { $pull: { subscribers: userId }, $inc: { subscriberCount: -1 } }
      );
      await User.updateOne(
        { _id: userId },
        { $pull: { subscriptions: channelId } }
      );
      await User.updateOne(
        { _id: channelOwnerId },
        { $inc: { subscribers: -1 } }
      );
    } else {
      // Subscribe logic
      await subscribers.create({
        channel: channelId,
        subscriber: userId,
      });
      await Channel.updateOne(
        { _id: channelId },
        { $addToSet: { subscribers: userId }, $inc: { subscriberCount: 1 } }
      );
      await User.updateOne(
        { _id: userId },
        { $addToSet: { subscriptions: channelId } }
      );
      await User.updateOne(
        { _id: channelOwnerId },
        { $inc: { subscribers: 1 } }
      );
    }

    const updatedChannel = await Channel.findById(channelId);
    const updatedSubscriberCount = updatedChannel.subscribers.length;

    return res.status(200).json({
      message: existingSubscription
        ? "Unsubscribed successfully"
        : "Subscribed successfully",
      subscriberCount: updatedSubscriberCount,
    });
  } catch (error) {
    console.error("Error in toggleSubscription:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId?.trim()) throw new apiError(400, "Channel ID is missing");
  if (!isValidObjectId(channelId))
    throw new apiError(400, "Channel ID is invalid");

  const totalSubscribers = await subscribers
    .find({ channel: channelId })
    .count();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        totalSubscribers,
        "Total subscribers fetched successfully"
      )
    );
});

const getSubscribedChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    if (!userId) return res.status(400).json({ message: "User ID is missing" });

    const channels = await subscribers
      .find({ subscriber: userId })
      .populate("channel", "userName avatar");

    if (!channels || channels.length === 0)
      return res.status(404).json({ message: "No subscribed channels found" });

    return res.status(200).json({
      data: channels,
      message: "Subscribed channels fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching subscribed channels:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const subscribeToChannel = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { channelId } = req.body;
    await Subscription.create({ userId, channelId });
    res.status(200).json({ message: "Subscribed" });
  } catch (error) {
    console.error("Failed to subscribe:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const unsubscribeFromChannel = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { channelId } = req.body;
    await Subscription.deleteOne({ userId, channelId });
    res.status(200).json({ message: "Unsubscribed" });
  } catch (error) {
    console.error("Failed to unsubscribe:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const checkSubscriptionStatus = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const subscription = await subscribers.findOne({
      subscriber: userId,
      channel: channelId,
    });
    if (subscription) {
      res.json({ message: "Subscribed" });
    } else {
      res.json({ message: "UnSubscribed" });
    }
  } catch (error) {
    console.error("Failed to check subscription status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export {
  toggleSubscription,
  getSubscribedChannel,
  getUserChannelSubscribers,
  subscribeToChannel,
  unsubscribeFromChannel,
  checkSubscriptionStatus,
};
