import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["Billing", "Technical", "Account", "General", "Bug", "Feature_Request"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  status: z.enum(["Open", "In_Progress", "Closed"]).optional().default("Open"),
  assignedTo: z.string().optional(),
  customerId: z.string().uuid("Invalid customer ID").optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
}).refine(data => data.customerId || data.customerEmail, {
  message: "Either customerId or customerEmail is required",
  path: ["customerId"]
});

export const updateTicketSchema = z.object({
  subject: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  category: z.enum(["Billing", "Technical", "Account", "General", "Bug", "Feature_Request"]).optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
  status: z.enum(["Open", "In_Progress", "Closed"]).optional(),
  assignedTo: z.string().optional(),
});

export const createNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  author: z.string().optional().default("Agent"),
});

export const ticketQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["Open", "In_Progress", "Closed", "all"]).optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent", "all"]).optional(),
  category: z.enum(["Billing", "Technical", "Account", "General", "Bug", "Feature_Request", "all"]).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "priority", "status"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const customerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type TicketQuery = z.infer<typeof ticketQuerySchema>;
export type CustomerQuery = z.infer<typeof customerQuerySchema>;
