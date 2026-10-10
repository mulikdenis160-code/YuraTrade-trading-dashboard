import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/learn")({ component: LearnPage });

const trendCards = [
  { key: "learn.trend.up", color: "bg-emerald-400", border: "border-emerald-400/25", dot: "bg-emerald-400" },
  { key: "learn.trend.down", color: "bg-rose-400", border: "border-rose-400/25", dot: "bg-rose-400" },
  { key: "learn.trend.sideways", color: "bg-amber-300", border: "border-amber-300/25", dot: "bg-amber-300" },
] as const;

const levelCards = [
  ["learn.levels.supportTitle", "learn.levels.support"],
  ["learn.levels.resistanceTitle", "learn.levels.resistance"],
  ["learn.levels.breakoutTitle", "learn.levels.breakout"],
] as const;

const patternCards = [
  ["learn.patterns.risingTitle", "learn.patterns.rising"],
  ["learn.patterns.fallingTitle", "learn.patterns.falling"],
  ["learn.patterns.reversalTitle", "learn.patterns.reversal"],
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

      <section className="rise rise-4 space-y-5 border-t border-white/8 pt-7" aria-labelledby="levels-title">
        <header>
          <h2 id="levels-title" className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            {t("learn.levels.title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{t("learn.levels.definition")}</p>
        </header>
        <figure className="overflow-hidden rounded-3xl border border-white/8 bg-[#07101c]">
          <img
            src="/images/support-resistance-infographic.webp"
            alt={t("learn.levels.imageAlt")}
            loading="lazy"
            className="mx-auto block h-auto w-full"
          />
        </figure>
        <div className="grid gap-3 md:grid-cols-3">
          {levelCards.map(([titleKey, bodyKey]) => (
            <article key={titleKey} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:p-5">
              <h3 className="font-bold text-fg">{t(titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(bodyKey)}</p>
            </article>
          ))}
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:p-5">
          <h3 className="font-bold text-fg">{t("learn.levels.practiceTitle")}</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            {(["learn.levels.step1", "learn.levels.step2", "learn.levels.step3", "learn.levels.step4", "learn.levels.step5"] as const).map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        </div>
        <aside className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-muted sm:text-base">{t("learn.levels.warning")}</p>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-fg sm:text-base">{t("learn.levels.remember")}</p>
        </aside>
      </section>

      <section className="rise rise-4 space-y-5 border-t border-white/8 pt-7" aria-labelledby="patterns-title">
        <header>
          <h2 id="patterns-title" className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            {t("learn.patterns.title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{t("learn.patterns.definition")}</p>
        </header>
        <figure className="overflow-hidden rounded-3xl border border-white/8 bg-[#07101c]">
          <img
            src="/images/patterns-infographic.webp"
            alt={t("learn.patterns.imageAlt")}
            loading="lazy"
            className="mx-auto block h-auto w-full"
          />
        </figure>
        <div className="grid gap-3 md:grid-cols-3">
          {patternCards.map(([titleKey, bodyKey]) => (
            <article key={titleKey} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:p-5">
              <h3 className="font-bold text-fg">{t(titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(bodyKey)}</p>
            </article>
          ))}
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:p-5">
          <h3 className="font-bold text-fg">{t("learn.patterns.practiceTitle")}</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            {(["learn.patterns.step1", "learn.patterns.step2", "learn.patterns.step3", "learn.patterns.step4", "learn.patterns.step5"] as const).map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        </div>
        <aside className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-muted sm:text-base">{t("learn.patterns.warning")}</p>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-fg sm:text-base">{t("learn.patterns.remember")}</p>
        </aside>
      </section>
    </main>
  );
}
