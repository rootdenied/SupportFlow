import { Request, Response, NextFunction } from "express";
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  addNote,
} from "../services/tickets.service";
import {
  ticketQuerySchema,
  createTicketSchema,
  updateTicketSchema,
  createNoteSchema,
} from "../schemas/ticket.schema";

export async function listTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ticketQuerySchema.parse(req.query);
    const result = await getTickets(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await getTicketById(req.params.id as string);
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function postTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createTicketSchema.parse(req.body);
    const ticket = await createTicket(body);
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function patchTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const body = updateTicketSchema.parse(req.body);
    const ticket = await updateTicket(req.params.id as string, body);
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function removeTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await deleteTicket(req.params.id as string);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function postNote(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createNoteSchema.parse(req.body);
    const note = await addNote(req.params.id as string, body);
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}
