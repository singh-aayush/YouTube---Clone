import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// router import
import routerUser from "./routes/user.routes.js";
import routerChannels from "./routes/channel.routes.js";
import routerVideo from "./routes/video.routes.js";
import routerTweet from "./routes/tweet.routes.js";
import routerSubscription from "./routes/subscription.routes.js";
import routerPlaylist from "./routes/playlist.routes.js";
import routerLikes from "./routes/likes.routes.js";
import routerHealthcheck from "./routes/healthcheck.routes.js";
import routerDashboard from "./routes/dashboard.routes.js";
import routerComment from "./routes/comment.routes.js";

// router decleration
app.use("/api/v1/users", routerUser);
app.use("/api/v1/channel", routerChannels);
app.use("/api/v1/video", routerVideo);
app.use("/api/v1/tweet", routerTweet);
app.use("/api/v1/subscription", routerSubscription);
app.use("/api/v1/playlist", routerPlaylist);
app.use("/api/v1/like", routerLikes);
app.use("/api/v1/health", routerHealthcheck);
app.use("/api/v1/dashboard", routerDashboard);
app.use("/api/v1/comment", routerComment);

export { app };
