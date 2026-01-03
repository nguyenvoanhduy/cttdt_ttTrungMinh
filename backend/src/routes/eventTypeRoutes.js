// backend/src/routes/eventTypeRoutes.js
import express from "express";
import {
  createEventType,
  getEventTypes,
  getEventTypeById,
  updateEventType,
  deleteEventType,
} from "../controllers/eventTypeController.js";

import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ================= CRUD EventType =================

// CREATE – Admin + Trưởng Ban
router.post(
  "/",
  protectedRoute,
  authorizeRoles(["Admin", "Trưởng Ban"]),
  createEventType
);

// READ ALL – public
router.get("/", getEventTypes);

// READ ONE – public
router.get("/:id", getEventTypeById);

// UPDATE – Admin + Trưởng Ban
router.put(
  "/:id",
  protectedRoute,
  authorizeRoles(["Admin", "Trưởng Ban"]),
  updateEventType
);

// DELETE – CHỈ Admin
router.delete(
  "/:id",
  protectedRoute,
  authorizeRoles(["Admin"]),
  deleteEventType
);

export default router;
