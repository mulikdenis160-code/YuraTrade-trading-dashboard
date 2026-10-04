import { useState } from "react";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { BrandName } from "@/components/brand";
import { isPocketId, usePocket } from "@/lib/pocket";

const notes = [
  "Только 9 цифр из профиля Pocket Option",
  "Пароль от кабинета не нужен",
  "Сделки сами не открываются",
  "Сумму считает калькулятор риска",
];

export function Gate() {
  const { accept } = usePocket();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const ready = isPocketId(value);

  const submit = () => {
    if (!ready) {
      setError("Идентификатор должен состоять ровно из 9 цифр");
      return;
    }
    accept(value);
  };

  return (
    <div className="stage flex min-h-dvh items-center justify-center px-4 py-10 pb-28">
      <div className="w-full max-w-md">
        <div className="rise text-center">
          <p className="text-sm font-semibold tracking-[0.18em] text-blue-soft">VLADOS</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            <BrandName />
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-muted">
            Проверка идентификатора. Регистрация не нужна — пароль не запрашиваем.
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
            Идентификатор Pocket Option
          </div>
          <p id="pocket-help" className="text-sm leading-relaxed text-dim">
            Девять цифр из профиля. Это проверка ID, не создание аккаунта.
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
            {ready ? "Проверить ID" : "Введите 9 цифр"}
            <ArrowRight className="size-4" />
          </button>
          <div className="flex items-start gap-2 rounded-xl bg-blue/10 px-3 py-3 text-sm text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-soft" />
            ID остаётся только в этом браузере. На сервер он не отправляется.
          </div>
        </form>

        <ul className="mt-4 grid grid-cols-2 gap-2">
          {notes.map((note, index) => (
            <li key={note} className={`panel rise rise-${index + 1} p-3 text-sm leading-snug text-muted`}>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
