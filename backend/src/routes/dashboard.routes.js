import { Router } from "express";

import {
  getChannelStatus,
  getChannelVideo,
} from "../controllers/dashboard.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/stats").get(getChannelStatus);
router.route("/videos").get(getChannelVideo);

export default router;
