import { Request, Response, NextFunction } from "express";
import { classifyTicket } from "../services/ai.service";
import { z } from "zod";

const classifySchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1),
});

export async function classify(req: Request, res: Response, next: NextFunction) {
  try {
    const { subject, description } = classifySchema.parse(req.body);
    const classification = await classifyTicket(subject, description);
    res.json({ success: true, data: classification });
  } catch (err) {
    next(err);
  }
}
