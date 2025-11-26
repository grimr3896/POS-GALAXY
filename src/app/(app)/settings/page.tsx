"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Settings, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  if (user?.role !== "Admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have the required permissions to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
          <ShieldAlert className="h-16 w-16" />
          <p>Only Administrators can access system settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage application settings and configurations. More options will be available soon.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
        <Settings className="h-16 w-16" />
        <p>System settings will be configured here.</p>
      </CardContent>
    </Card>
  );
}
