import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, g as require_jsx_runtime, m as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as EXPIRY_OPTIONS_MINUTES, r as analysisPeriodForExpiry } from "./expiry-BPQ3PYPw.mjs";
import { l as ChevronDown, r as ShieldCheck } from "../_libs/lucide-react.mjs";
import { C as formatExpiryForLanguage, S as usePocket, _ as levelForBalance, a as recentlyUsedSignalSymbols, b as signalsUsedToday, h as takeBest, i as readSignalJournal, p as loadFeed, w as useLanguage, x as isAdminId, y as markSignalUsed } from "./router-Biu5RFSJ.mjs";
import { t as StatRow } from "./stats-DsF2fVeP.mjs";
import { t as AnalysisModal } from "./analysis-modal-Doak8aSJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CAqur2MD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SignalDesk() {
	const navigate = useNavigate();
	const { id } = usePocket();
	const { language, t } = useLanguage();
	const admin = isAdminId(id);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [feedStatus, setFeedStatus] = (0, import_react.useState)("connecting");
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [feedError, setFeedError] = (0, import_react.useState)("");
	const [searchError, setSearchError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [balance, setBalance] = (0, import_react.useState)(null);
	const [used, setUsed] = (0, import_react.useState)(0);
	const [expiryMinutes, setExpiryMinutes] = (0, import_react.useState)(1);
	const attemptRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => () => {
		attemptRef.current += 1;
	}, []);
	(0, import_react.useEffect)(() => {
		let stop = false;
		const pull = () => {
			loadFeed().then((feed) => {
				if (stop) return;
				setReady(feed.pairs.length > 0);
				setFeedStatus(feed.pairs.length > 0 ? "connected" : "error");
				setBalance(feed.balance);
				setFeedError("");
			}).catch((cause) => {
				if (stop) return;
				setReady(false);
				setFeedStatus("error");
				setFeedError(cause instanceof Error ? cause.message : "Не удалось подключиться к Pocket Option.");
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
	const cap = admin ? null : level ? level.daily : 0;
	const left = cap === null ? null : Math.max(0, cap - used);
	const blocked = admin ? "" : balance === null ? t("signal.block.deposit") : !level ? t("signal.block.minimum") : left === 0 ? t("signal.block.limit") : "";
	const expiryLabel = (seconds) => formatExpiryForLanguage(seconds, language);
	const openSignal = async (candidate, attempt) => {
		if (attemptRef.current !== attempt) return;
		if (cap !== null) setUsed(markSignalUsed());
		await navigate({
			to: "/signal",
			search: {
				symbol: candidate.symbol,
				name: candidate.name,
				group: "fx",
				direction: candidate.direction,
				open: candidate.openPrice,
				payout: candidate.payout,
				seconds: candidate.seconds,
				analysisSeconds: candidate.analysisSeconds,
				note: candidate.note,
				bars: candidate.bars,
				aiConfidence: candidate.aiConfidence,
				step: 0,
				started: Date.now()
			}
		});
	};
	const showSearchError = (cause, attempt) => {
		if (attemptRef.current !== attempt) return;
		setPhase("idle");
		setSearchError(cause instanceof Error ? cause.message : t("signal.none"));
	};
	const ask = async () => {
		if (phase !== "idle" || blocked || !ready) return;
		const attempt = ++attemptRef.current;
		setPhase("search");
		setSearchError("");
		setNotice("");
		try {
			const candidate = await takeBest({ data: {
				expirySeconds,
				excludedSymbols: recentlyUsedSignalSymbols(readSignalJournal())
			} });
			if (attemptRef.current !== attempt) return;
			if (candidate.decision === "pass") {
				setNotice(candidate.reason);
				setPhase("idle");
				return;
			}
			await openSignal(candidate, attempt);
		} catch (cause) {
			showSearchError(cause, attempt);
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: feedStatus === "connected" ? "live-dot" : "size-2 rounded-full bg-current" }), feedStatus === "connected" ? t("signal.connected") : feedStatus === "error" ? t("signal.disconnected") : t("signal.connecting")]
				}),
				feedError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-center text-xs leading-relaxed text-loss",
					role: "status",
					"aria-live": "polite",
					children: feedError
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-muted",
					children: t("signal.description")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs leading-relaxed text-dim",
					children: t("signal.experimental")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4 rounded-2xl border border-white/8 bg-[#080b12]/70 p-3",
					"aria-label": t("signal.expiry"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-fg",
								children: t("signal.expiry")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-blue-soft",
								children: expiryLabel(expirySeconds)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-4 gap-2",
							children: EXPIRY_OPTIONS_MINUTES.map((minutes) => {
								const selected = expiryMinutes === minutes;
								const label = expiryLabel(minutes * 60);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: phase !== "idle",
									"aria-pressed": selected,
									title: expiryLabel(minutes * 60),
									onClick: () => setExpiryMinutes(minutes),
									className: `min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold transition ${selected ? "border-blue/40 bg-blue/12 text-blue-soft" : "border-white/10 bg-white/4 text-muted hover:bg-white/8"} disabled:cursor-not-allowed disabled:opacity-50`,
									children: label
								}, minutes);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-relaxed text-dim",
							"aria-live": "polite",
							children: t("signal.analyzed", { period: expiryLabel(analysisSeconds) })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-prime mt-4 min-h-12 w-full",
					disabled: !ready || phase !== "idle" || Boolean(blocked),
					onClick: () => void ask(),
					children: phase === "search" ? t("signal.checking") : t("signal.get")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: `mt-2 text-center text-xs ${blocked ? "text-loss" : "text-dim"}`,
					children: blocked || (admin || cap === null ? t("signal.noLimit") : t("signal.today", {
						used,
						cap
					}))
				}),
				searchError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4 rounded-2xl border border-loss/30 bg-loss/8 p-4 text-left",
					role: "alert",
					"aria-live": "assertive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-loss",
							children: t("signal.searchFailed")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed text-muted",
							children: searchError
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-ghost mt-3 min-h-10 w-full justify-center",
							disabled: !ready || phase !== "idle" || Boolean(blocked),
							onClick: () => void ask(),
							children: t("signal.tryAgain")
						})
					]
				}) : null,
				notice && phase === "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4 overflow-hidden rounded-3xl border border-blue/25 bg-[#0e1420] text-left shadow-[0_18px_50px_rgba(0,0,0,0.24)]",
					role: "status",
					"aria-live": "polite",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3 border-b border-white/6 bg-gradient-to-r from-blue/10 to-transparent p-4 sm:p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 shrink-0 place-items-center rounded-2xl border border-blue/25 bg-blue/10 text-blue-soft",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
								viewBox: "0 0 24 24",
								fill: "none",
								className: "size-5",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: "M12 8v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z",
									stroke: "currentColor",
									strokeWidth: "1.7",
									strokeLinecap: "round",
									strokeLinejoin: "round"
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-1 text-base font-bold leading-snug text-fg sm:text-lg",
								children: t("common.notConfirmed")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-sm leading-relaxed text-muted",
								children: t("signal.noSignalAtExpiry", { expiry: expiryLabel(expirySeconds) })
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 p-4 sm:p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-white/8 bg-black/20 p-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold tracking-[0.14em] text-dim uppercase",
								children: t("signal.reason")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-muted",
								children: notice
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-ghost min-h-11 w-full justify-center",
							disabled: !ready || phase !== "idle" || Boolean(blocked),
							onClick: () => void ask(),
							children: t("signal.tryAgain")
						})]
					})]
				}) : null
			]
		}), phase === "search" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisModal, {
			pair: t("home.eyebrow"),
			expiry: expiryLabel(expirySeconds)
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
	const { t } = useLanguage();
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
				children: t("calculator.title")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-sm text-dim",
				children: t("calculator.subtitle")
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `size-4 text-muted transition-transform ${open ? "rotate-180" : ""}` })]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 px-4 pb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: [t("calculator.balance"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
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
					children: t("calculator.risk")
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
							children: t("calculator.recommended")
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
							children: saved ? t("calculator.saved") : t("calculator.save")
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-start gap-2 text-sm text-dim",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0 text-blue-soft" }), t("calculator.enterBalance")]
				}),
				balanceNum > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `chip ${plan ? "on" : ""}`,
					onClick: () => setPlan((v) => !v),
					children: t("calculator.plan")
				}), plan ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2",
					children: [steps.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-4 gap-1 rounded-xl bg-white/3 px-2 py-2 text-center font-mono text-[11px] sm:gap-2 sm:px-3 sm:text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-blue-soft",
								children: row.step === 1 ? t("common.entryPrice") : `×${2 ** (row.step - 1)}`
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
						children: t("calculator.warning")
					})]
				}) : null] }) : null
			]
		}) : null]
	});
}
function Home() {
	const { t } = useLanguage();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rise",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel mb-4 overflow-hidden p-4 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-[0.16em] text-blue-soft uppercase",
							children: t("home.eyebrow")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-2xl font-extrabold tracking-tight text-fg sm:text-3xl",
							children: t("home.title")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base",
							children: t("home.body")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-2 sm:grid-cols-3",
							children: [
								"feature1",
								"feature2",
								"feature3"
							].map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-white/8 bg-white/4 px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-fg",
									children: t(`home.${feature}.title`)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs leading-relaxed text-dim",
									children: t(`home.${feature}.body`)
								})]
							}, feature))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm font-semibold text-blue-soft",
							children: t("home.rateCaption")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-relaxed text-dim",
							children: t("home.disclaimer")
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {})]
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
