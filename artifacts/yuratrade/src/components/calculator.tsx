import { useMemo, useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language";

const risks = ["1", "2", "3", "5"];

export function BalanceCalculator() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(true);
  const [balance, setBalance] = useState("");
  const [risk, setRisk] = useState("2");
  const [plan, setPlan] = useState(false);
  const [saved, setSaved] = useState(false);

  const balanceNum = Number(balance) || 0;
  const riskNum = Number(risk) || 2;
  const trade = (balanceNum * riskNum) / 100;

  const steps = useMemo(() => {
    if (trade <= 0) return [];
    return [1, 2, 3, 4].map((step) => {
      const amount = trade * 2 ** (step - 1);
      const loss = trade * (2 ** (step - 1) - 1);
      return { step, amount, loss, profit: amount * 0.85 - loss };
    });
  }, [trade]);

  return (
    <section className="panel overflow-hidden">
      <button type="button" className="flex w-full items-center justify-between px-4 py-4 text-left" onClick={() => setOpen((v) => !v)}>
        <span>
            <span className="block text-sm font-semibold text-fg">{t("calculator.title")}</span>
            <span className="mt-1 block text-sm text-dim">{t("calculator.subtitle")}</span>
        </span>
        <ChevronDown className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="space-y-4 px-4 pb-4">
          <label className="block text-sm text-muted">
            {t("calculator.balance")}
            <input
              inputMode="decimal"
              value={balance}
              placeholder="1000"
              onChange={(event) => {
                setBalance(event.target.value.replace(/[^\d.]/g, ""));
                setSaved(false);
              }}
              className="field mt-2 h-12 px-3 font-mono"
            />
          </label>
          <div>
            <p className="mb-2 text-sm text-muted">{t("calculator.risk")}</p>
            <div className="flex gap-2">
              {risks.map((item) => (
                <button key={item} type="button" className={`chip flex-1 ${risk === item ? "on" : ""}`} onClick={() => setRisk(item)}>
                  {item}%
                </button>
              ))}
            </div>
          </div>
          {balanceNum > 0 ? (
            <div className="rounded-2xl bg-blue/10 px-4 py-3">
              <p className="text-sm text-muted">{t("calculator.recommended")}</p>
              <p className="mt-1 font-mono text-3xl font-extrabold text-blue-soft">${trade.toFixed(2)}</p>
              <p className="mt-1 text-sm text-dim">
                {riskNum}% от ${balanceNum.toFixed(0)}
              </p>
              <button
                type="button"
                className="btn-prime mt-3"
                onClick={() => {
                  localStorage.setItem("last_trade_amount", trade.toFixed(2));
                  setSaved(true);
                }}
              >
                {saved ? t("calculator.saved") : t("calculator.save")}
              </button>
            </div>
          ) : (
            <p className="flex items-start gap-2 text-sm text-dim">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-soft" />
              {t("calculator.enterBalance")}
            </p>
          )}
          {balanceNum > 0 ? (
            <div>
              <button type="button" className={`chip ${plan ? "on" : ""}`} onClick={() => setPlan((v) => !v)}>
                {t("calculator.plan")}
              </button>
              {plan ? (
                <div className="mt-3 space-y-2">
                  {steps.map((row) => (
                    <div key={row.step} className="grid grid-cols-4 gap-1 rounded-xl bg-white/3 px-2 py-2 text-center font-mono text-[11px] sm:gap-2 sm:px-3 sm:text-xs">
                      <span className="text-blue-soft">{row.step === 1 ? t("common.entryPrice") : `×${2 ** (row.step - 1)}`}</span>
                      <span>${row.amount.toFixed(2)}</span>
                      <span className="text-loss">{row.loss > 0 ? `-$${row.loss.toFixed(2)}` : "—"}</span>
                      <span className="text-win">+${row.profit.toFixed(2)}</span>
                    </div>
                  ))}
                  <p className="text-sm leading-relaxed text-dim">
                    {t("calculator.warning")}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
