import mongoose, { Schema } from "mongoose";
import { User } from "../models/User.model.js";
import mongooseaggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoDetails = new Schema({
  videoFile: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
  ],
  channelId: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
  },
});

videoDetails.plugin(mongooseaggregatePaginate);

export const video = mongoose.model("video", videoDetails);
