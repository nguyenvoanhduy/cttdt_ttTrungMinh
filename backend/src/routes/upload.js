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
      console.error("Multer/Cloudinary error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading file to Cloudinary"
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      // Verify it's a Cloudinary URL
      if (!req.file.path || !req.file.path.includes('cloudinary.com')) {
        console.error('Invalid Cloudinary URL:', req.file.path);
        return res.status(500).json({
          success: false,
          message: "Failed to upload to Cloudinary - invalid URL returned"
        });
      }

      console.log('File uploaded to Cloudinary successfully:', {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      // Return consistent response format with Cloudinary URL
      res.json({
        success: true,
        imageUrl: req.file.path,
        url: req.file.path,
        publicId: req.file.filename,
        message: 'File uploaded to Cloudinary successfully'
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading file to Cloudinary",
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
