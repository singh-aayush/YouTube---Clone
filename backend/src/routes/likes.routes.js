import { Router } from "express";
import {
  toggleVidoLike,
  toggleCommetLike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/likes.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/toggle/v/:videoId").post(toggleVidoLike); // left debugg
router.route("/toggle/c/:commentId").post(toggleCommetLike); // left debugg
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/:videoId").get(getLikedVideos); // left debugg

export default router;
