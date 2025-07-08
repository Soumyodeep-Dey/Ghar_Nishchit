import express from "express";
import cors from "cors";
import dotenv from "dotenv";


dotenv.config(); // Load environment variables

const app = express();

// Middleware for CORS
app.use(
    cors({
        origin: [process.env.FRONTEND_URL, "http://localhost:5173"], // Allow live and local frontend
        credentials: true, // Allow cookies and credentials
    })
);

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));


export { app };
