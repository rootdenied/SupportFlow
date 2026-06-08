import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

export async function getDashboardStats() {
  const [total, open, inProgress, closed, recentTickets, statusDistribution] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "Open" } }),
    prisma.ticket.count({ where: { status: "In_Progress" } }),
    prisma.ticket.count({ where: { status: "Closed" } }),
    prisma.ticket.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } } },
    }),
    prisma.ticket.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  // Tickets per day (last 14 days)
  const ticketsPerDay = await Promise.all(
    Array.from({ length: 14 }).map(async (_, i) => {
      const day = dayjs().subtract(13 - i, "day");
      const start = day.startOf("day").toDate();
      const end = day.endOf("day").toDate();
      const [created, resolved] = await Promise.all([
        prisma.ticket.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.ticket.count({ where: { status: "Closed", updatedAt: { gte: start, lte: end } } }),
      ]);
      return {
        date: day.format("MMM D"),
        created,
        resolved,
      };
    })
  );

  const STATUS_COLORS: Record<string, string> = {
    Open: "var(--color-info)",
    In_Progress: "var(--color-warning)",
    Closed: "var(--color-success)",
  };

  return {
    stats: { total, open, inProgress, closed },
    statusDistribution: statusDistribution.map((s) => ({
      name: s.status.replace("_", " "),
      value: s._count.status,
      color: STATUS_COLORS[s.status] ?? "#888",
    })),
    recentTickets: recentTickets.map((t) => ({
      id: t.ticketNumber,
      dbId: t.id,
      subject: t.subject,
      customerName: t.customer.name,
      customerEmail: t.customer.email,
      priority: t.priority,
      status: t.status,
      category: t.category,
      createdAt: t.createdAt,
    })),
    ticketsPerDay,
  };
}
