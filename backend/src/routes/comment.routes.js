import { Router } from "express";
import {
  getVideoComments,
  addComment,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { verifyIsOwnerForComment } from "../middlewares/verifyOwner.middleware.js";

const router = Router();

router.use(verifyJwt); // Apply VerifyJwt middleware to all routes.

router.route("/:videoId/comments").get(getVideoComments).post(addComment);
router
  .route("/c/:commentId")
  .delete(verifyIsOwnerForComment, deleteComment)
  .patch(verifyIsOwnerForComment, updateComment);

export default router;
