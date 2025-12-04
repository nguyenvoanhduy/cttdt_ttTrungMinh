import express from "express";
import {
  createPersonal,
  getPersonals,
  getPersonalById,
  updatePersonal,
  deletePersonal,
} from "../controllers/personalController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CRUD endpoints với phân quyền
router.post("/", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), createPersonal);   // CREATE
router.get("/", getPersonals);                                                              // READ ALL
router.get("/:id", getPersonalById);                                                        // READ ONE
router.put("/:id", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), updatePersonal); // UPDATE
router.delete("/:id", protectedRoute, authorizeRoles(["Admin"]), deletePersonal);           // DELETE

export default router;
