import { Router } from "express";
import { healthChecker } from "../controllers/healthCheck.controller.js";

const router = Router();

router.route("/").get(healthChecker);

export default router;
