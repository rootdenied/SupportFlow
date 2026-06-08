import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SupportFlow CRM" },
      { name: "description", content: "Manage your workspace, notifications, and team preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your workspace preferences and notifications.</p>
      </div>

      <Card className="rounded-2xl border p-6 shadow-soft">
        <h3 className="text-sm font-semibold">Workspace</h3>
        <Separator className="my-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organization name</Label>
            <Input defaultValue="SupportFlow Inc." className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Support email</Label>
            <Input defaultValue="support@supportflow.io" className="rounded-xl" />
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border p-6 shadow-soft">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <Separator className="my-4" />
        <div className="space-y-4">
          {[
            { l: "Email notifications", d: "Get emails for new tickets and replies" },
            { l: "Desktop alerts", d: "Browser notifications for urgent tickets" },
            { l: "Weekly digest", d: "Receive a Monday performance summary" },
            { l: "AI triage suggestions", d: "Let AI suggest categories and priorities" },
          ].map((s, i) => (
            <div key={s.l} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{s.l}</p>
                <p className="text-xs text-muted-foreground">{s.d}</p>
              </div>
              <Switch defaultChecked={i !== 2} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" className="rounded-xl">Cancel</Button>
        <Button className="rounded-xl" onClick={() => toast.success("Settings saved")}>Save changes</Button>
      </div>
    </div>
  );
}
