import { Router } from "express";
import {
  toggleSubscription,
  getSubscribedChannel,
  getUserChannelSubscribers,
  subscribeToChannel,
  unsubscribeFromChannel,
  checkSubscriptionStatus,
} from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.post("/toggle/:channelId", toggleSubscription);
router.get("/c/:channelId", getUserChannelSubscribers);
router.get("/u/subscribedChannels", getSubscribedChannel);
router.post("/subscribe/:userId", subscribeToChannel);
router.post("/unsubscribe/:userId", unsubscribeFromChannel);
router.get("/u/:channelId", checkSubscriptionStatus);

export default router;
