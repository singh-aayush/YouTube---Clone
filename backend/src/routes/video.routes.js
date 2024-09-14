import { Router } from "express";
import {
  getAllVideo,
  publishVideo,
  getVedioById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  trackVideoView,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { verifyIsOwnerForVideo } from "../middlewares/verifyOwner.middleware.js";

const router = Router();

router.use(verifyJwt);
router
  .route("/")
  .get(getAllVideo)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishVideo
  );

router
  .route("/:videoId")
  .get(getVedioById)
  .delete(verifyIsOwnerForVideo, deleteVideo)
  .patch(upload.single("thumbnail"), verifyIsOwnerForVideo, updateVideo);

router
  .route("/toggle/publish/:videoId")
  .patch(verifyIsOwnerForVideo, togglePublishStatus);

router.route("/views").post(trackVideoView);

export default router;
