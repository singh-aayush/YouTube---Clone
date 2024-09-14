import mongoose, { Schema } from "mongoose";

const userPlaylist = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    videos: {
      type: Schema.Types.ObjectId,
      ref: "video",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const playlist = mongoose.model("playlist", userPlaylist);
