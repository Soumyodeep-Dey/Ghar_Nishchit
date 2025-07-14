import express from "express";
import { registerUser, loginUser, getUserDetails } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Register a New User
router.post("/register", registerUser);

// Login a User
router.post("/login", loginUser);

// Get User Details (protected)
router.get("/user", verifyToken, getUserDetails);

export default router;
