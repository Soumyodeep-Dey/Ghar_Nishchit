import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Secret key

// Middleware to verify JWT
export const verifyToken = (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    const authHeader = req.headers["authorization"];
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
      console.log('No auth header provided');
      return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    console.log('Token:', token);
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('Verified user:', verified);
    req.user = verified; // Attach user data to request
    next();
  } catch (error) {
    console.error("Token verification error:", error); // Log the error
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
