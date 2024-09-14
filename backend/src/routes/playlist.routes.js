import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import { verifyIsOwnerForPlaylist } from "../middlewares/verifyOwner.middleware.js";

const router = Router();
router.use(verifyJwt);

router.route("/").post(createPlaylist);

router
  .route("/:playlistId")
  .patch(verifyIsOwnerForPlaylist, updatePlaylist)
  .delete(verifyIsOwnerForPlaylist, deletePlaylist);
router
  .route("/remove/:videoId/:playlistId")
  .patch(verifyIsOwnerForPlaylist, removeVideoFromPlaylist); // left to debugg.
router
  .route("/add/:videoId/:playlistId")
  .patch(verifyIsOwnerForPlaylist, addVideoToPlaylist); // left to debugg.

router.route("/user/:userId").get(getUserPlaylist);

export default router;
