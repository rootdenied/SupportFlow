import { Router } from "express";
import { classify } from "../controllers/ai.controller";

const router = Router();

router.post("/classify", classify);

export default router;
