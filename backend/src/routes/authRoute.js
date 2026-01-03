import express from "express";
import {
  register,
  logIn,
  logOut,
  getMe,
  changePassword,
} from "../controllers/authController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", logIn);

router.post("/logout", logOut);

router.get("/me", protectedRoute, getMe);

router.post("/change-password", protectedRoute, changePassword);

export default router;
