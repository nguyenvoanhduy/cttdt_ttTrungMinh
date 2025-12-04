import express from "express";
import {
  createTemple,
  getTemples,
  getTempleById,
  updateTemple,
  deleteTemple,
} from "../controllers/templeController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CRUD endpoints
router.post("/", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), createTemple);   // CREATE
router.get("/", getTemples);                                                              // READ ALL
router.get("/:id", getTempleById);                                                        // READ ONE
router.put("/:id", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), updateTemple); // UPDATE
router.delete("/:id", protectedRoute, authorizeRoles(["Admin"]), deleteTemple);           // DELETE

export default router;