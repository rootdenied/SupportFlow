import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil, UserPlus, Paperclip } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, PriorityBadge } from "@/components/shared/badges";
import { useTicket, useUpdateTicket, useAddNote } from "@/hooks/useTickets";
import { toast } from "sonner";

export const Route = createFileRoute("/tickets/$ticketId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.ticketId} — SupportFlow CRM` },
      { name: "description", content: "Ticket details, activity timeline, and team notes." },
    ],
  }),
  component: TicketDetailsPage,
  notFoundComponent: () => (
    <p className="text-sm text-muted-foreground">Ticket not found.</p>
  ),
});

function TicketDetailsPage() {
  const { ticketId } = Route.useParams();
  const navigate = useNavigate();
  const { data: ticket, isLoading } = useTicket(ticketId);
  const updateTicket = useUpdateTicket();
  const addNoteMutation = useAddNote();
  const [note, setNote] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">Ticket {ticketId} not found.</p>
        <Button asChild className="mt-4 rounded-xl"><Link to="/tickets">Back to tickets</Link></Button>
      </div>
    );
  }

  const handleStatusUpdate = (newStatus: string) => {
    updateTicket.mutate({ id: ticket.id, data: { status: newStatus.replace(" ", "_") } }, {
      onSuccess: () => toast.success(`Status updated to ${newStatus}`)
    });
  };

  const handleAddNote = () => {
    if (!note) return;
    addNoteMutation.mutate({ ticketId: ticket.id, data: { content: note } }, {
      onSuccess: () => {
        toast.success("Note saved");
        setNote("");
      }
    });
  };

  const customer = {
    name: ticket.customerName,
    email: ticket.customerEmail,
    phone: "N/A", // If phone/company are added later
    company: "N/A",
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => navigate({ to: "/tickets" })}>
        <ArrowLeft className="mr-1.5 size-4" />Back to tickets
      </Button>

      <Card className="rounded-2xl border bg-gradient-to-br from-accent/40 to-background p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">{ticket.id}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="text-xs text-muted-foreground">· {ticket.category} · Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl"><Pencil className="mr-1.5 size-4" />Edit</Button>
            <Button className="rounded-xl"><UserPlus className="mr-1.5 size-4" />Assign agent</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="rounded-2xl border p-5">
            <h3 className="text-sm font-semibold">Customer information</h3>
            {customer && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Name" value={customer.name} />
                <Field label="Email" value={customer.email} />
                <Field label="Phone" value={customer.phone} />
                <Field label="Company" value={customer.company} />
              </div>
            )}
          </Card>

          <Card className="rounded-2xl border p-5">
            <h3 className="text-sm font-semibold">Issue information</h3>
            <div className="mt-4 space-y-4">
              <Field label="Subject" value={ticket.subject} />
              <Field label="Category" value={ticket.category} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                <p className="mt-1 text-sm leading-relaxed">{ticket.description}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attachments</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["error-log.txt", "screenshot.png"].map((f) => (
                    <div key={f} className="inline-flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-1.5 text-xs">
                      <Paperclip className="size-3.5 text-muted-foreground" />{f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border p-5">
            <h3 className="text-sm font-semibold">Notes</h3>
            <div className="mt-4 space-y-3">
              {ticket.notes?.map((n: any) => (
                <div key={n.id} className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7"><AvatarFallback className="text-[10px]">{n.avatar}</AvatarFallback></Avatar>
                    <span className="text-sm font-semibold">{n.author}</span>
                    <span className="text-xs text-muted-foreground">· {new Date(n.date).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write a note for your team…" className="rounded-xl" rows={4} />
              <div className="flex justify-end">
                <Button className="rounded-xl" onClick={handleAddNote}>Save note</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="rounded-2xl border p-5">
            <h3 className="text-sm font-semibold">Status update</h3>
            <div className="mt-3 space-y-2">
              <Select value={ticket.status} onValueChange={handleStatusUpdate}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="rounded-2xl border p-5">
            <h3 className="text-sm font-semibold">Activity timeline</h3>
            <ol className="mt-4 space-y-4">
              {ticket.timeline?.map((e: any, i: number) => (
                <li key={e.id} className="relative pl-6">
                  {i !== ticket.timeline.length - 1 && (
                    <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
                  )}
                  <span className="absolute left-0 top-1.5 size-3.5 rounded-full border-2 border-primary bg-background" />
                  <p className="text-sm font-medium">{e.text}</p>
                  <p className="text-xs text-muted-foreground">{e.actor} · {new Date(e.date).toLocaleString()}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}
