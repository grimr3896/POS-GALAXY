
"use client";

import type { User, OrderItem } from "@/lib/types";
import { findUserByCardId } from "@/lib/api";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (companyCardId: string) => Promise<boolean>;
  logout: () => void;
  pendingOrder: OrderItem[] | null;
  setPendingOrder: (order: OrderItem[] | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A default admin user to grant full access
const defaultAdminUser: User = {
  id: 0,
  name: "Admin",
  role: "Admin",
  companyCardId: "admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultAdminUser);
  const [loading, setLoading] = useState(false); // No need to load from storage
  const [pendingOrder, setPendingOrder] = useState<OrderItem[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Since we always have a user, just ensure we are on a valid page.
    // This simplifies the logic and removes the redirect loop possibility.
    if (router && !loading && window.location.pathname.endsWith('/login')) {
      router.replace('/dashboard');
    }
  }, [loading, router]);

  const login = async (companyCardId: string): Promise<boolean> => {
    // Login logic is now bypassed, but we keep the function for compatibility
    // In this simplified setup, we always stay logged in as the default admin
    return true;
  };

  const logout = () => {
    // Logout is effectively disabled in this simplified setup.
    // You could optionally redirect to a "logged out" screen, but for a single-user
    // terminal, this might not be necessary.
    console.log("Logout action called, but the system is in single-user mode.");
  };

  const value = { user, loading, login, logout, pendingOrder, setPendingOrder };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
