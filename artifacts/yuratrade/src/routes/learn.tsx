import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/learn")({ component: LearnPage });

const trendCards = [
  { key: "learn.trend.up", color: "bg-emerald-400", border: "border-emerald-400/25", dot: "bg-emerald-400" },
  { key: "learn.trend.down", color: "bg-rose-400", border: "border-rose-400/25", dot: "bg-rose-400" },
  { key: "learn.trend.sideways", color: "bg-amber-300", border: "border-amber-300/25", dot: "bg-amber-300" },
] as const;

function LearnPage() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <header className="rise">
        <p className="text-sm font-semibold tracking-[0.16em] text-blue-soft uppercase">
          {t("learn.kicker")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          {t("learn.title")}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-muted">
          {t("learn.trend.definition")}
        </p>
      </header>

      <figure className="rise rise-2 overflow-hidden rounded-3xl border border-white/8 bg-[#07101c] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <img
          src="/images/trend-infographic.webp"
          alt={t("learn.trend.imageAlt")}
          className="mx-auto block h-auto w-full"
          fetchPriority="high"
        />
      </figure>

      <section className="rise rise-3" aria-labelledby="trend-summary-title">
        <h2 id="trend-summary-title" className="mb-3 text-xl font-bold tracking-tight text-fg sm:text-2xl">
          {t("learn.intro")}
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {trendCards.map((card) => (
            <article key={card.key} className={`rounded-2xl border ${card.border} bg-white/[0.025] p-4 sm:p-5`}>
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 size-3 shrink-0 rounded-full ${card.dot}`} aria-hidden="true" />
                <p className="text-sm leading-relaxed text-fg/90 sm:text-base">{t(card.key)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="rise rise-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-4 sm:px-5">
        <p className="text-sm leading-relaxed text-muted sm:text-base">{t("learn.trend.caution")}</p>
      </aside>
    </main>
  );
}
