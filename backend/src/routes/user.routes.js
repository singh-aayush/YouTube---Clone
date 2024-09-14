import Router from "express";
import {
  loginUser,
  registerUser,
  userLogOut,
  newRefreshedToken,
  getCurrentUser,
  updatePassword,
  updateAccountDetails,
  updateAvatarImage,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/users.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, userLogOut);
router.route("/refresh-token").post(newRefreshedToken);
router.route("/change-password").post(verifyJwt, updatePassword);
router.route("/get-current-user").post(verifyJwt, getCurrentUser);
router.route("/change-account-details").patch(verifyJwt, updateAccountDetails);
router
  .route("/avatar")
  .patch(verifyJwt, upload.single("avatar"), updateAvatarImage);
router
  .route("/cover-image")
  .patch(verifyJwt, upload.single("coverImage"), updateCoverImage);
router.route("/channel/:userName").get(verifyJwt, getUserChannelProfile);
router.route("/history").get(verifyJwt, getWatchHistory);

export default router;
