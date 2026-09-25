import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is missing!");
}

// Middleware to verify JWT
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    const verified = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(verified.userId).select("_id role status").lean();
    if (!user) {
      return res.status(401).json({ error: "Account no longer exists" });
    }
    if (["suspended", "banned"].includes(user.status)) {
      return res.status(403).json({ error: "Account is not active" });
    }
    req.user = { userId: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    console.error("Token verification error:", error.message); // Log scrubbed error
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  next();
};
