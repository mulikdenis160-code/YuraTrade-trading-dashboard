import { o as __toESM } from "../_runtime.mjs";
import { r as formatExpiry } from "./expiry-B3tUilyb.mjs";
import { c as summarizeSignals, i as signalJournalCsv, o as subscribeToSignalJournal, s as summarizeByMarket, t as readSignalJournal } from "./signal-journal-B1ggs--X.mjs";
import { _ as require_react, g as require_jsx_runtime, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as StatRow } from "./stats-CWuJX2kf.mjs";
import { c as Download, o as History } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-DNLfnen7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var outcomeLabels = {
	pending: "В ожидании",
	win: "Победа",
	loss: "Поражение",
	draw: "Ничья"
};
var outcomeStyles = {
	pending: "border-white/10 bg-white/5 text-dim",
	win: "border-win/20 bg-win/10 text-win",
	loss: "border-loss/20 bg-loss/10 text-loss",
	draw: "border-blue/20 bg-blue/10 text-blue-soft"
};
function percent(value) {
	return value === null ? "—" : `${value.toFixed(1)}%`;
}
function price(value, entry) {
	if (value === void 0) return "—";
	const digits = entry >= 100 ? 2 : entry >= 10 ? 3 : 5;
	return value.toFixed(digits);
}
function formatDate(value) {
	return new Intl.DateTimeFormat("ru", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	}).format(value);
}
function exportCsv(entries) {
	const blob = new Blob(["﻿", signalJournalCsv(entries)], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `signals-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function HistoryPage() {
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const update = () => {
			setEntries(readSignalJournal());
			setLoaded(true);
		};
		update();
		return subscribeToSignalJournal(update);
	}, []);
	const summary = summarizeSignals(entries);
	const markets = summarizeByMarket(entries);
	const recent = entries.slice(0, 50);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 sm:space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "rise flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold tracking-[0.16em] text-blue-soft uppercase",
							children: "Журнал"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl",
							children: "История сигналов"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base",
							children: "Фактические исходы сигналов, закрытых котировкой Pocket Option."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn-ghost min-h-11 w-full justify-center gap-2 sm:w-auto",
					onClick: () => exportCsv(entries),
					disabled: entries.length === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Экспорт CSV"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rise rise-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel rise rise-3 p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold tracking-wide text-dim uppercase",
								children: "Порог безубыточности"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-2xl font-extrabold text-fg",
								children: percent(summary.breakEvenRate)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-relaxed text-dim",
								children: "Расчёт по выплате записанных входов"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold tracking-wide text-dim uppercase",
								children: "Условный итог"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `mt-2 font-mono text-2xl font-extrabold ${summary.netUnits > 0 ? "text-win" : summary.netUnits < 0 ? "text-loss" : "text-fg"}`,
								children: summary.settled === 0 ? "—" : `${summary.netUnits > 0 ? "+" : ""}${summary.netUnits.toFixed(2)} ед.`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-relaxed text-dim",
								children: "Каждая запись считается ставкой 1 ед."
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 border-t border-white/8 pt-3 text-xs leading-relaxed text-muted",
					children: "Это локальный журнал фактических исходов, не прогноз. Условный итог не учитывает реальные суммы ставок, комиссии или размер перекрытий. Алгоритм пока эвристический, не ML-модель; история загружается примерно на 40 свечей выбранного периода анализа, поэтому отдельный надёжный backtest не заявляется. CSV содержит период свечей и результаты для последующей проверки."
				})]
			}),
			markets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise rise-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-bold text-fg",
						children: "Разбивка по паре и сроку"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-dim",
						children: "Ничьи не входят в успешность"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: markets.map((market) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "panel min-w-0 p-3 sm:p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "truncate font-semibold text-fg",
									children: market.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-dim",
									children: [
										market.symbol,
										" · экспирация ",
										formatExpiry(market.seconds)
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-muted",
								children: [market.summary.decided, " решающих"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/4 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-dim",
									children: "Успешность"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono font-bold text-fg",
									children: percent(market.summary.hitRate)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/4 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-dim",
									children: "Порог безубыточности"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono font-bold text-fg",
									children: percent(market.summary.breakEvenRate)
								})]
							})]
						})]
					}, `${market.symbol}-${market.seconds}`))
				})]
			}) : null,
			!loaded || entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-6 text-blue-soft" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-base font-semibold text-fg",
						children: !loaded ? "Загружаем журнал…" : "Записей пока нет"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-sm text-sm leading-relaxed text-dim",
						children: !loaded ? "Читаем сохранённые в этом браузере исходы." : "Запись появится, когда сигнал завершится по котировке. Слабые сценарии пропускаются и не считаются сигналами."
					}),
					loaded && entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "btn-prime mt-4 min-h-11 justify-center",
						children: "Перейти к сигналам"
					}) : null
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise rise-4 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-bold text-fg",
						children: "Последние сигналы"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-dim",
						children: entries.length > recent.length ? `Последние ${recent.length} из ${entries.length}` : `${entries.length} записей`
					})]
				}), recent.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "panel min-w-0 p-3 sm:p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "truncate font-semibold text-fg",
								children: entry.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-dim",
								children: [
									formatDate(entry.startedAt),
									" · экспирация ",
									formatExpiry(entry.seconds),
									" · свечи ",
									formatExpiry(entry.analysisSeconds)
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${outcomeStyles[entry.outcome]}`,
							children: outcomeLabels[entry.outcome]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/4 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-dim",
									children: "Направление"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `mt-1 font-semibold ${entry.direction === "call" ? "text-win" : "text-loss"}`,
									children: entry.direction === "call" ? "Вверх" : "Вниз"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/4 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-dim",
									children: "Цена"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono font-semibold text-fg",
									children: [
										price(entry.openPrice, entry.openPrice),
										" → ",
										price(entry.closePrice, entry.openPrice)
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/4 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-dim",
									children: "Выплата"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono font-semibold text-fg",
									children: [entry.payout, "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/4 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-dim",
									children: "Попытка"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-semibold text-fg",
									children: [entry.step + 1, " из 4"]
								})]
							})
						]
					})]
				}, entry.id))]
			})
		]
	});
}
//#endregion
export { HistoryPage as component };
