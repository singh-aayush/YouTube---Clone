import { Channel } from "../models/channel.model.js";

export const getChannelById = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: "videos",
      select: "views thumbnail title",
    });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.json({ data: channel });
  } catch (error) {
    console.error("Failed to fetch channel:", error);
    res.status(500).json({ message: "Server error" });
  }
};
