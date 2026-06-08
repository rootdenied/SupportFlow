import { Router } from "express";
import authRoutes from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";
import ticketsRoutes from "./tickets.routes";
import customersRoutes from "./customers.routes";
import analyticsRoutes from "./analytics.routes";
import aiRoutes from "./ai.routes";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes (no auth required)
router.use("/auth", authRoutes);

// Health check (public)
router.get("/health", (_req, res) => {
  res.json({ success: true, message: "SupportFlow API is running 🚀", timestamp: new Date().toISOString() });
});

// Protected routes (auth required)
router.use("/dashboard", authMiddleware, dashboardRoutes);
router.use("/tickets", authMiddleware, ticketsRoutes);
router.use("/customers", authMiddleware, customersRoutes);
router.use("/analytics", authMiddleware, analyticsRoutes);
router.use("/ai", authMiddleware, aiRoutes);

export default router;
