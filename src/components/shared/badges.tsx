import { cn } from "@/lib/utils";

export type TicketStatus = "Open" | "In Progress" | "Closed" | string;
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent" | string;
export type HealthStatus = "Active" | "At Risk" | "VIP" | string;

export function StatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, string> = {
    Open: "bg-info/10 text-info border-info/20",
    "In Progress": "bg-warning/15 text-warning border-warning/25",
    Closed: "bg-success/10 text-success border-success/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        map[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const map: Record<TicketPriority, string> = {
    Low: "bg-muted text-muted-foreground border-border",
    Medium: "bg-info/10 text-info border-info/20",
    High: "bg-warning/15 text-warning border-warning/25",
    Urgent: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        map[priority],
      )}
    >
      {priority}
    </span>
  );
}

export function HealthBadge({ health }: { health: HealthStatus }) {
  const map: Record<HealthStatus, string> = {
    Active: "bg-success/10 text-success border-success/20",
    "At Risk": "bg-destructive/10 text-destructive border-destructive/20",
    VIP: "bg-secondary/15 text-secondary border-secondary/25",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", map[health])}>
      <span className="size-1.5 rounded-full bg-current" />
      {health}
    </span>
  );
}
