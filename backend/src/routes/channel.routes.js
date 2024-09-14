// routes/channel.routes.js

import Router from "express";
import { getChannelById } from "../controllers/channel.controller.js";

const router = Router();

router.get("/:channelId", getChannelById); // This should match with the frontend request

export default router;
