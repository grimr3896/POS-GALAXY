
"use client";

import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import { UserNav } from "@/components/user-nav";
import { LayoutDashboard, ShoppingCart, Archive, Users, Settings, History, FileText, Landmark, Wallet } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth-context";
import { hasPermission } from "@/lib/permissions";
import type { Permission } from "@/lib/types";

const navItems: { href: string; label: string; icon: React.ElementType, permission: Permission }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: 'page:dashboard' },
  { href: "/pos", label: "Point of Sale", icon: ShoppingCart, permission: 'page:pos' },
  { href: "/inventory", label: "Inventory", icon: Archive, permission: 'page:inventory' },
  { href: "/sales-history", label: "Sales History", icon: History, permission: 'page:sales-history' },
  { href: "/expenses", label: "Expenses", icon: Landmark, permission: 'page:expenses' },
  { href: "/cash-up", label: "Cash Up", icon: Wallet, permission: 'page:reports' },
  { href: "/reports", label: "Reports", icon: FileText, permission: 'page:reports' },
  { href: "/employees", label: "Employees", icon: Users, permission: 'page:employees' },
  { href: "/settings", label: "Settings", icon: Settings, permission: 'page:settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const getPageTitle = () => {
    const currentNavItem = navItems.find((item) => pathname.startsWith(item.href));
    return currentNavItem ? currentNavItem.label : "Galaxy Inn";
  };
  
  const visibleNavItems = navItems.filter(item => hasPermission(user, item.permission));

  return (
    <SidebarProvider>
      <Sidebar collapsible={isMobile ? "offcanvas" : "icon"} className="border-r border-sidebar-border">
        <SidebarHeader>
          <div className="flex h-10 items-center gap-2 px-2">
            <Icons.logo className="size-6 shrink-0 text-sidebar-primary" />
            <span className="truncate text-lg font-semibold text-sidebar-foreground">
              Galaxy Inn
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {visibleNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label, side: "right", className: "bg-popover text-popover-foreground" }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="flex-1 text-lg font-semibold md:text-xl">
            {getPageTitle()}
          </h1>
          <div className="flex items-center gap-2">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
