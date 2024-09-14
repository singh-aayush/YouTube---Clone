import mongoose, { Schema } from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      ref: "User",
      required: false,
    },
    coverImage: {
      type: String,
      ref: "User",
      required: false,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    subscribers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    videos: {
      type: [Schema.Types.ObjectId],
      ref: "video",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Channel = mongoose.model("Channel", channelSchema);
