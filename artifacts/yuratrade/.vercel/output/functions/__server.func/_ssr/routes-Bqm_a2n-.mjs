import { o as __toESM } from "../_runtime.mjs";
import { l as analysisPeriodForExpiry, n as EXPIRY_OPTIONS_MINUTES, s as SIGNAL_PREPARATION_TIMEOUT_MS } from "./expiry-CdwuYFWS.mjs";
import { _ as require_react, g as require_jsx_runtime, m as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as ChevronDown, r as ShieldCheck } from "../_libs/lucide-react.mjs";
import { A as levelForBalance, C as startSignalBatch, D as loadFeed, E as confirmSignalEntry, F as usePocket, I as formatExpiryForLanguage, L as useLanguage, M as markSignalUsed, N as signalsUsedToday, P as isAdminId, S as signalBatchWinRate, T as chooseSignalPair, _ as readSignalBatch, a as markSignalUnverified, b as resetSignalBatchSearchFailures, g as pauseSignalBatch, h as completeSignalBatchAttempt, k as takeSignal, o as readSignalJournal, s as recentlyUsedSignalSymbols, v as recordSignalBatchSearchFailure, w as subscribeToSignalBatch, x as resumeSignalBatch, y as requestSignalBatchStop } from "./router-CE8BS0vp.mjs";
import { t as StatRow } from "./stats-Nz11muEM.mjs";
import { n as waitForSignalRequest, t as settleSignalRequest } from "./signal-request-D1JknhjO.mjs";
import { n as copyPairName, t as AnalysisModal } from "./pair-clipboard-DEAFqSZK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bqm_a2n-.js
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
	const [pendingPair, setPendingPair] = (0, import_react.useState)(null);
	const [copyRemaining, setCopyRemaining] = (0, import_react.useState)(10);
	const [copiedPair, setCopiedPair] = (0, import_react.useState)(false);
	const [balance, setBalance] = (0, import_react.useState)(null);
	const [used, setUsed] = (0, import_react.useState)(0);
	const [expiryMinutes, setExpiryMinutes] = (0, import_react.useState)(2);
	const [batch, setBatch] = (0, import_react.useState)(null);
	const [batchLoaded, setBatchLoaded] = (0, import_react.useState)(false);
	const [batchNow, setBatchNow] = (0, import_react.useState)(Date.now());
	const [batchMessage, setBatchMessage] = (0, import_react.useState)("");
	const attemptRef = (0, import_react.useRef)(0);
	const autoBatchKeyRef = (0, import_react.useRef)("");
	const askRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => () => {
		attemptRef.current += 1;
	}, []);
	(0, import_react.useEffect)(() => {
		if (phase !== "copy" || !pendingPair) return;
		const update = () => {
			const remaining = Math.max(0, pendingPair.copyUntil - Date.now());
			setCopyRemaining(Math.ceil(remaining / 1e3));
		};
		update();
		const timer = window.setInterval(update, 100);
		return () => window.clearInterval(timer);
	}, [pendingPair, phase]);
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
	(0, import_react.useEffect)(() => {
		const update = () => {
			setBatch(readSignalBatch());
			setBatchLoaded(true);
		};
		update();
		return subscribeToSignalBatch(update);
	}, []);
	const level = levelForBalance(balance);
	const expirySeconds = expiryMinutes * 60;
	const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
	const cap = admin ? null : level ? level.daily : 0;
	const left = cap === null ? null : Math.max(0, cap - used);
	const blocked = admin ? "" : balance === null ? t("signal.block.deposit") : !level ? t("signal.block.minimum") : left === 0 ? t("signal.block.limit") : "";
	const expiryLabel = (seconds) => formatExpiryForLanguage(seconds, language);
	const hasActiveBatchSeries = (run) => readSignalJournal().some((entry) => entry.batchRunId === run.id && entry.batchPosition === run.completed + 1 && (entry.outcome === "pending" || entry.outcome === "overlay"));
	const openSignal = async (candidate, attempt, batchRun, batchPosition) => {
		if (attemptRef.current !== attempt) return;
		if (batchRun) {
			const current = readSignalBatch();
			if (!current || current.id !== batchRun.id || current.status !== "running" || current.completed + 1 !== batchPosition) {
				setPhase("idle");
				return;
			}
		}
		if (cap !== null) setUsed(markSignalUsed());
		if (batchRun) resetSignalBatchSearchFailures(batchRun.id);
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
				started: Date.now(),
				...batchRun && batchPosition !== null ? {
					batchRunId: batchRun.id,
					batchPosition
				} : {}
			}
		});
	};
	const showSearchError = (cause, attempt, batchRun) => {
		if (attemptRef.current !== attempt) return;
		setPhase("idle");
		setPendingPair(null);
		const message = cause instanceof Error ? cause.message : t("signal.none");
		setSearchError(message);
		if (batchRun) {
			const updated = recordSignalBatchSearchFailure(batchRun.id, message);
			setBatch(updated);
		}
	};
	const copySelectedPair = async () => {
		if (!pendingPair) return;
		try {
			await copyPairName(pendingPair.name);
			if (attemptRef.current === pendingPair.attempt) setCopiedPair(true);
		} catch {
			setCopiedPair(false);
		}
	};
	const ask = async (requestedBatch = null) => {
		if (phase !== "idle" || blocked || !ready) return;
		const batchRun = requestedBatch?.status === "running" ? requestedBatch : null;
		const batchPosition = batchRun ? batchRun.completed + 1 : null;
		const requestedExpiry = batchRun?.expirySeconds ?? expirySeconds;
		const attempt = ++attemptRef.current;
		const preparationDeadlineAtMs = Date.now() + SIGNAL_PREPARATION_TIMEOUT_MS;
		setPhase("choosing");
		setSearchError("");
		setNotice("");
		setPendingPair(null);
		try {
			const excludedSymbols = recentlyUsedSignalSymbols(readSignalJournal());
			const checkedSymbols = /* @__PURE__ */ new Set();
			let selected = null;
			let prepared = null;
			let lastReason = "";
			for (let index = 0; index < 4; index += 1) {
				const candidateBudgetMs = preparationDeadlineAtMs - Date.now();
				if (candidateBudgetMs <= 0) throw new Error(t("signal.analysisTimeout"));
				const candidate = await waitForSignalRequest(settleSignalRequest(chooseSignalPair({ data: { excludedSymbols: [...excludedSymbols, ...checkedSymbols] } })), candidateBudgetMs, t("signal.analysisTimeout"));
				if (attemptRef.current !== attempt) return;
				if (checkedSymbols.has(candidate.symbol)) break;
				checkedSymbols.add(candidate.symbol);
				const signalBudgetMs = preparationDeadlineAtMs - Date.now();
				if (signalBudgetMs <= 0) throw new Error(t("signal.analysisTimeout"));
				const result = await waitForSignalRequest(settleSignalRequest(takeSignal({ data: {
					symbol: candidate.symbol,
					expirySeconds: requestedExpiry
				} })), signalBudgetMs, t("signal.analysisTimeout"));
				if (attemptRef.current !== attempt) return;
				if (result.decision === "pass") {
					lastReason = result.reason;
					continue;
				}
				prepared = result;
				selected = {
					...candidate,
					attempt,
					seconds: requestedExpiry,
					copyUntil: result.releaseAtMs
				};
				break;
			}
			if (!selected || !prepared) {
				setNotice(lastReason || t("signal.none"));
				setPhase("idle");
				if (batchRun) setBatch(recordSignalBatchSearchFailure(batchRun.id, lastReason || t("signal.none")));
				return;
			}
			const readyPair = selected;
			setPendingPair(readyPair);
			setCopyRemaining(Math.max(0, Math.ceil((readyPair.copyUntil - Date.now()) / 1e3)));
			setCopiedPair(false);
			setPhase("copy");
			await new Promise((resolve) => {
				window.setTimeout(resolve, Math.max(0, readyPair.copyUntil - Date.now()));
			});
			if (attemptRef.current !== attempt) return;
			setPhase("analysis");
			const entry = await confirmSignalEntry({ data: { symbol: readyPair.symbol } });
			if (attemptRef.current !== attempt) return;
			await openSignal({
				...prepared,
				openPrice: entry.openPrice,
				symbol: readyPair.symbol,
				group: readyPair.group,
				seconds: readyPair.seconds
			}, attempt, batchRun, batchPosition);
		} catch (cause) {
			showSearchError(cause, attempt, batchRun);
		}
	};
	askRef.current = ask;
	(0, import_react.useEffect)(() => {
		if (!batchLoaded || !batch || batch.status !== "running" || phase !== "idle" || !ready || Boolean(blocked)) return;
		const position = batch.completed + 1;
		const initialEntries = readSignalJournal().filter((entry) => entry.batchRunId === batch.id && entry.batchPosition === position);
		for (const entry of initialEntries) if (entry.outcome === "pending" && Date.now() > entry.startedAt + entry.seconds * 1e3 + 1e4) {
			markSignalUnverified(entry.id);
			pauseSignalBatch(batch.id, "Котировку не удалось сверить в срок экспирации.");
		}
		const last = readSignalJournal().filter((entry) => entry.batchRunId === batch.id && entry.batchPosition === position).sort((a, b) => a.step - b.step || a.startedAt - b.startedAt).at(-1);
		if (last && (last.outcome === "win" || last.outcome === "draw" || last.outcome === "loss")) {
			const reconciled = completeSignalBatchAttempt(batch.id, position, last.outcome);
			setBatch(reconciled);
			if (!reconciled || reconciled.completed < position) setBatch(pauseSignalBatch(batch.id, "Не удалось сохранить завершение серии."));
			return;
		}
		if (last?.outcome === "unverified") {
			setBatch(pauseSignalBatch(batch.id, "Исход не удалось подтвердить котировкой."));
			return;
		}
		if (last && (last.outcome === "pending" || last.outcome === "overlay")) {
			const resumeKey = `resume:${batch.id}:${position}:${last.id}:${last.outcome}`;
			if (autoBatchKeyRef.current === resumeKey) return;
			autoBatchKeyRef.current = resumeKey;
			navigate({
				to: "/signal",
				search: {
					symbol: last.symbol,
					name: last.name,
					group: "fx",
					direction: last.direction,
					open: last.openPrice,
					payout: last.payout,
					seconds: last.seconds,
					analysisSeconds: last.analysisSeconds,
					note: last.note,
					bars: last.bars,
					aiConfidence: last.aiConfidence ?? null,
					step: last.step,
					started: last.startedAt,
					batchRunId: batch.id,
					batchPosition: position
				}
			}).catch(() => {
				autoBatchKeyRef.current = "";
			});
			return;
		}
		if (batch.nextAttemptAt > Date.now()) {
			const timer = window.setTimeout(() => setBatchNow(Date.now()), Math.min(1e3, batch.nextAttemptAt - Date.now()));
			return () => window.clearTimeout(timer);
		}
		const searchKey = `search:${batch.id}:${position}:${batch.nextAttemptAt}`;
		if (autoBatchKeyRef.current === searchKey) return;
		const timer = window.setTimeout(() => {
			if (autoBatchKeyRef.current === searchKey) return;
			autoBatchKeyRef.current = searchKey;
			askRef.current?.(batch);
		}, 0);
		return () => window.clearTimeout(timer);
	}, [
		batch,
		batchLoaded,
		batchNow,
		blocked,
		navigate,
		phase,
		ready
	]);
	const startBatch = () => {
		const started = startSignalBatch(expirySeconds);
		setBatch(started ?? readSignalBatch());
		setBatchMessage(started ? "" : t("batch.startFailed"));
		autoBatchKeyRef.current = "";
	};
	const pauseBatch = () => {
		if (!batch) return;
		const activeSeries = hasActiveBatchSeries(batch);
		if (phase !== "idle" && !activeSeries) {
			attemptRef.current += 1;
			setPhase("idle");
			setPendingPair(null);
		}
		setBatch(pauseSignalBatch(batch.id, "Пауза по запросу пользователя."));
	};
	const resumeBatch = () => {
		if (!batch) return;
		setBatch(resumeSignalBatch(batch.id));
		autoBatchKeyRef.current = "";
	};
	const stopBatch = () => {
		if (!batch) return;
		const activeSeries = hasActiveBatchSeries(batch);
		if (phase !== "idle" && !activeSeries) {
			attemptRef.current += 1;
			setPhase("idle");
			setPendingPair(null);
		}
		setBatch(requestSignalBatchStop(activeSeries));
	};
	const batchLocked = batch?.status === "running" || batch?.status === "paused" || batch?.status === "stopping";
	const batchWinRate = batch ? signalBatchWinRate(batch) : null;
	const batchStatusLabel = batch ? batch.status === "running" ? t("batch.running") : batch.status === "paused" ? t("batch.paused") : batch.status === "stopping" ? t("batch.stopping") : batch.status === "completed" ? t("batch.completed") : t("batch.stopped") : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-md space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
						className: "mt-4 rounded-2xl border border-blue/20 bg-blue/5 p-3.5",
						"aria-label": t("batch.title"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-9 shrink-0 place-items-center rounded-xl border border-blue/20 bg-blue/10 text-xs font-bold text-blue-soft",
									children: "20"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-bold text-fg",
										children: t("batch.title")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs leading-relaxed text-muted",
										children: t("batch.description")
									})]
								})]
							}),
							batch ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-blue-soft",
										children: batchStatusLabel
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-dim",
										children: expiryLabel(batch.expirySeconds)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 h-2 overflow-hidden rounded-full bg-white/8",
									role: "progressbar",
									"aria-valuemin": 0,
									"aria-valuemax": batch.target,
									"aria-valuenow": batch.completed,
									"aria-label": t("batch.progress"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-blue-soft transition-[width]",
										style: { width: `${batch.completed / batch.target * 100}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1.5 text-xs text-muted",
									children: [
										t("batch.progress"),
										": ",
										batch.completed,
										"/",
										batch.target
									]
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
										className: "rounded-xl bg-black/20 px-2 py-2",
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
									className: "mt-2 flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-muted",
										children: t("batch.winRate")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-[10px] leading-relaxed text-dim",
										children: t("batch.winRateHelp")
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "shrink-0 font-mono text-lg font-bold text-win",
										children: batchWinRate === null ? "—" : `${batchWinRate.toFixed(1)}%`
									})]
								}),
								batch.status === "paused" && batch.lastError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs leading-relaxed text-loss",
									role: "status",
									children: t("batch.error", { reason: batch.lastError })
								}) : batch.status === "running" && batch.lastError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-xs leading-relaxed text-dim",
									role: "status",
									children: [batch.lastError, batch.nextAttemptAt > batchNow ? ` · ${t("batch.retry", { seconds: Math.ceil((batch.nextAttemptAt - batchNow) / 1e3) })}` : ""]
								}) : null
							] }) : null,
							batchMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-loss",
								role: "alert",
								children: batchMessage
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid grid-cols-2 gap-2",
								children: [
									!batchLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "btn-prime min-h-10 w-full justify-center text-xs",
										disabled: !batchLoaded || !ready || Boolean(blocked) || phase !== "idle",
										onClick: startBatch,
										children: t("batch.start")
									}) : null,
									batch?.status === "running" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "btn-ghost min-h-10 w-full justify-center text-xs",
										onClick: pauseBatch,
										children: t("batch.pause")
									}) : null,
									batch?.status === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "btn-prime min-h-10 w-full justify-center text-xs",
										onClick: resumeBatch,
										children: t("batch.resume")
									}) : null,
									batch && (batch.status === "running" || batch.status === "paused") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "btn-ghost min-h-10 w-full justify-center text-xs",
										onClick: stopBatch,
										children: t("batch.stop")
									}) : null,
									batch?.status === "stopping" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "col-span-2 rounded-xl bg-black/20 px-3 py-2 text-center text-xs text-muted",
										children: t("batch.stopping")
									}) : null
								]
							})
						]
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
										disabled: phase !== "idle" || batchLocked,
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
						disabled: !ready || phase !== "idle" || Boolean(blocked) || batchLocked && batch?.status !== "running",
						onClick: () => void ask(batch?.status === "running" ? batch : null),
						children: phase === "copy" ? t("signal.pairReady") : phase === "idle" ? t("signal.get") : t("signal.checking")
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
			}),
			phase === "choosing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisModal, {
				pair: t("home.eyebrow"),
				expiry: expiryLabel(expirySeconds)
			}) : null,
			phase === "copy" && pendingPair ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisModal, {
				pair: pendingPair.name,
				expiry: expiryLabel(pendingPair.seconds),
				countdown: copyRemaining,
				copied: copiedPair,
				onCopy: () => void copySelectedPair()
			}) : null,
			phase === "analysis" && pendingPair ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisModal, {
				pair: pendingPair.name,
				expiry: expiryLabel(pendingPair.seconds)
			}) : null
		]
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
