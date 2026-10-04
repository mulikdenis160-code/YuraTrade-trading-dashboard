import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "pocket_option_id";

export const ADMIN_IDS = ["113510708", "92535291"] as const;

export function isPocketId(value: string) {
  return /^\d{9}$/.test(value);
}

export function isAdminId(value: string | null) {
  return value !== null && (ADMIN_IDS as readonly string[]).includes(value);
}

function readStoredId() {
  try {
    const value = localStorage.getItem(KEY) ?? "";
    return isPocketId(value) ? value : null;
  } catch {
    return null;
  }
}

type PocketState = {
  ready: boolean;
  id: string | null;
  accept: (id: string) => void;
  leave: () => void;
};

const PocketContext = createContext<PocketState | null>(null);

export function PocketProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setId(readStoredId());
    setReady(true);
  }, []);

  const accept = (next: string) => {
    const trimmed = next.trim();
    if (!isPocketId(trimmed)) return;
    localStorage.setItem(KEY, trimmed);
    setId(trimmed);
  };

  const leave = () => {
    localStorage.removeItem(KEY);
    setId(null);
  };

  return (
    <PocketContext.Provider value={{ ready, id, accept, leave }}>
      {children}
    </PocketContext.Provider>
  );
}

export function usePocket() {
  const value = useContext(PocketContext);
  if (!value) throw new Error("Pocket session missing");
  return value;
}
