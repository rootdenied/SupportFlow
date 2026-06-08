import { Request, Response, NextFunction } from "express";
import { getCustomers, getCustomerById } from "../services/customers.service";
import { customerQuerySchema } from "../schemas/ticket.schema";

export async function listCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = customerQuerySchema.parse(req.query);
    const result = await getCustomers(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await getCustomerById(req.params.id as string);
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
}
