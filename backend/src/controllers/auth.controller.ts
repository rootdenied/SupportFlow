import { Request, Response, NextFunction } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { registerUser, loginUser, verifyToken } from "../services/auth.service";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = loginSchema.parse(req.body);
    const result = await loginUser(body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const body = registerSchema.parse(req.body);
    const result = await registerUser(body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }
    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);
    res.json({ success: true, data: { id: user.userId, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
}
