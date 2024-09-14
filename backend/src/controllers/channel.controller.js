import { Channel } from "../models/channel.model.js";

export const getChannelById = async (req, res) => {
  try {
    const { channelId } = req.params;

    // if (!channelId || !Channel.Types._id.isValid(channelId)) {
    //   return res.status(400).json({ message: "Invalid channel ID" });
    // }

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
