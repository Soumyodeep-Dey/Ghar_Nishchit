import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { query as neonQuery } from "../db/neon.js";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// ── NeonDB Sync Helpers ───────────────────────────────────────────────────────
// Silently syncs a user upsert to NeonDB; never throws — MongoDB is primary.
const syncUserToNeon = async (user) => {
  try {
    await neonQuery(
      `INSERT INTO users (id, name, phone, email, role, password, profile_picture, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         name            = EXCLUDED.name,
         phone           = EXCLUDED.phone,
         email           = EXCLUDED.email,
         password        = EXCLUDED.password,
         profile_picture = EXCLUDED.profile_picture`,
      [
        user._id.toString(),
        user.name,
        user.phone,
        user.email || null,
        user.role,
        user.password,
        user.profilePicture || '',
        user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      ]
    );
  } catch (e) {
    // Log but never crash — MongoDB is source of truth during dual-write phase
    console.warn('[NeonDB] user sync warning:', e.message);
  }
};

// Register a New User
export const registerUser = async (req, res) => {
  try {
    const { name, phone, email, role, password } = req.body;

    // Validate required fields
    if (!name || !phone || !role || !password) {
      return res.status(400).json({ error: "All fields (name, phone, role, password) are required" });
    }

    // Check if user already exists by email or phone
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already registered" });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ error: "Phone already registered" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to MongoDB
    const newUser = new User({ name, phone, email, role, password: hashedPassword });
    await newUser.save();

    // Dual-write: sync to NeonDB (non-blocking)
    await syncUserToNeon(newUser);

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });

    // Return user data without password
    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role
    };

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: userData
    });
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login a User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData
    });
  } catch (error) {
    console.error("Error in user login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get User Details
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, password, profilePicture } = req.body;
    const userId = req.user.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
    }

    // Check if phone is being changed and if it's already taken
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ error: "Phone number already registered" });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (profilePicture) updateData.profilePicture = profilePicture;

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    // Dual-write: sync full user (re-fetch with password for NeonDB)
    const fullUser = await User.findById(userId);
    if (fullUser) await syncUserToNeon(fullUser);

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Change password using email and old password (no auth token required)
export const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "email, oldPassword and newPassword are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const matches = await bcrypt.compare(oldPassword, user.password);
    if (!matches) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // Dual-write: sync updated password to NeonDB
    await syncUserToNeon(user);

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ error: "Failed to change password" });
  }
};