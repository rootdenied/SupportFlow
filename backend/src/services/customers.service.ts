import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import type { CustomerQuery } from "../schemas/ticket.schema";

const prisma = new PrismaClient();

function formatCustomer(c: any, ticketCount?: number) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone ?? "",
    company: c.company ?? "",
    avatar: c.avatar ?? c.name.split(" ").map((p: string) => p[0]).join(""),
    health: c.health.replace("_", " "),
    accountAge: c.accountAge ?? "1 year",
    totalTickets: ticketCount ?? c._count?.tickets ?? 0,
    lastTicketDate: c.tickets?.[0]?.createdAt ?? c.createdAt,
    createdAt: c.createdAt,
  };
}

export async function getCustomers(query: CustomerQuery) {
  const { page, limit, search } = query;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { company: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tickets: true } },
        tickets: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    data: customers.map((c) => formatCustomer(c, c._count.tickets)),
    pagination: {
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: { select: { tickets: true } },
      tickets: {
        orderBy: { createdAt: "desc" },
        include: { notes: false, activities: false },
      },
    },
  });

  if (!customer) throw ApiError.notFound(`Customer ${id} not found`);

  return {
    ...formatCustomer(customer, customer._count.tickets),
    tickets: customer.tickets.map((t) => ({
      id: t.ticketNumber,
      dbId: t.id,
      subject: t.subject,
      status: t.status.replace("_", " "),
      priority: t.priority,
      category: t.category.replace("_", " "),
      createdAt: t.createdAt,
    })),
  };
}
