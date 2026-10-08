import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/language";

type MarketLearningProps = {
  compact?: boolean;
};

export function MarketLearning({ compact = false }: MarketLearningProps) {
  const { t } = useLanguage();
  const topics = [
    {
      title: t("market.trendTitle"),
      body: t("market.trendBody"),
      detail: t("market.trendDetail"),
    },
    {
      title: t("market.retestTitle"),
      body: t("market.retestBody"),
      detail: t("market.retestDetail"),
    },
    {
      title: t("market.doubleTitle"),
      body: t("market.doubleBody"),
      detail: t("market.doubleDetail"),
    },
  ];

  return (
    <section className="panel p-4 sm:p-5" aria-labelledby={compact ? "market-home-title" : "market-learn-title"}>
      <p className="text-xs font-semibold tracking-[0.16em] text-blue-soft uppercase">{t("market.kicker")}</p>
      <h2
        id={compact ? "market-home-title" : "market-learn-title"}
        className="mt-2 text-xl font-bold tracking-tight text-fg sm:text-2xl"
      >
        {compact ? t("market.homeTitle") : t("market.title")}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{t("market.intro")}</p>
      <div className={`mt-4 grid gap-3 ${compact ? "sm:grid-cols-2" : ""}`}>
        {topics.map((topic) => (
          <article key={topic.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <h3 className="text-base font-bold text-fg">{topic.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{topic.body}</p>
            {!compact ? (
              <p className="mt-3 rounded-xl bg-blue/8 px-3 py-2 text-xs leading-relaxed text-blue-soft">
                {topic.detail}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <p className="mt-4 rounded-xl border border-white/8 bg-black/15 px-3 py-2 text-xs leading-relaxed text-dim">
        {t("market.caution")}
      </p>
      {compact ? (
        <Link to="/learn" className="btn-ghost mt-3 min-h-10 justify-center text-sm">
          {t("market.learnMore")}
        </Link>
      ) : null}
    </section>
  );
}
