import { Router } from "express";
import {
  listTickets,
  getTicket,
  postTicket,
  patchTicket,
  removeTicket,
  postNote,
} from "../controllers/tickets.controller";

const router = Router();

router.get("/", listTickets);
router.post("/", postTicket);
router.get("/:id", getTicket);
router.put("/:id", patchTicket);
router.delete("/:id", removeTicket);
router.post("/:id/notes", postNote);

export default router;
