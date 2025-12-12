
"use client";

import type { User, OrderItem } from "@/lib/types";
import { findUserByCardId } from "@/lib/api";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (companyCardId: string) => Promise<boolean>;
  logout: () => void;
  pendingOrder: OrderItem[] | null;
  setPendingOrder: (order: OrderItem[] | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingOrder, setPendingOrder] = useState<OrderItem[] | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("pos-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem("pos-user");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === "/login";
      if (!user && !isAuthPage) {
        router.replace("/login");
      }
      if (user && isAuthPage) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (companyCardId: string): Promise<boolean> => {
    const foundUser = findUserByCardId(companyCardId);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("pos-user", JSON.stringify(foundUser));
      router.push("/dashboard");
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pos-user");
    router.push("/login");
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
