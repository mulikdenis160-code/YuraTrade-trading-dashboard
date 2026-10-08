import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { ArrowRight, ExternalLink, KeyRound, ShieldCheck } from "lucide-react";
import { BrandName } from "@/components/brand";
import { isPocketId, usePocket } from "@/lib/pocket";
import { POCKET_OPTION_REFERRAL_URL } from "@/lib/pocket-gate-config";

const noteKeys = ["gate.note1", "gate.note2", "gate.note3"] as const;
const resultKeys = {
  invalid_id: "gate.result.invalidId",
  not_registered: "gate.result.notRegistered",
  deposit_required: "gate.result.depositRequired",
  already_linked: "gate.result.alreadyLinked",
  telegram_required: "gate.result.telegramRequired",
  rate_limited: "gate.result.rateLimited",
  check_unavailable: "gate.result.unavailable",
} as const;
type ResultKey = (typeof resultKeys)[keyof typeof resultKeys] | "gate.error" | "";

export function Gate() {
  const { language, setLanguage, t } = useLanguage();
  const { accept, verifyAccount } = usePocket();
  const [value, setValue] = useState("");
  const [result, setResult] = useState<ResultKey>("");
  const [checking, setChecking] = useState(false);
  const ready = isPocketId(value);

  const submit = async () => {
    if (!ready) {
      setResult("gate.error");
      return;
    }
    setChecking(true);
    setResult("");
    try {
      const verification = await verifyAccount(value);
      if (verification === "verified") {
        accept(value);
      } else {
        setResult(resultKeys[verification]);
      }
    } catch {
      setResult("gate.result.unavailable");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="stage flex min-h-dvh items-center justify-center px-4 py-10 pb-28">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <select
            aria-label={t("language.label")}
            title={t("language.label")}
            data-testid="select-gate-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="h-9 rounded-full border border-white/10 bg-[#111723] px-3 text-xs font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-blue-soft"
          >
            <option value="ru">RU</option>
            <option value="uk">UA</option>
            <option value="en">EN</option>
          </select>
        </div>
        <div className="rise text-center">
          <p className="text-sm font-semibold tracking-[0.18em] text-blue-soft">{t("gate.brand")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            <BrandName />
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-muted">
            {t("gate.intro")}
          </p>
        </div>

        <ol className="panel rise rise-1 mt-6 space-y-3 p-4">
          {noteKeys.map((note, index) => (
            <li key={note} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blue/15 font-mono text-xs font-bold text-blue-soft">
                {index + 1}
              </span>
              <span data-testid={`text-gate-step-${index + 1}`}>{t(note)}</span>
            </li>
          ))}
          <li className="pt-1">
            <a
              href={POCKET_OPTION_REFERRAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-gate-affiliate-registration"
              className="btn-prime flex w-full items-center justify-center gap-2"
            >
              {t("gate.register")}
              <ExternalLink className="size-4" />
            </a>
          </li>
        </ol>

        <form
          className="panel rise rise-2 mt-4 space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-fg">
            <KeyRound className="size-4 text-blue-soft" />
            {t("gate.id")}
          </div>
          <p id="pocket-help" className="text-sm leading-relaxed text-dim">
            {t("gate.idHelp")}
          </p>
          <div className="relative">
            <input
              id="pocket-id"
              inputMode="numeric"
              autoComplete="off"
              maxLength={9}
              aria-describedby={result ? "pocket-help pocket-result" : "pocket-help"}
              aria-invalid={result === "gate.error" || result === "gate.result.invalidId"}
              data-testid="input-gate-pocket-id"
              placeholder="123456789"
              value={value}
              onChange={(event) => {
                setValue(event.target.value.replace(/\D/g, "").slice(0, 9));
                if (result) setResult("");
              }}
              className="field h-14 px-4 pr-14 text-center font-mono text-xl font-semibold tracking-[0.28em] placeholder:tracking-[0.28em] placeholder:text-dim/40"
            />
            <span
              data-testid="status-gate-id-length"
              className={`absolute top-1/2 right-4 -translate-y-1/2 font-mono text-xs font-semibold ${ready ? "text-blue-soft" : "text-dim"}`}
            >
              {value.length}/9
            </span>
          </div>
          {result ? (
            <p
              id="pocket-result"
              role="alert"
              aria-live="polite"
              data-testid={`status-gate-${result.replaceAll(".", "-")}`}
              className="text-sm leading-relaxed text-loss"
            >
              {t(result)}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn-prime w-full"
            disabled={!ready || checking}
            data-testid="button-gate-verify"
          >
            {checking ? t("gate.checking") : ready ? t("gate.check") : t("gate.enterDigits")}
            <ArrowRight className="size-4" />
          </button>
          <div
            className="flex items-start gap-2 rounded-xl bg-blue/10 px-3 py-3 text-sm leading-relaxed text-muted"
            data-testid="notice-gate-verification-limit"
          >
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-soft" />
            {t("gate.limitation")}
          </div>
        </form>

      </div>
    </div>
  );
}
