import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is missing!");
}

// Middleware to verify JWT
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach user data to request
    next();
  } catch (error) {
    console.error("Token verification error:", error.message); // Log scrubbed error
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
