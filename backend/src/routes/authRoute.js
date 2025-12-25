import express from "express";
import {
  register,
  logIn,
  logOut,
  getMe,
} from "../controllers/authController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", logIn);

router.post("/logout", logOut);

router.get("/me", protectedRoute, getMe);

export default router;
