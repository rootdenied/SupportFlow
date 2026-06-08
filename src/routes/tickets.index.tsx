import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, PriorityBadge } from "@/components/shared/badges";
import { useTickets, useTicket, useUpdateTicket, useAddNote } from "@/hooks/useTickets";
import { toast } from "sonner";

export const Route = createFileRoute("/tickets/")({
  head: () => ({
    meta: [
      { title: "Tickets — SupportFlow CRM" },
      { name: "description", content: "Manage and triage your customer support tickets." },
    ],
  }),
  component: TicketsPage,
});

const PAGE_SIZE = 10;

function TicketsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<any | null>(null);

  const { data, isLoading } = useTickets({
    page,
    limit: PAGE_SIZE,
    search: query,
    status: status === "all" ? undefined : status.replace(" ", "_"),
    priority: priority === "all" ? undefined : priority,
    category: category === "all" ? undefined : category.replace(" ", "_"),
  });

  const paged = data?.data ?? [];
  const pageCount = data?.pagination?.pageCount ?? 1;
  const totalItems = data?.pagination?.total ?? 0;
  const allChecked = paged.length > 0 && paged.every((t) => selected.has(t.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleAll() {
    setSelected((prev) => {
      const n = new Set(prev);
      if (allChecked) paged.forEach((t) => n.delete(t.id));
      else paged.forEach((t) => n.add(t.id));
      return n;
    });
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalItems.toLocaleString()} tickets found
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border shadow-soft">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by ID, subject, customer…"
              className="h-9 rounded-xl pl-9"
            />
          </div>
          <FilterSelect value={status} onChange={setStatus} placeholder="Status" options={["Open", "In Progress", "Closed"]} />
          <FilterSelect value={priority} onChange={setPriority} placeholder="Priority" options={["Low", "Medium", "High", "Urgent"]} />
          <FilterSelect value={category} onChange={setCategory} placeholder="Category" options={["Billing", "Technical", "Account", "General", "Bug", "Feature Request"]} />
          <Button variant="outline" size="sm" className="h-9 rounded-xl" onClick={() => toast.success("Export started")}>
            <Download className="mr-1.5 size-4" />Export
          </Button>
          <Button size="sm" className="h-9 rounded-xl" asChild>
            <Link to="/tickets/create"><Plus className="mr-1.5 size-4" />Create</Link>
          </Button>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 border-b bg-accent/60 px-4 py-2.5 text-sm">
            <span className="font-medium">{selected.size} selected</span>
            <Separator orientation="vertical" className="h-4" />
            <Button size="sm" variant="ghost" className="h-7 rounded-md" onClick={() => toast.success("Marked closed")}>Mark closed</Button>
            <Button size="sm" variant="ghost" className="h-7 rounded-md" onClick={() => toast.success("Reassigned")}>Reassign</Button>
            <Button size="sm" variant="ghost" className="h-7 rounded-md text-destructive" onClick={() => toast.error("Tickets deleted")}>Delete</Button>
            <Button size="sm" variant="ghost" className="ml-auto h-7 rounded-md" onClick={() => setSelected(new Set())}>
              <X className="size-3.5" />
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 sticky top-0">
                <TableHead className="w-10">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((t) => (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => setActive(t)}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggle(t.id)} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-[10px] font-semibold text-primary-foreground">
                          {t.customerName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <p className="text-sm font-medium">{t.customerName}</p>
                        <p className="text-[11px] text-muted-foreground">{t.customerEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate">{t.subject}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.category}</TableCell>
                  <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setActive(t)}><Eye className="mr-2 size-4" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } })}>
                          <Pencil className="mr-2 size-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => toast.error("Ticket deleted")}>
                          <Trash2 className="mr-2 size-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                    No tickets match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t p-3">
          <p className="text-xs text-muted-foreground">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" className="size-8 rounded-lg" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button size="icon" variant="outline" className="size-8 rounded-lg" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <TicketDrawer ticket={active} onClose={() => setActive(null)} />
    </div>
  );
}

function FilterSelect({
  value, onChange, placeholder, options,
}: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[140px] rounded-xl">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder.toLowerCase()}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function TicketDrawer({ ticket: initialTicket, onClose }: { ticket: any | null; onClose: () => void }) {
  const { data: fullTicket } = useTicket(initialTicket?.id ?? "");
  const ticket = fullTicket ?? initialTicket;

  const [note, setNote] = useState("");
  const updateTicket = useUpdateTicket();
  const addNote = useAddNote();

  function handleStatusUpdate(newStatus: string) {
    if (!ticket) return;
    updateTicket.mutate({ id: ticket.id, data: { status: newStatus.replace(" ", "_") } }, {
      onSuccess: () => {
        toast.success("Status updated");
        onClose();
      }
    });
  }

  function handleAddNote() {
    if (!ticket || !note) return;
    addNote.mutate({ ticketId: ticket.id, data: { content: note } }, {
      onSuccess: () => {
        toast.success("Note added");
        setNote("");
        onClose();
      }
    });
  }
  return (
    <Sheet open={!!ticket} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {ticket && (
          <div>
            <div className="border-b bg-gradient-to-br from-accent/60 to-background p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{ticket.id}</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">{ticket.subject}</h2>
                  <div className="mt-3 flex items-center gap-2">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <span className="text-xs text-muted-foreground">· {ticket.category}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <Card className="rounded-2xl border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</h4>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-foreground">
                      {ticket.customerName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ticket.customerName}</p>
                    <p className="text-xs text-muted-foreground">{ticket.customerEmail}</p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Issue</h4>
                <p className="mt-2 text-sm leading-relaxed">{ticket.description}</p>
              </Card>

              <Card className="rounded-2xl border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity Timeline</h4>
                <ol className="mt-3 space-y-3">
                  {ticket.timeline.map((e) => (
                    <li key={e.id} className="flex gap-3">
                      <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm">{e.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.actor} · {new Date(e.date).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card className="rounded-2xl border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</h4>
                <div className="mt-3 space-y-3">
                  {ticket.notes.map((n) => (
                    <div key={n.id} className="rounded-xl border bg-muted/30 p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">{n.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold">{n.author}</span>
                        <span className="text-xs text-muted-foreground">· {new Date(n.date).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-2 text-sm">{n.content}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="rounded-xl" />
                  <Button size="sm" className="rounded-lg" onClick={handleAddNote}>Add note</Button>
                </div>
              </Card>

              <Card className="rounded-2xl border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status update</h4>
                <div className="mt-3 flex gap-2">
                  <Select defaultValue={ticket.status} onValueChange={handleStatusUpdate}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
