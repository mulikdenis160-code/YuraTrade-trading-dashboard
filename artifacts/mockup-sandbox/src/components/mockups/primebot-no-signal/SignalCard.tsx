import "./_group.css";

const alternatives = [
  { expiry: "2 мин", payout: "92%" },
  { expiry: "10 мин", payout: "80%" },
];

export function SignalCard() {
  return (
    <main className="primebot-no-signal-preview flex min-h-screen items-start justify-center p-4 sm:items-center">
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-blue/25 bg-[#0e1420] text-left shadow-[0_18px_50px_rgba(0,0,0,0.24)]" role="status" aria-live="polite">
        <div className="flex items-start gap-3 border-b border-white/6 bg-gradient-to-r from-blue/10 to-transparent p-4 sm:p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#56b0ff]/25 bg-[#56b0ff]/10 text-[#8ecbff]">
            <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
              <path d="M12 8v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#8ecbff] uppercase">БЛИЖАЙШИЕ ЭКСПИРАЦИИ</p>
            <h1 className="mt-1 text-base font-bold leading-snug text-[#edf1f7] sm:text-lg">Новый сигнал не подтверждён</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[#a9b4c4]">
              На экспирации 1 мин ИИ не нашёл достаточно ясного сигнала. Направление не выдумываем.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-3.5">
            <p className="text-[10px] font-bold tracking-[0.14em] text-[#6b7789] uppercase">ПОЧЕМУ СИГНАЛ НЕ ВЫДАН</p>
            <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-[#a9b4c4]">
              Свежие свечи не дают достаточно ясного преимущества для выбранного срока. Чтобы не угадывать направление, ИИ отказался от сигнала.
            </p>
          </div>

          <div className="space-y-2.5">
            <div>
              <p className="text-sm font-bold text-[#edf1f7]">Сигнал найден на другой экспирации</p>
              <p className="mt-1 text-xs leading-relaxed text-[#a9b4c4]">
                Выберите срок, чтобы показать пару. Перед выдачей направления ИИ проверит её ещё раз.
              </p>
            </div>
            <div className="space-y-2">
              {alternatives.map(({ expiry, payout }) => (
                <button
                  key={expiry}
                  type="button"
                  className="group flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border border-[#56b0ff]/20 bg-[#121b29] px-3.5 py-3 text-left transition hover:border-[#56b0ff]/45 hover:bg-[#56b0ff]/8"
                >
                  <span className="min-w-0">
                    <span className="block text-base font-bold text-[#edf1f7]">{expiry}</span>
                    <span className="mt-0.5 block text-xs text-[#a9b4c4]">Выбрать срок и показать пару</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-[#56b0ff]/20 bg-[#56b0ff]/10 px-2.5 py-1 text-xs font-semibold text-[#8ecbff]">
                    Выплата {payout}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="btn-ghost min-h-11 w-full justify-center">
            Искать ещё раз
          </button>
          <p className="text-center text-[10px] text-[#6b7789]">Визуальный пример карточки · данные неактивны</p>
        </div>
      </section>
    </main>
  );
}
