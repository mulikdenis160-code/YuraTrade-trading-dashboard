import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { BrandName } from "@/components/brand";
import { isPocketId, usePocket } from "@/lib/pocket";

const noteKeys = ["gate.note1", "gate.note2", "gate.note3", "gate.note4"] as const;

export function Gate() {
  const { language, setLanguage, t } = useLanguage();
  const { accept } = usePocket();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const ready = isPocketId(value);

  const submit = () => {
    if (!ready) {
      setError(t("gate.error"));
      return;
    }
    accept(value);
  };

  return (
    <div className="stage flex min-h-dvh items-center justify-center px-4 py-10 pb-28">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <select
            aria-label={t("language.label")}
            title={t("language.label")}
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

        <form
          className="panel rise rise-2 mt-8 space-y-4 p-5"
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
              aria-describedby={error ? "pocket-help pocket-error" : "pocket-help"}
              aria-invalid={Boolean(error)}
              placeholder="123456789"
              value={value}
              onChange={(event) => {
                setValue(event.target.value.replace(/\D/g, "").slice(0, 9));
                if (error) setError("");
              }}
              className="field h-14 px-4 pr-14 text-center font-mono text-xl font-semibold tracking-[0.28em] placeholder:tracking-[0.28em] placeholder:text-dim/40"
            />
            <span
              className={`absolute top-1/2 right-4 -translate-y-1/2 font-mono text-xs font-semibold ${ready ? "text-blue-soft" : "text-dim"}`}
            >
              {value.length}/9
            </span>
          </div>
          {error ? (
            <p id="pocket-error" role="alert" className="text-sm text-loss">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-prime w-full" disabled={!ready}>
            {ready ? t("gate.check") : t("gate.enterDigits")}
            <ArrowRight className="size-4" />
          </button>
          <div className="flex items-start gap-2 rounded-xl bg-blue/10 px-3 py-3 text-sm text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-soft" />
            {t("gate.privacy")}
          </div>
        </form>

        <ul className="mt-4 grid grid-cols-2 gap-2">
          {noteKeys.map((note, index) => (
            <li key={note} className={`panel rise rise-${index + 1} p-3 text-sm leading-snug text-muted`}>
              {t(note)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
