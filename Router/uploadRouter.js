import express from "express";
import multer from "multer";
import {
  deleteMediaFromCloudinary,
  uploadMediaToCloudinary,
} from "../config/cloudinaryConfig.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utility/reponseHelper.js";

const uploadRouter = express.Router();

// Create an instance of multer storage
const upload = multer({ dest: "uploads/" });

// POST | upload a file | create
uploadRouter.post("/", upload.single("file"), async (req, res) => {
  try {
    // Check if the file exists
    if (!req.file) {
      return buildErrorResponse(res, "No file provided", 400);
    }
    // Upload the file to Cloudinary
    const result = await uploadMediaToCloudinary(req.file.path);

    buildSuccessResponse(res, result, "file uploaded successfully");
  } catch (e) {
    console.error(e);
    buildErrorResponse(res, "error uploading  file");
  }
});

// DELETE | delete a file | delete
uploadRouter.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the id exists
    if (!id) {
      return buildErrorResponse(res, "No id provided");
    }

    // Delete the file from Cloudinary
    const result = await deleteMediaFromCloudinary(id);
    if (result) {
      return buildSuccessResponse(res, {}, "video removed successfully!!");
    }
  } catch (e) {
    console.error(e);
    buildErrorResponse(res, "error deleting file");
  }
});

export default uploadRouter;
