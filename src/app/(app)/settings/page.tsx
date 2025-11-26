"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
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
