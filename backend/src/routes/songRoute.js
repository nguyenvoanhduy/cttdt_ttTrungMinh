import express from "express";
import {
  createSong,
  getSongs,
  getSongById,
  updateSong,
  deleteSong,
} from "../controllers/songController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CRUD endpoints với phân quyền
router.post("/", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), createSong);   // CREATE
router.get("/", getSongs);                                                              // READ ALL
router.get("/:id", getSongById);                                                        // READ ONE
router.put("/:id", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), updateSong); // UPDATE
router.delete("/:id", protectedRoute, authorizeRoles(["Admin"]), deleteSong);           // DELETE

export default router;
