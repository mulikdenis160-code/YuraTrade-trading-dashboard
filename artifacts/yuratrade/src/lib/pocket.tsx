import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getPocketGateState,
  verifyPocketAccount,
  type PocketGateVerification,
} from "./pocket-gate";
import { getTelegramInitData, initializeTelegramWebApp } from "./telegram-webapp";

export const ADMIN_IDS = ["113510708", "92535291"] as const;
const GATE_REQUEST_TIMEOUT_MS = 12_000;

export function isPocketId(value: string) {
  return /^\d{9}$/.test(value);
}

export function isAdminId(value: string | null) {
  return value !== null && (ADMIN_IDS as readonly string[]).includes(value);
}

function settleWithin<T>(promise: Promise<T>, fallback: T, timeoutMs: number): Promise<T> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: T) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(fallback), timeoutMs);
    promise.then(finish, () => finish(fallback));
  });
}

type PocketState = {
  ready: boolean;
  id: string | null;
  depositAmount: number | null;
  telegramAvailable: boolean;
  accept: (id: string, depositAmount: number) => void;
  verifyAccount: (id: string) => Promise<PocketGateVerification>;
};

const PocketContext = createContext<PocketState | null>(null);

export function PocketProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [telegramAvailable, setTelegramAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      localStorage.removeItem("pocket_option_id");
    } catch {
      // The old local-only ID is never used for access.
    }
    const inTelegram = initializeTelegramWebApp();
    const initData = getTelegramInitData();
    setTelegramAvailable(inTelegram);

    if (!inTelegram || !initData) {
      setReady(true);
      return () => {
        cancelled = true;
      };
    }

    const loadingTimeout = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 1_500);
    try {
      getPocketGateState({ data: { initData } })
        .then((state) => {
          if (!cancelled && state.status === "verified" && isPocketId(state.pocketId)) {
            setId(state.pocketId);
            setDepositAmount(state.depositAmount);
          }
        })
        .catch(() => {
          if (!cancelled) setId(null);
        })
        .finally(() => {
          window.clearTimeout(loadingTimeout);
          if (!cancelled) setReady(true);
        });
    } catch {
      window.clearTimeout(loadingTimeout);
      setReady(true);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(loadingTimeout);
    };
  }, []);

  const accept = (next: string, nextDepositAmount: number) => {
    const trimmed = next.trim();
    if (!isPocketId(trimmed)) return;
    setId(trimmed);
    setDepositAmount(nextDepositAmount);
  };

  const verifyAccount = async (next: string): Promise<PocketGateVerification> => {
    const trimmed = next.trim();
    if (!isPocketId(trimmed)) return { status: "invalid_id" };
    const initData = getTelegramInitData();
    if (!initData) {
      setTelegramAvailable(false);
      return { status: "telegram_required" };
    }
    try {
      const result = await settleWithin(
        verifyPocketAccount({ data: { pocketId: trimmed, initData } }),
        { status: "check_unavailable" },
        GATE_REQUEST_TIMEOUT_MS,
      );
      if (result.status === "verified") {
        setId(result.pocketId);
        setDepositAmount(result.depositAmount);
      }
      return result;
    } catch {
      return { status: "check_unavailable" };
    }
  };

  return (
    <PocketContext.Provider value={{ ready, id, depositAmount, telegramAvailable, accept, verifyAccount }}>
      {children}
    </PocketContext.Provider>
  );
}

export function usePocket() {
  const value = useContext(PocketContext);
  if (!value) throw new Error("Pocket session missing");
  return value;
}
