const items = [
  { label: "Сигналов", value: "0", tone: "text-fg" },
  { label: "Побед", value: "0", tone: "text-win" },
  { label: "Поражений", value: "0", tone: "text-loss" },
  { label: "Успешность", value: "0%", tone: "text-blue-soft" },
];

export function StatRow() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="panel arrive px-3 py-3 text-center" style={{ animationDelay: `${items.indexOf(item) * 70}ms` }}>
          <p className={`font-mono text-2xl font-extrabold ${item.tone}`}>{item.value}</p>
          <p className="mt-1 text-xs font-semibold tracking-wide text-dim uppercase">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
