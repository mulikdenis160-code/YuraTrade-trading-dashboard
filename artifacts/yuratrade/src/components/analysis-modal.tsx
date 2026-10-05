import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/lib/language";

const lines = ["modal.step1", "modal.step2", "modal.step3"] as const;

export function AnalysisModal({
  pair,
  expiry,
  title,
  description,
}: {
  pair: string;
  expiry: string;
  title?: string;
  description?: string;
}) {
  const { t } = useLanguage();
  const [line, setLine] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setLine((current) => (current + 1) % lines.length), 900);
    return () => window.clearInterval(timer);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "#080b12" }}>
      <div
        className="w-full max-w-sm rounded-3xl border border-[#2c3a50] px-6 py-8 text-center"
        style={{ background: "#121826", boxShadow: "0 24px 64px #000" }}
      >
        <p className="text-xs font-semibold tracking-[0.14em] text-dim uppercase">
          {pair} · {expiry}
        </p>
        <div className="relative mx-auto mt-6 grid size-36 place-items-center rounded-full border-2 border-[#2c3a50]" style={{ background: "#1c2636" }}>
          <div className="flex h-16 items-end gap-1.5">
            {[0, 1, 2, 3, 4].map((index) => (
              <span key={index} className="candle-bar" style={{ animationDelay: `${index * 0.12}s` }} />
            ))}
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-fg">{title ?? t("modal.title")}</h2>
        <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted">{description ?? t(lines[line])}</p>
      </div>
    </div>,
    document.body,
  );
}
