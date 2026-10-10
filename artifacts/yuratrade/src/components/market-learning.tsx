import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/language";

export function MarketLearning() {
  const { t } = useLanguage();

  return (
    <section className="panel grid items-center gap-5 overflow-hidden p-4 sm:p-5 md:grid-cols-[1fr_15rem]">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-blue-soft uppercase">{t("learn.kicker")}</p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-fg sm:text-2xl">{t("learn.collectionTitle")}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{t("learn.collectionDescription")}</p>
        <Link to="/learn" className="btn-ghost mt-4 min-h-10 justify-center text-sm">
          {t("learn.open")}
        </Link>
      </div>
      <Link to="/learn" aria-label={t("learn.open")} className="block overflow-hidden rounded-2xl border border-white/10">
        <img
          src="/images/trend-infographic.webp"
          alt={t("learn.trend.imageAlt")}
          loading="lazy"
          className="aspect-square w-full object-cover object-center transition-transform duration-300 hover:scale-[1.03]"
        />
      </Link>
    </section>
  );
}
