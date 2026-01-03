// backend/src/routes/eventRoute.js
import express from "express";
import {
  createEvent,
  getEvents,
  getEventId,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getUserRegistrations,
  updateEventStatus,
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

// Registration routes
router.post("/:eventId/register", protectedRoute, registerForEvent);                    // REGISTER FOR EVENT
router.get("/registrations/me", protectedRoute, getUserRegistrations);                  // GET MY REGISTRATIONS

// Update event status
router.post("/update-status", updateEventStatus);                                       // UPDATE ALL EVENT STATUS

export default router;