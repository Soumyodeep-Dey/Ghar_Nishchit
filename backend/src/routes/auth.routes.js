import express from "express";
import { registerUser, loginUser, getUserDetails, getProfile, updateProfile } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Register a New User
router.post("/register", registerUser);

// Login a User
router.post("/login", loginUser);

// Get User Details (protected)
router.get("/user", verifyToken, getUserDetails);

// Get User Profile (protected)
router.get("/profile", verifyToken, getProfile);

// Update User Profile (protected)
router.put("/profile", verifyToken, updateProfile);

export default router;  