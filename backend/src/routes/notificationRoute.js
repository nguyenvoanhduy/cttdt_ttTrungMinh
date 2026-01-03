import express from "express";
import {
  createNotification,
  getAllNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
} from "../controllers/notificationController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/", protectedRoute, authorizeRoles(["Admin", "Trưởng Ban"]), createNotification);
router.get("/all", protectedRoute, authorizeRoles(["Admin"]), getAllNotifications);
router.get("/stats", protectedRoute, authorizeRoles(["Admin"]), getNotificationStats);

// User routes
router.get("/me", protectedRoute, getMyNotifications);
router.put("/:id/read", protectedRoute, markAsRead);
router.put("/read-all", protectedRoute, markAllAsRead);
router.delete("/:id", protectedRoute, deleteNotification);

export default router;
