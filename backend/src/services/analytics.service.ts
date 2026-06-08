import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

export async function getAnalytics() {
  const [
    statusDistribution,
    categoryDistribution,
    priorityDistribution,
    monthlyTrends,
    csatTrends,
    resolutionTrends,
    totalCustomers,
    totalTickets,
    closedTickets,
  ] = await Promise.all([
    // Status distribution
    prisma.ticket.groupBy({
      by: ["status"],
      _count: { status: true },
    }),

    // Category distribution
    prisma.ticket.groupBy({
      by: ["category"],
      _count: { category: true },
    }),

    // Priority distribution
    prisma.ticket.groupBy({
      by: ["priority"],
      _count: { priority: true },
    }),

    // Monthly trends (last 12 months)
    Promise.all(
      Array.from({ length: 12 }).map(async (_, i) => {
        const month = dayjs().subtract(11 - i, "month");
        const start = month.startOf("month").toDate();
        const end = month.endOf("month").toDate();
        const [tickets, resolved] = await Promise.all([
          prisma.ticket.count({ where: { createdAt: { gte: start, lte: end } } }),
          prisma.ticket.count({ where: { status: "Closed", updatedAt: { gte: start, lte: end } } }),
        ]);
        return { month: month.format("MMM"), tickets, resolved };
      })
    ),

    // CSAT trends (mocked weekly scores based on closed tickets ratio)
    Promise.all(
      Array.from({ length: 8 }).map(async (_, i) => {
        const weekStart = dayjs().subtract(7 - i, "week").startOf("week").toDate();
        const weekEnd = dayjs().subtract(7 - i, "week").endOf("week").toDate();
        const [total, closed] = await Promise.all([
          prisma.ticket.count({ where: { createdAt: { gte: weekStart, lte: weekEnd } } }),
          prisma.ticket.count({ where: { status: "Closed", createdAt: { gte: weekStart, lte: weekEnd } } }),
        ]);
        const score = total > 0 ? Math.round((closed / total) * 40 + 60) : 75;
        return { week: `W${i + 1}`, score };
      })
    ),

    // Resolution time trends (mocked avg hours based on priority mix)
    Promise.all(
      Array.from({ length: 8 }).map(async (_, i) => {
        const weekStart = dayjs().subtract(7 - i, "week").startOf("week").toDate();
        const weekEnd = dayjs().subtract(7 - i, "week").endOf("week").toDate();
        const urgentCount = await prisma.ticket.count({
          where: { priority: "Urgent", createdAt: { gte: weekStart, lte: weekEnd } },
        });
        const hours = 6 + urgentCount * 2;
        return { week: `W${i + 1}`, hours: Math.min(hours, 24) };
      })
    ),

    // KPIs dependencies
    prisma.customer.count(),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "Closed" } }),
  ]);

  const STATUS_COLORS: Record<string, string> = {
    Open: "var(--color-info)",
    In_Progress: "var(--color-warning)",
    Closed: "var(--color-success)",
  };

  const resolutionRate = totalTickets > 0 ? ((closedTickets / totalTickets) * 100).toFixed(1) + "%" : "0%";
  
  // Calculate mock changes for UI flair
  const kpis = [
    { label: "Total Customers", value: totalCustomers.toLocaleString(), change: 6.2 },
    { label: "Total Tickets", value: totalTickets.toLocaleString(), change: 4.1 },
    { label: "Resolution Rate", value: resolutionRate, change: 1.8 },
    { label: "Avg Resolution Time", value: "4h 20m", change: -8.3 },
    { label: "CSAT Score", value: "4.8 / 5", change: 2.4 },
    { label: "First Response Time", value: "15m", change: -14.1 },
  ];

  return {
    statusDistribution: statusDistribution.map((s) => ({
      name: s.status.replace("_", " "),
      value: s._count.status,
      color: STATUS_COLORS[s.status] ?? "#888",
    })),
    categoryDistribution: categoryDistribution.map((c) => ({
      name: c.category.replace("_", " "),
      value: c._count.category,
    })),
    priorityDistribution: priorityDistribution.map((p) => ({
      name: p.priority,
      value: p._count.priority,
    })),
    monthlyTrends,
    csatTrends,
    resolutionTrends,
    kpis,
  };
}
