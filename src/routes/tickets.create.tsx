import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCreateTicket } from "@/hooks/useTickets";
import { fetchApi } from "@/lib/api-client";
import { Sparkles, Upload, Wand2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/tickets/create")({
  head: () => ({
    meta: [
      { title: "Create Ticket — SupportFlow CRM" },
      { name: "description", content: "Create a new support ticket with AI-assisted triage." },
    ],
  }),
  component: CreateTicket,
});

const initial = {
  name: "",
  email: "",
  subject: "",
  category: "",
  description: "",
  priority: "Medium",
};

function CreateTicket() {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();
  const [form, setForm] = useState(initial);
  
  const [aiResult, setAiResult] = useState<{ category: string; priority: string; summary: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (form.subject.length < 5 && form.description.length < 10) {
      setAiResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiLoading(true);
      try {
        const res = await fetchApi<any>("/ai/classify", {
          method: "POST",
          body: JSON.stringify({
            subject: form.subject || "Unknown subject",
            description: form.description || "No description provided.",
          }),
        });
        setAiResult(res);
        // Optionally auto-apply if not set
        if (!form.category && res.category) update("category", res.category.replace("_", " "));
        if (form.priority === "Medium" && res.priority && res.priority !== "Medium") update("priority", res.priority);
      } catch (e) {
        console.error("AI error", e);
      } finally {
        setIsAiLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [form.subject, form.description]);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.description || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    createTicket.mutate({
      customerName: form.name,
      customerEmail: form.email,
      subject: form.subject,
      description: form.description,
      category: form.category.replace(" ", "_"),
      priority: form.priority,
    }, {
      onSuccess: () => {
        toast.success("Ticket created", {
          description: `${form.subject} has been created and analyzed by AI.`,
          action: { label: "View ticket", onClick: () => navigate({ to: "/tickets" }) },
        });
        setForm(initial);
      },
      onError: (err: any) => {
        toast.error("Failed to create ticket", { description: err.message });
      }
    });
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create ticket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture a new customer issue. Our AI will suggest a category and priority as you type.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="rounded-2xl border p-6 shadow-soft md:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer name">
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Cooper" className="rounded-xl" />
              </Field>
              <Field label="Customer email">
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@acme.com" className="rounded-xl" />
              </Field>
            </div>

            <Field label="Subject">
              <Input value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="Briefly describe the issue" className="rounded-xl" />
            </Field>

            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {["Billing", "Technical", "Account", "General", "Bug", "Feature Request"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Provide as much detail as possible…"
                rows={6}
                className="rounded-xl"
              />
            </Field>

            <Field label="Attachments">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/30 p-8 text-center transition-colors hover:bg-muted/50">
                <div className="flex size-10 items-center justify-center rounded-xl bg-background shadow-soft">
                  <Upload className="size-5 text-primary" />
                </div>
                <p className="text-sm font-medium">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                <input type="file" className="hidden" />
              </label>
            </Field>

            <Field label="Priority">
              <RadioGroup value={form.priority} onValueChange={(v) => update("priority", v)} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["Low", "Medium", "High", "Urgent"].map((p) => (
                  <label key={p} className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value={p} />
                    <span className="text-sm font-medium">{p}</span>
                  </label>
                ))}
              </RadioGroup>
            </Field>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-5">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setForm(initial)} disabled={createTicket.isPending}>Reset</Button>
              <Button type="submit" className="rounded-xl" disabled={createTicket.isPending}>
                {createTicket.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Create ticket
              </Button>
            </div>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card className="rounded-2xl border-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-background p-5 shadow-elevated">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-elevated">
                {isAiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold">AI Assistant</p>
                <p className="text-[11px] text-muted-foreground">
                  {isAiLoading ? "Analyzing..." : "Smart triage suggestions"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Suggestion label="Suggested category" value={isAiLoading ? "..." : aiResult?.category || "Type to generate"} />
              <Suggestion label="Suggested priority" value={isAiLoading ? "..." : aiResult?.priority || "Type to generate"} />
              <div className="rounded-xl border bg-card/80 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">Confidence</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress value={isAiLoading ? 0 : (aiResult ? 92 : 0)} className="h-1.5" />
                  <span className="text-xs font-semibold">{isAiLoading ? "--" : (aiResult ? "92%" : "0%")}</span>
                </div>
              </div>
              <div className="rounded-xl border bg-card/80 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">Suggested resolution</p>
                <p className="mt-1 text-xs leading-relaxed">
                  {isAiLoading ? "Analyzing text..." : aiResult?.summary || "Provide more details to get a suggested resolution from our AI assistant."}
                </p>
              </div>
              <Button className="w-full rounded-xl" variant="outline" disabled={!aiResult}>
                <Wand2 className="mr-2 size-4" />Auto-fill from AI
              </Button>
            </div>
          </Card>

          <Card className="rounded-2xl border p-4 text-xs text-muted-foreground">
            Need help? <Link to="/tickets" className="font-medium text-primary hover:underline">Browse tickets</Link> or contact your team lead.
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Suggestion({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card/80 p-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{value}</span>
    </div>
  );
}

