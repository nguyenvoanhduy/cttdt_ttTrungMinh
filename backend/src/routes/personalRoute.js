import express from "express";
import {
  createPersonal,
  getPersonals,
  getPersonalById,
  updatePersonal,
  deletePersonal,
  uploadAvatar,
} from "../controllers/personalController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Avatar upload endpoint
router.post("/avatar", protectedRoute, upload.single("avatar"), uploadAvatar);

// CRUD endpoints với phân quyền
router.post("/", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), createPersonal);   // CREATE
router.get("/", getPersonals);                                                               // READ ALL (Public)
router.get("/:id", getPersonalById);                                                          // READ ONE (Public)
router.put("/:id", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), updatePersonal); // UPDATE
router.delete("/:id", protectedRoute, authorizeRoles(["Admin"]), deletePersonal);           // DELETE

export default router;
