

"use client";

import { usePathname, useRouter } from "next/navigation";
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
import { LayoutDashboard, ShoppingCart, Archive, Users, Settings, History, FileText, Landmark, Wallet, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { getSettings } from "@/lib/api";
import { useState, useEffect } from "react";
import { PasswordPromptDialog } from "@/app/(app)/inventory/password-prompt-dialog";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "Point of Sale", icon: ShoppingCart },
  { href: "/inventory", label: "Inventory", icon: Archive },
  { href: "/sales-history", label: "Sales History", icon: History },
  { href: "/expenses", label: "Expenses", icon: Landmark },
  { href: "/cash-up", label: "Cash Up", icon: Wallet },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [settings, setSettings] = useState(getSettings());
  const [unlockedTabs, setUnlockedTabs] = useState<string[]>([]);
  const [passwordPrompt, setPasswordPrompt] = useState<{ isOpen: boolean, targetHref: string | null }>({ isOpen: false, targetHref: null });

  useEffect(() => {
    // Function to update settings state
    const handleSettingsUpdate = () => {
      setSettings(getSettings());
    };
    
    // Listen for custom event
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    // On mount, read session storage for any tabs unlocked in this session
    const sessionUnlocked = sessionStorage.getItem("unlockedTabs");
    if (sessionUnlocked) {
      setUnlockedTabs(JSON.parse(sessionUnlocked));
    }

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, []);

  const getPageTitle = () => {
    const currentNavItem = navItems.find((item) => pathname.startsWith(item.href));
    return currentNavItem ? currentNavItem.label : "Galaxy Inn";
  };
  
  const handleNavClick = (e: React.MouseEvent, href: string) => {
      const isLocked = settings.lockedTabs?.includes(href);
      const isSessionUnlocked = unlockedTabs.includes(href);

      if (isLocked && !isSessionUnlocked) {
          e.preventDefault();
          setPasswordPrompt({ isOpen: true, targetHref: href });
      }
      // If not locked or already unlocked for the session, the Link will navigate as usual.
  };

  const handlePasswordConfirm = (password: string) => {
    const masterPassword = settings.masterPassword || "DARKSULPHUR";
    const targetHref = passwordPrompt.targetHref;

    if (password === masterPassword && targetHref) {
      const newUnlockedTabs = [...unlockedTabs, targetHref];
      setUnlockedTabs(newUnlockedTabs);
      sessionStorage.setItem("unlockedTabs", JSON.stringify(newUnlockedTabs));
      
      toast({ title: "Tab Unlocked", description: `You can now access this tab for the rest of your session.` });
      router.push(targetHref);
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect Password",
        description: "Access to this tab is denied.",
      });
    }
    setPasswordPrompt({ isOpen: false, targetHref: null });
  };


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
            {navItems.map((item) => {
              const isLocked = settings.lockedTabs?.includes(item.href) && !unlockedTabs.includes(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} onClick={(e) => handleNavClick(e, item.href)} passHref>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={{ children: item.label, side: "right", className: "bg-popover text-popover-foreground" }}
                    >
                      <span>
                        {isLocked ? <Lock className="text-destructive" /> : <item.icon />}
                        <span>{item.label}</span>
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )
            })}
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
      <PasswordPromptDialog
        isOpen={passwordPrompt.isOpen}
        onOpenChange={(isOpen) => setPasswordPrompt({ isOpen, targetHref: null })}
        onConfirm={handlePasswordConfirm}
        title="Enter Admin Password"
        description="This tab is locked. Please enter the master password to unlock it for this session."
      />
    </SidebarProvider>
  );
}

    