import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, g as require_jsx_runtime, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import "./pocket-gate.middleware-ClqrhdF7.mjs";
import { c as Download, o as History } from "../_libs/lucide-react.mjs";
import { O as formatExpiryForLanguage, b as signalBatchWinRate, d as signalJournalCsv, h as summarizeSignals, i as markExpiredPendingSignals, k as useLanguage, m as summarizeByMarket, o as readSignalJournal, p as subscribeToSignalJournal, v as readSignalBatch, x as subscribeToSignalBatch } from "./router-Tl8GheUd.mjs";
import { t as StatRow } from "./stats-C2EMgShi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-e_IHRHro.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var outcomeStyles = {
	pending: "border-white/10 bg-white/5 text-dim",
	unverified: "border-white/10 bg-white/5 text-muted",
	overlay: "border-blue/20 bg-blue/5 text-blue-soft",
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
function formatDate(value, language) {
	const locale = language === "en" ? "en-GB" : language === "uk" ? "uk-UA" : "ru-RU";
	return new Intl.DateTimeFormat(locale, {
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
	const { language, t } = useLanguage();
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [batch, setBatch] = (0, import_react.useState)(null);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const updateEntries = () => {
			markExpiredPendingSignals();
			setEntries(readSignalJournal().filter((entry) => entry.group === "fx"));
			setLoaded(true);
		};
		const updateBatch = () => setBatch(readSignalBatch());
		updateEntries();
		updateBatch();
		const unsubscribeJournal = subscribeToSignalJournal(updateEntries);
		const unsubscribeBatch = subscribeToSignalBatch(updateBatch);
		return () => {
			unsubscribeJournal();
			unsubscribeBatch();
		};
	}, []);
	const summary = summarizeSignals(entries);
	const markets = summarizeByMarket(entries);
	const recent = entries.slice(0, 50);
	const expiryLabel = (seconds) => formatExpiryForLanguage(seconds, language);
	const outcomeLabels = {
		pending: t("outcome.pending"),
		unverified: t("outcome.unverified"),
		overlay: t("outcome.overlay"),
		win: t("outcome.win"),
		loss: t("outcome.loss"),
		draw: t("outcome.draw")
	};
	const batchStatusLabel = batch ? batch.status === "running" ? t("batch.running") : batch.status === "paused" ? t("batch.paused") : batch.status === "stopping" ? t("batch.stopping") : batch.status === "completed" ? t("batch.completed") : t("batch.stopped") : "";
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
							children: t("history.kicker")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl",
							children: t("history.title")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base",
							children: t("history.description")
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn-ghost min-h-11 w-full justify-center gap-2 sm:w-auto",
					onClick: () => exportCsv(entries),
					disabled: entries.length === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), t("history.export")]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rise rise-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {})
			}),
			batch ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel rise rise-2 p-4 sm:p-5",
				"aria-label": t("batch.title"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-wide text-blue-soft uppercase",
							children: t("batch.title")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-fg",
							children: [
								batchStatusLabel,
								" · ",
								expiryLabel(batch.expirySeconds)
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "shrink-0 font-mono text-sm font-bold text-fg",
							children: [
								batch.completed,
								"/",
								batch.target
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-3 gap-2 text-center",
						children: [
							[
								t("batch.wins"),
								batch.wins,
								"text-win"
							],
							[
								t("batch.losses"),
								batch.losses,
								"text-loss"
							],
							[
								t("batch.draws"),
								batch.draws,
								"text-blue-soft"
							]
						].map(([label, value, color]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-white/4 px-2 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `font-mono text-lg font-bold ${color}`,
								children: value
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-dim",
								children: label
							})]
						}, label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center justify-between gap-3 rounded-xl bg-white/4 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-muted",
							children: t("batch.winRate")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-[10px] leading-relaxed text-dim",
							children: t("batch.winRateHelp")
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "shrink-0 font-mono text-lg font-bold text-win",
							children: percent(signalBatchWinRate(batch))
						})]
					}),
					batch.lastError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-relaxed text-muted",
						children: batch.lastError
					}) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel rise rise-3 p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold tracking-wide text-dim uppercase",
								children: t("history.breakEven")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-2xl font-extrabold text-fg",
								children: percent(summary.breakEvenRate)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-relaxed text-dim",
								children: t("history.breakEvenHelp")
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold tracking-wide text-dim uppercase",
								children: t("history.net")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `mt-2 font-mono text-2xl font-extrabold ${summary.netUnits > 0 ? "text-win" : summary.netUnits < 0 ? "text-loss" : "text-fg"}`,
								children: summary.settled === 0 ? "—" : `${summary.netUnits > 0 ? "+" : ""}${summary.netUnits.toFixed(2)} ${t("history.units")}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-relaxed text-dim",
								children: t("history.netHelp")
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 border-t border-white/8 pt-3 text-xs leading-relaxed text-muted",
					children: t("history.disclaimer")
				})]
			}),
			markets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise rise-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-bold text-fg",
						children: t("history.byPair")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-dim",
						children: t("history.draws")
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
										" · ",
										t("history.expiry"),
										" ",
										expiryLabel(market.seconds)
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-muted",
								children: [
									market.summary.decided,
									" ",
									t("history.decided")
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/4 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-dim",
									children: t("history.hitRate")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono font-bold text-fg",
									children: percent(market.summary.hitRate)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/4 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-dim",
									children: t("history.breakEven")
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
						children: !loaded ? t("history.loading") : t("history.empty")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-sm text-sm leading-relaxed text-dim",
						children: !loaded ? t("history.reading") : t("history.emptyHelp")
					}),
					loaded && entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "btn-prime mt-4 min-h-11 justify-center",
						children: t("history.goSignals")
					}) : null
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise rise-4 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-bold text-fg",
						children: t("history.latest")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-dim",
						children: entries.length > recent.length ? t("history.lastOf", {
							shown: recent.length,
							total: entries.length
						}) : t("history.records", { total: entries.length })
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
									formatDate(entry.startedAt, language),
									" · ",
									t("history.expiry"),
									" ",
									expiryLabel(entry.seconds),
									" · ",
									t("history.candles"),
									" ",
									expiryLabel(entry.analysisSeconds),
									entry.batchPosition ? ` · ${t("history.batchSeries", { current: entry.batchPosition })}` : ""
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
									children: t("history.direction")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `mt-1 font-semibold ${entry.direction === "call" ? "text-win" : "text-loss"}`,
									children: t(entry.direction === "call" ? "history.up" : "history.down")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/4 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-dim",
									children: t("history.price")
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
									children: t("history.payout")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono font-semibold text-fg",
									children: [entry.payout, "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/4 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-dim",
									children: t("history.step")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-semibold text-fg",
									children: t("history.attemptCount", {
										current: entry.step + 1,
										total: Math.max(4, entry.step + 1)
									})
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
