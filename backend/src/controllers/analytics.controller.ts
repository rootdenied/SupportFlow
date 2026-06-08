import { Request, Response, NextFunction } from "express";
import { getAnalytics } from "../services/analytics.service";

export async function getAnalyticsData(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
