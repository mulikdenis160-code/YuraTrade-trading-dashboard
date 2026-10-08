type TelegramWebApp = {
  initData?: string;
  ready?: () => void;
  expand?: () => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramInitData(): string {
  if (typeof window === "undefined") return "";
  const initData = window.Telegram?.WebApp?.initData;
  return typeof initData === "string" ? initData : "";
}

export function initializeTelegramWebApp(): boolean {
  if (typeof window === "undefined") return false;
  const webApp = window.Telegram?.WebApp;
  if (!webApp || typeof webApp.initData !== "string" || webApp.initData.length === 0) {
    return false;
  }
  webApp.ready?.();
  webApp.expand?.();
  return true;
}
