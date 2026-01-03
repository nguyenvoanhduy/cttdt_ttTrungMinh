import express from "express";
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CRUD endpoints với phân quyền
router.post("/", protectedRoute, authorizeRoles(["Admin","Trưởng Ban","Thành Viên"]), createDepartment);   // CREATE
router.get("/", getDepartments);                                                                          // READ ALL
router.get("/:id", getDepartmentById);                                                                    // READ ONE
router.put("/:id", protectedRoute, authorizeRoles(["Admin","Trưởng Ban","Thành Viên"]), updateDepartment); // UPDATE
router.delete("/:id", protectedRoute, authorizeRoles(["Admin"]), deleteDepartment);                       // DELETE

export default router;
