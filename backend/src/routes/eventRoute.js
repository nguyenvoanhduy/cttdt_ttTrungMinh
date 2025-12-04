// routes/modelNameRoute.js
import express from "express";
import {
  createEvent,
  getEvents,
  getEventId,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CRUD endpoints với phân quyền
router.post("/", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), createEvent);   // CREATE
router.get("/", getEvents);                                                              // READ ALL
router.get("/:id", getEventId);                                                        // READ ONE
router.put("/:id", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), updateEvent); // UPDATE
router.delete("/:id", protectedRoute, authorizeRoles(["Admin"]), deleteEvent);           // DELETE

export default router;