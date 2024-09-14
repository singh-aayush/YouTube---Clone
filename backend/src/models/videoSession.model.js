import mongoose from "mongoose";

const videoSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

const VideoSession = mongoose.model("VideoSession", videoSessionSchema);

export default VideoSession;
