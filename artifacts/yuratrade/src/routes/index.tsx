import { createFileRoute } from "@tanstack/react-router";
import { SignalDesk } from "@/components/signal-desk";
import { BalanceCalculator } from "@/components/calculator";
import { StatRow } from "@/components/stats";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t } = useLanguage();
  return (
    <div className="space-y-5">
      <div className="rise">
        <section className="panel mb-4 overflow-hidden p-4 sm:p-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-blue-soft uppercase">{t("home.eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">{t("home.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{t("home.body")}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {(["feature1", "feature2", "feature3"] as const).map((feature) => (
              <div key={feature} className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
                <p className="text-sm font-semibold text-fg">{t(`home.${feature}.title`)}</p>
                <p className="mt-1 text-xs leading-relaxed text-dim">{t(`home.${feature}.body`)}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-blue-soft">{t("home.rateCaption")}</p>
          <p className="mt-1 text-xs leading-relaxed text-dim">{t("home.disclaimer")}</p>
        </section>
        <StatRow />
      </div>
      <div className="rise rise-2">
        <SignalDesk />
      </div>
      <div className="rise rise-3 mx-auto w-full max-w-md">
        <BalanceCalculator />
      </div>
    </div>
  );
}