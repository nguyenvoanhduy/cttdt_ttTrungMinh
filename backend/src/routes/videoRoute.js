import express from "express";
import {
  createVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
} from "../controllers/videoController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CRUD endpoints with role protections similar to songs/books
router.post("/", protectedRoute, authorizeRoles(["Admin","Trưởng Ban","Thành Viên"]), createVideo);
router.get("/", getVideos);
router.get("/:id", getVideoById);
router.put("/:id", protectedRoute, authorizeRoles(["Admin","Trưởng Ban","Thành Viên"]), updateVideo);
router.delete("/:id", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), deleteVideo);

export default router;
