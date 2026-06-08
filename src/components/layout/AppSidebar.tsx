import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Ticket, Users, BarChart3, Settings, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";

const MAIN_NAV = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const SETTINGS_NAV = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { user } = useAuth();
  const { data: dashboard } = useDashboard();
  const totalTickets = dashboard?.stats?.total || 0;

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="h-16 justify-center px-4">
        <div className="flex items-center gap-2 px-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">SupportFlow</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {MAIN_NAV.map((item) => {
                const badge = item.title === "Tickets" && totalTickets > 0 ? totalTickets.toString() : undefined;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentPath === item.url || (item.url !== "/" && currentPath.startsWith(item.url))}
                      tooltip={item.title}
                    >
                      <Link to={item.url} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </div>
                        {badge && (
                          <span className="flex h-5 items-center justify-center rounded-full bg-primary/10 px-2 text-[10px] font-medium text-primary">
                            {badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto pt-8">
          <SidebarGroupContent>
            <SidebarMenu>
              {SETTINGS_NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-2">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'User'}&backgroundColor=e2e8f0`} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium leading-none">{user?.name || "Support Agent"}</span>
            <span className="truncate text-xs text-muted-foreground mt-1">{user?.email || "agent@supportflow.com"}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
