import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// This is a workaround for uuid not being available in some environments
export const getUUID = () => (typeof window !== "undefined" && window.crypto ? window.crypto.randomUUID() : uuidv4());
