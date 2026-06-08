import { PrismaClient, Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { classifyTicket } from "./ai.service";
import type { CreateTicketInput, UpdateTicketInput, CreateNoteInput, TicketQuery } from "../schemas/ticket.schema";

const prisma = new PrismaClient();

function generateTicketNumber(): string {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `TKT-${num}`;
}

function formatTicket(t: any) {
  return {
    id: t.ticketNumber,
    dbId: t.id,
    subject: t.subject,
    description: t.description,
    category: t.category.replace("_", " "),
    priority: t.priority,
    status: t.status.replace("_", " "),
    assignedTo: t.assignedTo ?? "Unassigned",
    customerId: t.customerId,
    customerName: t.customer?.name,
    customerEmail: t.customer?.email,
    aiCategory: t.aiCategory,
    aiPriority: t.aiPriority,
    aiSummary: t.aiSummary,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    notes: t.notes?.map((n: any) => ({
      id: n.id,
      content: n.content,
      author: n.author,
      avatar: n.avatar ?? n.author.split(" ").map((p: string) => p[0]).join(""),
      date: n.createdAt,
    })) ?? [],
    timeline: t.activities?.map((a: any) => ({
      id: a.id,
      type: a.type,
      text: a.action,
      actor: a.actor,
      date: a.createdAt,
    })) ?? [],
  };
}

export async function getTickets(query: TicketQuery) {
  const { page, limit, search, status, priority, category, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.TicketWhereInput = {
    ...(status && status !== "all" ? { status: status as any } : {}),
    ...(priority && priority !== "all" ? { priority: priority as any } : {}),
    ...(category && category !== "all" ? { category: category as any } : {}),
    ...(search
      ? {
          OR: [
            { ticketNumber: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { customer: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customer: { select: { name: true, email: true } },
        notes: { orderBy: { createdAt: "asc" } },
        activities: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    data: tickets.map(formatTicket),
    pagination: {
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    },
  };
}

export async function getTicketById(id: string) {
  const ticket = await prisma.ticket.findFirst({
    where: { OR: [{ id }, { ticketNumber: id }] },
    include: {
      customer: true,
      notes: { orderBy: { createdAt: "asc" } },
      activities: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!ticket) throw ApiError.notFound(`Ticket ${id} not found`);
  return formatTicket(ticket);
}

export async function createTicket(data: any) {
  // Find or create customer
  let customer;
  if (data.customerId) {
    customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
  } else if (data.customerEmail) {
    customer = await prisma.customer.findUnique({ where: { email: data.customerEmail } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.customerName || "Unknown Customer",
          email: data.customerEmail,
        }
      });
    }
  }
  
  if (!customer) throw ApiError.badRequest("Customer details are required");

  // AI classification
  const ai = await classifyTicket(data.subject, data.description);
  const aiCategory = ai.category.replace(" ", "_");
  const aiPriority = ai.priority;

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: generateTicketNumber(),
      subject: data.subject,
      description: data.description,
      category: data.category as any,
      priority: data.priority as any,
      status: (data.status ?? "Open") as any,
      assignedTo: data.assignedTo,
      customerId: customer.id,
      aiCategory: ai.category,
      aiPriority: ai.priority,
      aiSummary: ai.summary,
      activities: {
        create: [
          {
            action: "Ticket created",
            actor: customer.name,
            type: "created",
          },
        ],
      },
    },
    include: {
      customer: { select: { name: true, email: true } },
      notes: true,
      activities: { orderBy: { createdAt: "asc" } },
    },
  });

  return formatTicket(ticket);
}

export async function updateTicket(id: string, data: UpdateTicketInput) {
  const existing = await prisma.ticket.findFirst({
    where: { OR: [{ id }, { ticketNumber: id }] },
    include: { customer: { select: { name: true } } },
  });
  if (!existing) throw ApiError.notFound(`Ticket ${id} not found`);

  const activities: Prisma.ActivityCreateManyTicketInput[] = [];
  if (data.status && data.status !== existing.status) {
    activities.push({
      action: `Status changed to ${data.status.replace("_", " ")}`,
      actor: "Agent",
      type: "status",
    });
  }

  const ticket = await prisma.ticket.update({
    where: { id: existing.id },
    data: {
      ...(data.subject ? { subject: data.subject } : {}),
      ...(data.description ? { description: data.description } : {}),
      ...(data.category ? { category: data.category as any } : {}),
      ...(data.priority ? { priority: data.priority as any } : {}),
      ...(data.status ? { status: data.status as any } : {}),
      ...(data.assignedTo !== undefined ? { assignedTo: data.assignedTo } : {}),
      ...(activities.length > 0
        ? { activities: { createMany: { data: activities } } }
        : {}),
    },
    include: {
      customer: { select: { name: true, email: true } },
      notes: { orderBy: { createdAt: "asc" } },
      activities: { orderBy: { createdAt: "asc" } },
    },
  });

  return formatTicket(ticket);
}

export async function deleteTicket(id: string) {
  const existing = await prisma.ticket.findFirst({
    where: { OR: [{ id }, { ticketNumber: id }] },
  });
  if (!existing) throw ApiError.notFound(`Ticket ${id} not found`);
  await prisma.ticket.delete({ where: { id: existing.id } });
  return { message: "Ticket deleted successfully" };
}

export async function addNote(ticketId: string, data: CreateNoteInput) {
  const existing = await prisma.ticket.findFirst({
    where: { OR: [{ id: ticketId }, { ticketNumber: ticketId }] },
  });
  if (!existing) throw ApiError.notFound(`Ticket ${ticketId} not found`);

  const [note] = await Promise.all([
    prisma.note.create({
      data: {
        content: data.content,
        author: data.author ?? "Agent",
        avatar: (data.author ?? "Agent").split(" ").map((p) => p[0]).join(""),
        ticketId: existing.id,
      },
    }),
    prisma.activity.create({
      data: {
        action: "Internal note added",
        actor: data.author ?? "Agent",
        type: "note",
        ticketId: existing.id,
      },
    }),
  ]);

  return {
    id: note.id,
    content: note.content,
    author: note.author,
    avatar: note.avatar,
    date: note.createdAt,
  };
}
