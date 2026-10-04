import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { StatRow } from "@/components/stats";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  return (
    <div className="space-y-5">
      <header className="rise">
        <p className="text-sm font-semibold tracking-[0.16em] text-blue-soft uppercase">Журнал</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">История</h1>
        <p className="mt-2 max-w-xl text-base text-muted">Закрытые сигналы и разбивка по парам.</p>
      </header>
      <div className="rise rise-2">
        <StatRow />
      </div>
      <section className="panel rise rise-3 flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
        <History className="size-6 text-blue-soft" />
        <p className="mt-3 text-base font-semibold text-fg">Истории пока нет</p>
        <p className="mt-1 max-w-sm text-sm text-dim">Победы и поражения не рисуются заранее.</p>
      </section>
    </div>
  );
}
