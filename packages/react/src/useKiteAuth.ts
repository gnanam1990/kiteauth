import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kiteauth:user";

export interface KiteAuthUser {
  address: string;
  signature: `0x${string}`;
  message: string;
  nonce: string;
  expiresAt: number;
}

function read(): KiteAuthUser | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as KiteAuthUser;
    if (parsed.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function useKiteAuth() {
  const [user, setUser] = useState<KiteAuthUser | null>(null);

  useEffect(() => {
    setUser(read());
  }, []);

  const login = useCallback((u: KiteAuthUser) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    }
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUser(null);
  }, []);

  return { user, login, logout, isAuthenticated: !!user };
}
