import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import propertyRoutes from "./routes/property.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import favouritesRoutes from "./routes/favourites.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import maintenanceRoutes from "./routes/maintenance.routes.js";
import inquiryRoutes from "./routes/inquiry.routes.js";

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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Root route for API status
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "API is running" });
});

app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favourites", favouritesRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/inquiries", inquiryRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

export { app };