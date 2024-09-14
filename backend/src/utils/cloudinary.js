import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!fs.existsSync(localFilePath)) {
      throw new apiError(400, "Video file does not exist.");
    }
    if (!localFilePath) return null;
    const uploadFile = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return uploadFile;
  } catch (error) {
    fs.unlinkSync(localFilePath); // compulsary to remove file from local file system....
    return null;
  }
};

const deleteFromCloudinary = async function (publidId) {
  try {
    if (!publidId) return null;

    const deleteResult = await cloudinary.uploader.destroy(publidId, {
      resource_type: "image",
    });
    return deleteResult;
  } catch (error) {
    console.log("Error while deleting from cloudinary", error);
    return null;
  }
};

const deleteVideoFromCloudinary = async function (publidId) {
  try {
    if (!publidId) return null;

    const deleteResult = await cloudinary.uploader.destroy(publidId, {
      resource_type: "video",
    });
    return deleteResult;
  } catch (error) {
    console.log("Error while deleting video from cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary };
