import { Request, Response, NextFunction } from "express";
import { getDashboardStats } from "../services/dashboard.service";

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getDashboardStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
