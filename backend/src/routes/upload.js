import express from "express";
import upload from "../middlewares/upload.js";
import { 
  imageUpload, 
  audioUpload, 
  videoUpload, 
  documentUpload,
  handleUploadResponse 
} from "../service/uploadService.js";

const router = express.Router();

// Legacy endpoint for backward compatibility
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading file"
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      console.log('File uploaded successfully:', {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      });

      res.json({
        success: true,
        imageUrl: req.file.path,
        publicId: req.file.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: error.message
      });
    }
  });
});

// New dedicated endpoints
router.post("/image", (req, res, next) => {
  imageUpload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Image upload error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
    handleUploadResponse(req, res);
  });
});

router.post("/audio", (req, res, next) => {
  audioUpload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Audio upload error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
    handleUploadResponse(req, res);
  });
});

router.post("/video", (req, res, next) => {
  videoUpload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Video upload error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
    handleUploadResponse(req, res);
  });
});

router.post("/document", (req, res, next) => {
  documentUpload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Document upload error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
    handleUploadResponse(req, res);
  });
});

export default router;
