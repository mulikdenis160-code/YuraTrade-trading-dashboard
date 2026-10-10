import { useLanguage } from "@/lib/language";

const exampleTrades = [
  { pair: "EUR/USD OTC", directionKey: "demoStats.up", statusKey: "demoStats.closedWin", tone: "text-win" },
  { pair: "GBP/USD OTC", directionKey: "demoStats.down", statusKey: "demoStats.closedLoss", tone: "text-loss" },
  { pair: "USD/JPY OTC", directionKey: "demoStats.up", statusKey: "demoStats.open", tone: "text-blue-soft" },
] as const;

export function DemoStats() {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="demo-stats-title"
      className="mt-4 rounded-2xl border border-blue-soft/25 bg-blue-soft/[0.045] p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-300/35 bg-amber-300/10 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-200 uppercase">
          {t("demoStats.badge")}
        </span>
        <h2 id="demo-stats-title" className="text-base font-bold text-fg sm:text-lg">
          {t("demoStats.title")}
        </h2>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">{t("demoStats.disclaimer")}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-3 text-center">
          <p className="font-mono text-2xl font-extrabold text-blue-soft">72%</p>
          <p className="mt-1 text-xs font-semibold text-dim">{t("demoStats.hitRate")}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-3 text-center">
          <p className="font-mono text-2xl font-extrabold text-win">18 / 25</p>
          <p className="mt-1 text-xs font-semibold text-dim">{t("demoStats.wins")}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-white/8 bg-black/15 px-3 py-3 text-center sm:col-span-1">
          <p className="font-mono text-2xl font-extrabold text-loss">7</p>
          <p className="mt-1 text-xs font-semibold text-dim">{t("demoStats.losses")}</p>
        </div>
      </div>

      <h3 className="mt-4 text-xs font-bold tracking-wide text-dim uppercase">{t("demoStats.examplesTitle")}</h3>
      <ul className="mt-2 space-y-2">
        {exampleTrades.map((trade) => (
          <li
            key={trade.pair}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5 text-sm"
          >
            <span className="font-semibold text-fg">{trade.pair}</span>
            <span className="text-muted">{t(trade.directionKey)}</span>
            <span className={`font-semibold ${trade.tone}`}>{t(trade.statusKey)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
