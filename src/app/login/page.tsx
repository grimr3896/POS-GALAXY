"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [cardId, setCardId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const success = await login(cardId);
    if (!success) {
      setError("Invalid Company Card ID. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Icons.logo className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              InnKeeper POS
            </CardTitle>
            <CardDescription>
              Enter your Company Card ID to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-id">Company Card ID</Label>
              <Input
                id="card-id"
                type="password"
                placeholder="****"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
