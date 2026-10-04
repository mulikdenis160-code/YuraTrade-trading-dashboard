import { o as __toESM } from "../_runtime.mjs";
import { a as lookbackForExpiry, n as analysisPeriodForExpiry, r as formatExpiry } from "./expiry-B3tUilyb.mjs";
import { _ as require_react, g as require_jsx_runtime, m as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as StatRow } from "./stats-CWuJX2kf.mjs";
import { l as ChevronDown, r as ShieldCheck } from "../_libs/lucide-react.mjs";
import { a as takeBest, d as isAdminId, f as usePocket, l as markSignalUsed, r as loadFeed, s as levelForBalance, u as signalsUsedToday } from "./router-JJoB_525.mjs";
import { t as AnalysisModal } from "./analysis-modal-BpAsIX59.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D1BNcEg0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var expiryOptionsMinutes = [
	1,
	2,
	3,
	5,
	10,
	15,
	25,
	30,
	60,
	120,
	180,
	240
];
function SignalDesk() {
	const navigate = useNavigate();
	const { id } = usePocket();
	const admin = isAdminId(id);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [feedStatus, setFeedStatus] = (0, import_react.useState)("connecting");
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [balance, setBalance] = (0, import_react.useState)(null);
	const [used, setUsed] = (0, import_react.useState)(0);
	const [expiryMinutes, setExpiryMinutes] = (0, import_react.useState)(1);
	(0, import_react.useEffect)(() => {
		let stop = false;
		const pull = () => {
			loadFeed().then((feed) => {
				if (stop) return;
				setReady(feed.pairs.length > 0);
				setFeedStatus(feed.pairs.length > 0 ? "connected" : "error");
				setBalance(feed.balance);
				setError("");
			}).catch((cause) => {
				if (stop) return;
				setReady(false);
				setFeedStatus("error");
				setError(cause instanceof Error ? cause.message : "Не удалось подключиться к Pocket Option.");
			});
		};
		pull();
		setUsed(signalsUsedToday());
		const timer = window.setInterval(pull, 8e3);
		return () => {
			stop = true;
			window.clearInterval(timer);
		};
	}, []);
	const level = levelForBalance(balance);
	const expirySeconds = expiryMinutes * 60;
	const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
	const lookbackBars = lookbackForExpiry(expirySeconds, analysisSeconds);
	const cap = admin ? null : level ? level.daily : 0;
	const left = cap === null ? null : Math.max(0, cap - used);
	const blocked = admin ? "" : balance === null ? "Депозит ещё не прочитан" : !level ? "Для сигналов нужен депозит от $60" : left === 0 ? "Лимит сигналов на сегодня закончился" : "";
	const ask = async () => {
		if (phase === "search" || blocked || !ready) return;
		setPhase("search");
		setError("");
		setNotice("");
		const started = Date.now();
		try {
			const result = await takeBest({ data: { expirySeconds } });
			if (!result) {
				setPhase("idle");
				setNotice("Сейчас нет подходящего входа. Наклон и последние свечи должны совпасть; дождитесь следующей проверки.");
				return;
			}
			const wait = Math.max(0, 2400 - (Date.now() - started));
			await new Promise((resolve) => window.setTimeout(resolve, wait));
			if (cap !== null) setUsed(markSignalUsed());
			await navigate({
				to: "/signal",
				search: {
					symbol: result.symbol,
					name: result.name,
					group: result.group,
					direction: result.direction,
					open: result.openPrice,
					payout: result.payout,
					seconds: expirySeconds,
					analysisSeconds: result.analysisSeconds,
					note: result.note,
					bars: result.bars,
					ruleScore: result.ruleScore,
					step: 0,
					started: Date.now()
				}
			});
		} catch (cause) {
			setPhase("idle");
			setError(cause instanceof Error ? cause.message : "Не удалось получить сигнал.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-md space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: `mb-3 flex items-center justify-center gap-2 text-xs font-semibold ${feedStatus === "connected" ? "text-win" : feedStatus === "error" ? "text-loss" : "text-dim"}`,
					role: "status",
					"aria-live": "polite",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: feedStatus === "connected" ? "live-dot" : "size-2 rounded-full bg-current" }), feedStatus === "connected" ? "Поток Pocket Option подключён" : feedStatus === "error" ? "Нет подключения к Pocket Option" : "Подключаемся к Pocket Option…"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-muted",
					children: "Проверяются пары с выплатой 92% и 80%. Выберите экспирацию от 1 минуты до 4 часов; интервал свечей и окно анализа подстроятся под срок. Фильтр пропускает спорные входы."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs leading-relaxed text-dim",
					children: "Порог Rule Score 0,22 — экспериментальное правило, не вероятность выигрыша. Сверяйте его с фактическими результатами в журнале."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4 rounded-2xl border border-white/8 bg-[#080b12]/70 p-3",
					"aria-label": "Настройка экспирации",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-fg",
								children: "Время экспирации"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-blue-soft",
								children: formatExpiry(expirySeconds)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-4 gap-2",
							children: expiryOptionsMinutes.map((minutes) => {
								const selected = expiryMinutes === minutes;
								const label = minutes < 120 ? `${minutes} мин` : `${minutes / 60} ч`;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": selected,
									title: formatExpiry(minutes * 60),
									onClick: () => setExpiryMinutes(minutes),
									className: `min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold transition ${selected ? "border-blue/40 bg-blue/12 text-blue-soft" : "border-white/10 bg-white/4 text-muted hover:bg-white/8"}`,
									children: label
								}, minutes);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs leading-relaxed text-dim",
							"aria-live": "polite",
							children: [
								"Анализ подстроен: свечи ",
								formatExpiry(analysisSeconds),
								", окно ",
								lookbackBars,
								" свечей"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-prime mt-4 min-h-12 w-full",
					disabled: !ready || phase === "search" || Boolean(blocked),
					onClick: () => void ask(),
					children: phase === "search" ? "Проверяем пары…" : "Получить сигнал"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: `mt-2 text-center text-xs ${blocked ? "text-loss" : "text-dim"}`,
					children: blocked || (admin || cap === null ? "Без лимита" : `Сегодня ${used} из ${cap}`)
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-loss",
					children: error
				}) : null,
				notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 rounded-xl border border-white/8 bg-white/4 px-3 py-3 text-sm leading-relaxed text-muted",
					role: "status",
					"aria-live": "polite",
					children: notice
				}) : null
			]
		}), phase === "search" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisModal, {
			pair: "Подбор пары",
			expiry: formatExpiry(expirySeconds)
		}) : null]
	});
}
var risks = [
	"1",
	"2",
	"3",
	"5"
];
function BalanceCalculator() {
	const [open, setOpen] = (0, import_react.useState)(true);
	const [balance, setBalance] = (0, import_react.useState)("");
	const [risk, setRisk] = (0, import_react.useState)("2");
	const [plan, setPlan] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const balanceNum = Number(balance) || 0;
	const riskNum = Number(risk) || 2;
	const trade = balanceNum * riskNum / 100;
	const steps = (0, import_react.useMemo)(() => {
		if (trade <= 0) return [];
		return [
			1,
			2,
			3,
			4
		].map((step) => {
			const amount = trade * 2 ** (step - 1);
			const loss = trade * (2 ** (step - 1) - 1);
			return {
				step,
				amount,
				loss,
				profit: amount * .85 - loss
			};
		});
	}, [trade]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex w-full items-center justify-between px-4 py-4 text-left",
			onClick: () => setOpen((v) => !v),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm font-semibold text-fg",
				children: "Калькулятор риска"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-sm text-dim",
				children: "Сумма входа и план удвоения"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `size-4 text-muted transition-transform ${open ? "rotate-180" : ""}` })]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 px-4 pb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Баланс, $", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						inputMode: "decimal",
						value: balance,
						placeholder: "1000",
						onChange: (event) => {
							setBalance(event.target.value.replace(/[^\d.]/g, ""));
							setSaved(false);
						},
						className: "field mt-2 h-12 px-3 font-mono"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm text-muted",
					children: "Риск на сделку"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: risks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `chip flex-1 ${risk === item ? "on" : ""}`,
						onClick: () => setRisk(item),
						children: [item, "%"]
					}, item))
				})] }),
				balanceNum > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-blue/10 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Рекомендуемая сумма"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-3xl font-extrabold text-blue-soft",
							children: ["$", trade.toFixed(2)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-dim",
							children: [
								riskNum,
								"% от $",
								balanceNum.toFixed(0)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-prime mt-3",
							onClick: () => {
								localStorage.setItem("last_trade_amount", trade.toFixed(2));
								setSaved(true);
							},
							children: saved ? "Сумма сохранена" : "Сохранить сумму"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-start gap-2 text-sm text-dim",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0 text-blue-soft" }), "Введите баланс, чтобы посчитать вход."]
				}),
				balanceNum > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `chip ${plan ? "on" : ""}`,
					onClick: () => setPlan((v) => !v),
					children: "План удвоения"
				}), plan ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2",
					children: [steps.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-4 gap-1 rounded-xl bg-white/3 px-2 py-2 text-center font-mono text-[11px] sm:gap-2 sm:px-3 sm:text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-blue-soft",
								children: row.step === 1 ? "Вход" : `×${2 ** (row.step - 1)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", row.amount.toFixed(2)] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-loss",
								children: row.loss > 0 ? `-$${row.loss.toFixed(2)}` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-win",
								children: ["+$", row.profit.toFixed(2)]
							})
						]
					}, row.step)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-dim",
						children: "Удвоение может перекрыть минус, но быстро съедает депозит. Дальше третьего шага лучше не идти."
					})]
				}) : null] }) : null
			]
		}) : null]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rise",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rise rise-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalDesk, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rise rise-3 mx-auto w-full max-w-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BalanceCalculator, {})
			})
		]
	});
}
//#endregion
export { Home as component };
