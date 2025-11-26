import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function EmployeesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Management</CardTitle>
        <CardDescription>
          This feature is not yet implemented. Here you will be able to manage employee roles and permissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
        <Users className="h-16 w-16" />
        <p>Coming Soon</p>
      </CardContent>
    </Card>
  );
}
