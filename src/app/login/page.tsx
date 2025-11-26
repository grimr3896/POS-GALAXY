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
      
    </div>
  );
}
