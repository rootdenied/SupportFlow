import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HealthBadge, StatusBadge } from "@/components/shared/badges";
import { useCustomers, useCustomer } from "@/hooks/useCustomers";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — SupportFlow CRM" },
      { name: "description", content: "Manage your customer relationships and view ticket history." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<any | null>(null);
  const { data, isLoading } = useCustomers({ search: query, page, limit: 50 });
  const filtered = data?.data ?? [];
  const totalCustomers = data?.pagination?.total ?? 0;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{totalCustomers} customers found</p>
        </div>
        <Button className="rounded-xl">Add customer</Button>
      </div>

      <Card className="rounded-2xl border shadow-soft">
        <div className="border-b p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers…" className="h-9 rounded-xl pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Total Tickets</TableHead>
                <TableHead>Last Ticket</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => setActive(c)}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-[11px] font-semibold text-primary-foreground">{c.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-sm">{c.company}</TableCell>
                  <TableCell className="font-mono text-sm">{c.totalTickets}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(c.lastTicketDate).toLocaleDateString()}</TableCell>
                  <TableCell><HealthBadge health={c.health} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CustomerDrawer customer={active} onClose={() => setActive(null)} />
    </div>
  );
}

function CustomerDrawer({ customer, onClose }: { customer: any | null; onClose: () => void }) {
  const { data: fullCustomer, isLoading } = useCustomer(customer?.id ?? "");
  const displayCustomer = fullCustomer ?? customer;
  return (
    <Sheet open={!!customer} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {displayCustomer && (
          <div>
            <div className="border-b bg-gradient-to-br from-accent/60 to-background p-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-lg font-semibold text-primary-foreground">{displayCustomer.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{displayCustomer.name}</h2>
                  <p className="text-sm text-muted-foreground">{displayCustomer.email}</p>
                  <div className="mt-2"><HealthBadge health={displayCustomer.health} /></div>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <Card className="rounded-2xl border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overview</h4>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <Info label="Phone" value={displayCustomer.phone} />
                  <Info label="Company" value={displayCustomer.company} />
                  <Info label="Account age" value={displayCustomer.accountAge} />
                  <Info label="Total tickets" value={String(displayCustomer.totalTickets)} />
                </div>
              </Card>

              <Card className="rounded-2xl border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ticket history</h4>
                <div className="mt-3 space-y-2">
                  {displayCustomer.tickets?.slice(0, 6).map((t: any) => (
                    <Link
                      key={t.id}
                      to="/tickets/$ticketId"
                      params={{ ticketId: t.id }}
                      className="flex items-center justify-between rounded-xl border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] text-muted-foreground">{t.id}</p>
                        <p className="truncate text-sm font-medium">{t.subject}</p>
                      </div>
                      <StatusBadge status={t.status} />
                    </Link>
                  ))}
                  {(!displayCustomer.tickets || displayCustomer.tickets.length === 0) && (
                    <p className="text-sm text-muted-foreground">No tickets yet.</p>
                  )}
                </div>
              </Card>

              <Card className="rounded-2xl border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Previous interactions</h4>
                <ol className="mt-4 space-y-4">
                  {[
                    { t: "Email reply sent", d: "2 days ago", desc: "Sent invoice clarification" },
                    { t: "Onboarding call", d: "1 week ago", desc: "Walked through workspace setup" },
                    { t: "Note added", d: "3 weeks ago", desc: "Customer prefers async support" },
                  ].map((e, i) => (
                    <li key={i} className="relative pl-6">
                      <span className="absolute left-0 top-1.5 size-3 rounded-full border-2 border-primary bg-background" />
                      <p className="text-sm font-medium">{e.t}</p>
                      <p className="text-xs text-muted-foreground">{e.d} · {e.desc}</p>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
