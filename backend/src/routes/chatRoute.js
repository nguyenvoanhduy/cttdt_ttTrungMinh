import express from "express";
import {
  sendMessage,
  adminReply,
  getMessagesBySession,
  getAllSessions,
  getSuggestedQuestions,
  deleteSession
} from "../controllers/chatController.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* USER */
router.post("/send", rateLimit, sendMessage);

/* ADMIN */
router.get("/sessions", protectedRoute, authorizeRoles(["Admin", "Trưởng Ban"]), getAllSessions);
router.post("/admin-reply", protectedRoute, authorizeRoles(["Admin", "Trưởng Ban"]), adminReply);
router.delete("/sessions/:sessionId", protectedRoute, authorizeRoles(["Admin", "Trưởng Ban"]), deleteSession);

/* HISTORY */
router.get("/session/:sessionId", getMessagesBySession);
router.get("/:sessionId", getMessagesBySession); // Alternative endpoint

/* SUGGESTIONS */
router.get("/suggestions", getSuggestedQuestions);

export default router;
