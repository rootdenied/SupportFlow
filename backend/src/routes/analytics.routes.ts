import { Router } from "express";
import { getAnalyticsData } from "../controllers/analytics.controller";

const router = Router();

router.get("/", getAnalyticsData);

export default router;
