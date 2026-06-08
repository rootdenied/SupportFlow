import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Inbox,
  CircleDot,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Eye,
  Pencil,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge, PriorityBadge } from "@/components/shared/badges";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SupportFlow CRM" },
      { name: "description", content: "Real-time overview of support performance and ticket metrics." },
    ],
  }),
  component: Dashboard,
});

const toneStyles: Record<string, string> = {
  primary: "from-primary/15 to-primary/0 text-primary",
  info: "from-info/15 to-info/0 text-info",
  warning: "from-warning/20 to-warning/0 text-warning",
  success: "from-success/15 to-success/0 text-success",
};

function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();
  const [activeCard, setActiveCard] = useState<any>(null);

  if (isLoading || !data) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const { stats, statusDistribution, recentTickets: recent, ticketsPerDay } = data;

  const cards = [
    {
      key: "total",
      label: "Total Tickets",
      value: stats.total,
      change: 12.4,
      desc: "vs. last 30 days",
      icon: Inbox,
      tone: "primary",
    },
    {
      key: "open",
      label: "Open Tickets",
      value: stats.open,
      change: 3.1,
      desc: "Awaiting first reply",
      icon: CircleDot,
      tone: "info",
    },
    {
      key: "progress",
      label: "In Progress",
      value: stats.inProgress,
      change: -2.6,
      desc: "Being handled by agents",
      icon: Clock,
      tone: "warning",
    },
    {
      key: "closed",
      label: "Closed Tickets",
      value: stats.closed,
      change: 8.2,
      desc: "Resolved this period",
      icon: CheckCircle2,
      tone: "success",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Sarah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening across your support workspace today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl">Export report</Button>
          <Button asChild className="rounded-xl">
            <Link to="/tickets/create">New ticket</Link>
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const up = c.change >= 0;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCard(c)}
              className="group relative overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className={cn("absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-60", toneStyles[c.tone])} />
              <div className="relative flex items-start justify-between">
                <div className={cn("flex size-10 items-center justify-center rounded-xl bg-background/80 backdrop-blur shadow-soft", toneStyles[c.tone].split(" ").pop())}>
                  <Icon className="size-5" />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                    up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                  )}
                >
                  {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {Math.abs(c.change)}%
                </span>
              </div>
              <div className="relative mt-6">
                <p className="text-3xl font-bold tracking-tight">{c.value.toLocaleString()}</p>
                <p className="mt-1 text-sm font-medium">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2 rounded-2xl border p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Ticket Status</h3>
              <p className="text-xs text-muted-foreground">Distribution by current state</p>
            </div>
          </div>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="var(--color-background)"
                  strokeWidth={3}
                >
                  {statusDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-3 rounded-2xl border p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Tickets Created vs Resolved</h3>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
            </div>
            <div className="flex gap-1 rounded-lg border bg-muted/40 p-0.5 text-xs">
              {["7d", "14d", "30d"].map((r, i) => (
                <button
                  key={r}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium",
                    i === 1 ? "bg-card shadow-soft text-foreground" : "text-muted-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ticketsPerDay}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="created" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#cg)" />
                <Area type="monotone" dataKey="resolved" stroke="var(--color-success)" strokeWidth={2.5} fill="url(#rg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent tickets */}
      <Card className="rounded-2xl border shadow-soft">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="text-sm font-semibold">Recent Tickets</h3>
            <p className="text-xs text-muted-foreground">Latest activity from your inbox</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-lg">
            <Link to="/tickets">View all</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Ticket ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((t) => (
                <TableRow
                  key={t.id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } })}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.customerName}</TableCell>
                  <TableCell className="max-w-[280px] truncate">{t.subject}</TableCell>
                  <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } })}>
                          <Eye className="mr-2 size-4" />View
                        </DropdownMenuItem>
                        <DropdownMenuItem><Pencil className="mr-2 size-4" />Edit</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {recent.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    No recent tickets found. Your queue is completely clear!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Slide-over drawer */}
      <Sheet open={!!activeCard} onOpenChange={(o) => !o && setActiveCard(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {activeCard && (
            <>
              <SheetHeader>
                <SheetTitle>{activeCard.label}</SheetTitle>
                <SheetDescription>Detailed breakdown and weekly trend</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border bg-gradient-to-br from-accent to-background p-5">
                  <p className="text-xs text-muted-foreground">{activeCard.desc}</p>
                  <p className="mt-2 text-4xl font-bold tracking-tight">{activeCard.value.toLocaleString()}</p>
                  <p className={cn("mt-1 text-xs font-medium", activeCard.change >= 0 ? "text-success" : "text-destructive")}>
                    {activeCard.change >= 0 ? "+" : ""}{activeCard.change}% vs previous period
                  </p>
                </div>
                <div className="rounded-2xl border p-5">
                  <h4 className="text-sm font-semibold">Weekly trend</h4>
                  <div className="mt-3 h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ticketsPerDay.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                        <Line type="monotone" dataKey="created" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-2xl border p-5">
                  <h4 className="text-sm font-semibold">Quick actions</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="outline" className="rounded-xl" asChild>
                      <Link to="/tickets">View tickets</Link>
                    </Button>
                    <Button className="rounded-xl" asChild>
                      <Link to="/tickets/create">Create ticket</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
