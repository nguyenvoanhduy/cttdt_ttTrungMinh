import express from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CRUD endpoints với phân quyền
router.post("/", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), createBook);   // CREATE
router.get("/", getBooks);                                                              // READ ALL
router.get("/:id", getBookById);                                                        // READ ONE
router.put("/:id", protectedRoute, authorizeRoles(["Admin","Trưởng Ban"]), updateBook); // UPDATE
router.delete("/:id", protectedRoute, authorizeRoles(["Admin"]), deleteBook);           // DELETE

export default router;
