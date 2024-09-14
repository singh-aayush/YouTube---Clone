import mongoose, { Schema } from "mongoose";

const likes = new Schema(
  {
    videos: {
      type: Schema.Types.ObjectId,
      ref: "video",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
    tweets: {
      type: Schema.Types.ObjectId,
      ref: "tweet",
    },
  },
  {
    timestamps: true,
  }
);

export const like = mongoose.model("like", likes);
