import { Router } from "express";
import {
  createTweets,
  updatedTweets,
  getTweets,
  deleteTweets,
} from "../controllers/tweets.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { verifyIsOwnerForTweet } from "../middlewares/verifyOwner.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/").post(createTweets);
router
  .route("/:tweetId")
  .patch(verifyIsOwnerForTweet, updatedTweets)
  .delete(verifyIsOwnerForTweet, deleteTweets);

router.route("/user/:userId").get(getTweets);

export default router;
