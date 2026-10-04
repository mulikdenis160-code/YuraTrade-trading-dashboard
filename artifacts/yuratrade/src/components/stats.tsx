import { useEffect, useState } from "react";
import {
  readSignalJournal,
  subscribeToSignalJournal,
  summarizeSignals,
} from "@/lib/signal-journal";

export function StatRow() {
  const [summary, setSummary] = useState(() => summarizeSignals([]));

  useEffect(() => {
    const update = () => setSummary(summarizeSignals(readSignalJournal()));
    update();
    return subscribeToSignalJournal(update);
  }, []);

  const items = [
    { label: "Завершено", value: String(summary.settled), tone: "text-fg" },
    { label: "Побед", value: String(summary.wins), tone: "text-win" },
    { label: "Поражений", value: String(summary.losses), tone: "text-loss" },
    {
      label: "Успешность",
      value: summary.hitRate === null ? "—" : `${summary.hitRate.toFixed(1)}%`,
      tone: "text-blue-soft",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item, index) => (
        <div key={item.label} className="panel arrive min-w-0 px-3 py-3 text-center" style={{ animationDelay: `${index * 70}ms` }}>
          <p className={`font-mono text-2xl font-extrabold ${item.tone}`}>{item.value}</p>
          <p className="mt-1 text-xs font-semibold tracking-wide text-dim uppercase">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
