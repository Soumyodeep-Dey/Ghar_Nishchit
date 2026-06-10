import express from "express";
import { registerUser, loginUser, refreshAccessToken, getUserDetails, getProfile, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Register a New User
router.post("/register", registerUser);

// Login a User
router.post("/login", loginUser);

// Refresh access token (no auth header required — uses refresh token body)
router.post("/refresh", refreshAccessToken);

// Get User Details (protected)
router.get("/user", verifyToken, getUserDetails);

// Get User Profile (protected)
router.get("/profile", verifyToken, getProfile);

// Update User Profile (protected)
router.put("/profile", verifyToken, updateProfile);

// Change Password (email + old password + new password)
router.post("/change-password", changePassword);

export default router;  