import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          This feature is not yet implemented. Here you will be able to configure application settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
        <Settings className="h-16 w-16" />
        <p>Coming Soon</p>
      </CardContent>
    </Card>
  );
}
