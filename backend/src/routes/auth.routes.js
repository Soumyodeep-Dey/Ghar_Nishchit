import express from "express";
import { registerUser, loginUser, refreshAccessToken, getUserDetails, getProfile, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authRateLimit, writeRateLimit } from "../middlewares/rateLimit.middleware.js";
import { registerSchema, loginSchema, refreshSchema, changePasswordSchema } from "../validations/auth.validation.js";

const router = express.Router();

// Register a New User
router.post("/register", authRateLimit, validate(registerSchema), registerUser);

// Login a User
router.post("/login", authRateLimit, validate(loginSchema), loginUser);

// Refresh access token (no auth header required — uses refresh token body)
router.post("/refresh", authRateLimit, validate(refreshSchema), refreshAccessToken);

// Get User Details (protected)
router.get("/user", verifyToken, getUserDetails);

// Get User Profile (protected)
router.get("/profile", verifyToken, getProfile);

// Update User Profile (protected)
router.put("/profile", verifyToken, writeRateLimit, updateProfile);

router.post("/change-password", verifyToken, authRateLimit, validate(changePasswordSchema), changePassword);

export default router;
