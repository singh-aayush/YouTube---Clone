import mongoose, { Schema } from "mongoose";

const subscription = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const subscribers = mongoose.model("subscribers", subscription);
