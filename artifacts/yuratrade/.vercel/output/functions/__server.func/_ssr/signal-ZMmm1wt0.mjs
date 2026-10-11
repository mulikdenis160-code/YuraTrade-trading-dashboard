import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, g as require_jsx_runtime, m as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as getTelegramInitData, s as SIGNAL_PREPARATION_TIMEOUT_MS } from "./pocket-gate.middleware-DqGlDVU6.mjs";
import { C as confirmSignalEntry, E as takeSignal, O as formatExpiryForLanguage, T as readClose, _ as pauseSignalBatch, a as markSignalUnverified, f as signalRecordId, g as completeSignalBatchAttempt, k as useLanguage, l as recordSignalOutcome, n as Route$2, o as readSignalJournal, r as classifySignalAttempt, u as recordSignalStarted } from "./router-B0F2hKW2.mjs";
import { a as waitForSignalRequest, i as visibleSignalReleaseAt, n as settleSignalRequest } from "./signal-release-time-DXaFUgGS.mjs";
import { n as copyPairName, t as AnalysisModal } from "./pair-clipboard-B7jmJTMS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signal-ZMmm1wt0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var country = {
	AED: "ae",
	ARS: "ar",
	AUD: "au",
	BDT: "bd",
	BHD: "bh",
	BRL: "br",
	CAD: "ca",
	CHF: "ch",
	CLP: "cl",
	CNH: "cn",
	CNY: "cn",
	COP: "co",
	DZD: "dz",
	EGP: "eg",
	EUR: "eu",
	GBP: "gb",
	HUF: "hu",
	IDR: "id",
	INR: "in",
	IRR: "ir",
	JOD: "jo",
	JPY: "jp",
	KES: "ke",
	LBP: "lb",
	MAD: "ma",
	MXN: "mx",
	MYR: "my",
	NGN: "ng",
	NOK: "no",
	NZD: "nz",
	OMR: "om",
	PHP: "ph",
	PKR: "pk",
	QAR: "qa",
	RUB: "ru",
	SAR: "sa",
	SGD: "sg",
	SYP: "sy",
	THB: "th",
	TND: "tn",
	TRY: "tr",
	UAH: "ua",
	USD: "us",
	VND: "vn",
	YER: "ye",
	ZAR: "za",
	PLN: "pl",
	SEK: "se",
	DKK: "dk",
	CZK: "cz",
	ILS: "il",
	KRW: "kr",
	HKD: "hk",
	KWD: "kw",
	BGN: "bg",
	RON: "ro"
};
var stockTicker = {
	AAPL: "AAPL",
	MSFT: "MSFT",
	AMZN: "AMZN",
	TSLA: "TSLA",
	NFLX: "NFLX",
	AMD: "AMD",
	INTC: "INTC",
	CSCO: "CSCO",
	PFE: "PFE",
	JNJ: "JNJ",
	AXP: "AXP",
	XOM: "XOM",
	BA: "BA",
	MCD: "MCD",
	VISA: "V",
	CITI: "C",
	FDX: "FDX",
	GME: "GME",
	BABA: "BABA",
	COIN: "COIN",
	PLTR: "PLTR",
	MARA: "MARA",
	FB: "META"
};
function cryptoCode(symbol) {
	const value = symbol.toUpperCase();
	if (value.startsWith("BITB") || value.startsWith("BTC")) return "btc";
	if (value.startsWith("ETH")) return "eth";
	if (value.startsWith("BNB")) return "bnb";
	if (value.startsWith("ADA")) return "ada";
	if (value.startsWith("LINK")) return "link";
	if (value.startsWith("MATIC")) return "matic";
	if (value.startsWith("SOL")) return "sol";
	if (value.startsWith("DOGE")) return "doge";
	if (value.startsWith("DOT")) return "dot";
	if (value.startsWith("TRX")) return "trx";
	if (value.startsWith("TON")) return "ton";
	if (value.startsWith("LTC")) return "ltc";
	if (value.startsWith("AVAX")) return "avax";
	if (value.startsWith("DASH")) return "dash";
	return "";
}
function pictureOf(symbol, group) {
	if (group === "crypto") {
		const code = cryptoCode(symbol);
		return code ? `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@0.18.1/32/color/${code}.png` : "";
	}
	if (group === "stock") {
		const ticker = stockTicker[symbol.replace(/^#/, "").replace(/_otc$/i, "").toUpperCase()];
		return ticker ? `https://financialmodelingprep.com/image-stock/${ticker}.png` : "";
	}
	return "";
}
function Flags({ name }) {
	const parts = name.replace(/\s+OTC$/i, "").split("/");
	const codes = parts.length === 2 ? parts.map((code) => country[code]).filter(Boolean) : [];
	if (codes.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "flex shrink-0 items-center",
		children: codes.map((code, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: `https://flagcdn.com/w40/${code}.png`,
			alt: "",
			width: 22,
			height: 22,
			className: `size-[22px] rounded-full border border-[#2c3a50] object-cover ${index > 0 ? "-ml-1.5" : ""}`,
			decoding: "async"
		}, `${code}-${index}`))
	});
}
function Commodity({ symbol }) {
	const oil = /brent|crude/i.test(symbol);
	const gas = /XNG/i.test(symbol);
	const gold = /XAU/i.test(symbol);
	const silver = /XAG/i.test(symbol);
	const fill = gold ? "#f0c040" : silver ? "#d5dde8" : oil ? "#3dd68c" : gas ? "#ff5d73" : "#8ecbff";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: "size-6",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "15",
				fill: "#1c2636"
			}),
			oil ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 6c4 6 6 9 6 13a6 6 0 1 1-12 0c0-4 2-7 6-13z",
				fill
			}) : null,
			gas ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 7c2 4 5 6 5 10a5 5 0 1 1-10 0c0-2 1-3 2-5-1 3 1 4 2 4 0-3 1-6 1-9z",
				fill
			}) : null,
			gold || silver ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "7",
				fill
			}) : null,
			!oil && !gas && !gold && !silver ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "6",
				fill: "none",
				stroke: fill,
				strokeWidth: "3"
			}) : null
		]
	});
}
function Letter({ name }) {
	const letter = name.replace(/\s+OTC$/i, "").trim().slice(0, 1) || "•";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs font-bold text-blue-soft",
		children: letter
	});
}
function PairMark({ symbol, name, group }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	if (group === "fx") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flags, { name });
	if (group === "commodity") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Commodity, { symbol });
	const src = failed ? "" : pictureOf(symbol, group);
	if (group === "stock" && !src) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-7 shrink-0 place-items-center rounded-full bg-[#1c2636]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 32 32",
			className: "size-5",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M6 22h4V12H6zm8 0h4V8h-4zm8 0h4v-6h-4z",
				fill: "#8ecbff"
			})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1c2636]",
		children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: "",
			width: 28,
			height: 28,
			className: "size-7 object-cover",
			decoding: "async",
			onError: () => setFailed(true)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Letter, { name })
	});
}
function CandleChart({ bars, entry, live }) {
	if (bars.length < 2) return null;
	const width = 320;
	const height = 168;
	const pad = 12;
	const prices = bars.flatMap((bar) => [bar[1], bar[2]]);
	prices.push(entry);
	if (live !== null) prices.push(live);
	const max = Math.max(...prices);
	const span = max - Math.min(...prices) || Math.abs(entry) * 1e-4 || 1;
	const yOf = (price) => pad + (max - price) / span * 144;
	const slot = 296 / bars.length;
	const entryY = yOf(entry);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${width} ${height}`,
		className: "mt-4 h-44 w-full rounded-2xl bg-[#080b12]",
		role: "img",
		"aria-label": "График свечей",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: pad,
				x2: 308,
				y1: entryY,
				y2: entryY,
				stroke: "#8ecbff",
				strokeDasharray: "4 4",
				strokeWidth: "1"
			}),
			bars.map((bar, index) => {
				const [open, high, low, close] = bar;
				const color = close >= open ? "#3dd68c" : "#ff5d73";
				const bodyWidth = Math.max(2, slot * .62);
				const x = pad + index * slot + (slot - bodyWidth) / 2;
				const top = yOf(Math.max(open, close));
				const bottom = yOf(Math.min(open, close));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: x + bodyWidth / 2,
					x2: x + bodyWidth / 2,
					y1: yOf(high),
					y2: yOf(low),
					stroke: color,
					strokeWidth: "1.2"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x,
					y: top,
					width: bodyWidth,
					height: Math.max(1.4, bottom - top),
					fill: color,
					rx: "1"
				})] }, index);
			}),
			live !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 308,
				cy: yOf(live),
				r: "3.5",
				fill: live >= entry ? "#3dd68c" : "#ff5d73"
			}) : null
		]
	});
}
function digitsOf(price) {
	if (price >= 100) return 2;
	if (price >= 10) return 3;
	return 5;
}
function clock(ms) {
	const total = Math.ceil(ms / 1e3);
	const minutes = Math.floor(total / 60);
	const seconds = total % 60;
	if (minutes >= 60) return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
function BackLink() {
	const { t } = useLanguage();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/",
		className: "press inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-semibold text-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 16 16",
			className: "size-4 text-blue-soft",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M10.5 3.5 6 8l4.5 4.5",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.8",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		}), t("common.back")]
	});
}
function SignalRoute() {
	const search = Route$2.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalCard, { search }, `${search.started}-${search.step}`);
}
function SignalCard({ search }) {
	const { language, t } = useLanguage();
	const navigate = useNavigate();
	const expiryLabel = (seconds) => formatExpiryForLanguage(seconds, language);
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const [phase, setPhase] = (0, import_react.useState)("run");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [copyRemaining, setCopyRemaining] = (0, import_react.useState)(10);
	const [close, setClose] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [journalWarning, setJournalWarning] = (0, import_react.useState)("");
	const [live, setLive] = (0, import_react.useState)(null);
	const [liveStatus, setLiveStatus] = (0, import_react.useState)("connecting");
	const [liveMessage, setLiveMessage] = (0, import_react.useState)("");
	const [copyUntil, setCopyUntil] = (0, import_react.useState)(null);
	const [preparedRecovery, setPreparedRecovery] = (0, import_react.useState)(null);
	const settled = (0, import_react.useRef)(false);
	const journalId = signalRecordId({
		symbol: search.symbol,
		startedAt: search.started,
		step: search.step
	});
	const until = search.started + search.seconds * 1e3;
	const left = Math.max(0, until - now);
	const up = search.direction === "call";
	const copyCurrentPair = async () => {
		try {
			await copyPairName(search.name);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1400);
		} catch {
			setCopied(false);
		}
	};
	(0, import_react.useEffect)(() => {
		if (!search.symbol || !search.open) return;
		const existing = readSignalJournal().find((entry) => entry.id === journalId);
		if (existing) {
			if (existing.outcome === "pending" && search.batchRunId && Date.now() > existing.startedAt + existing.seconds * 1e3 + 1e4) {
				markSignalUnverified(existing.id);
				pauseSignalBatch(search.batchRunId, "Котировку не удалось сверить в срок экспирации.");
				setPhase("no-signal");
				setError("Котировку не удалось сверить в срок экспирации; исход не придуман.");
				return;
			}
			if (existing.outcome === "overlay") {
				setClose(existing.closePrice ?? null);
				setPhase("preparing-recovery");
			} else if (existing.outcome === "unverified") {
				setPhase("no-signal");
				setError("Исход не удалось подтвердить по котировкам; результат не придуман.");
				if (search.batchRunId) pauseSignalBatch(search.batchRunId, "Исход не удалось подтвердить котировкой.");
			} else if (existing.outcome === "win" || existing.outcome === "draw" || existing.outcome === "loss") {
				setClose(existing.closePrice ?? null);
				setPhase(existing.outcome === "win" ? "win" : existing.outcome === "draw" ? "draw" : "stop");
				if (search.batchRunId && search.batchPosition) completeSignalBatchAttempt(search.batchRunId, search.batchPosition, existing.outcome);
			}
			return;
		}
		const saved = recordSignalStarted({
			id: journalId,
			symbol: search.symbol,
			name: search.name,
			group: search.group,
			direction: search.direction,
			openPrice: search.open,
			payout: search.payout,
			seconds: search.seconds,
			analysisSeconds: search.analysisSeconds,
			step: search.step,
			startedAt: search.started,
			...search.batchRunId && search.batchPosition ? {
				batchRunId: search.batchRunId,
				batchPosition: search.batchPosition
			} : {},
			aiConfidence: search.aiConfidence ?? void 0,
			strategyVersion: "direct-ai-v3-adaptive-timeframe",
			note: search.note,
			bars: search.bars
		});
		setJournalWarning(saved ? "" : "Не удалось сохранить сигнал в локальный журнал браузера.");
		if (!saved && search.batchRunId) pauseSignalBatch(search.batchRunId, "Не удалось сохранить сигнал в локальной истории.");
	}, [
		journalId,
		search.aiConfidence,
		search.analysisSeconds,
		search.batchPosition,
		search.batchRunId,
		search.bars,
		search.direction,
		search.group,
		search.name,
		search.note,
		search.open,
		search.payout,
		search.seconds,
		search.started,
		search.step,
		search.symbol
	]);
	(0, import_react.useEffect)(() => {
		if (phase !== "run") return;
		const timer = window.setInterval(() => setNow(Date.now()), 200);
		return () => window.clearInterval(timer);
	}, [phase]);
	(0, import_react.useEffect)(() => {
		if (phase !== "copy" || copyUntil === null) return;
		const update = () => {
			const remaining = Math.max(0, copyUntil - Date.now());
			setCopyRemaining(Math.ceil(remaining / 1e3));
			if (remaining <= 0) setPhase("hunt");
		};
		update();
		const timer = window.setInterval(update, 100);
		return () => window.clearInterval(timer);
	}, [copyUntil, phase]);
	(0, import_react.useEffect)(() => {
		if (phase !== "run" || !search.symbol) return;
		const controller = new AbortController();
		const consumeStream = async () => {
			while (!controller.signal.aborted) try {
				const response = await fetch(`/api/ticks?symbol=${encodeURIComponent(search.symbol)}`, {
					headers: { "x-telegram-init-data": getTelegramInitData() },
					signal: controller.signal
				});
				if (response.status === 401) {
					setLiveStatus("error");
					setLiveMessage(t("signal.telegramExpired"));
					return;
				}
				if (!response.ok || !response.body) throw new Error("Quote stream unavailable.");
				setLiveStatus("connecting");
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				while (!controller.signal.aborted) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					let boundary = buffer.indexOf("\n\n");
					while (boundary >= 0) {
						const block = buffer.slice(0, boundary).replace(/\r/g, "");
						buffer = buffer.slice(boundary + 2);
						let eventName = "message";
						let data = "";
						for (const line of block.split("\n")) {
							if (line.startsWith("event:")) eventName = line.slice(6).trim();
							if (line.startsWith("data:")) data += `${data ? "\n" : ""}${line.slice(5).trimStart()}`;
						}
						if (eventName === "feed-status") try {
							const status = JSON.parse(data);
							if (status.status === "connected" || status.status === "connecting" || status.status === "error") {
								setLiveStatus(status.status);
								setLiveMessage(status.message ?? "");
							}
						} catch {
							setLiveStatus("error");
							setLiveMessage(t("signal.streamInterrupted"));
						}
						else if (eventName === "message") {
							const next = Number(data);
							if (Number.isFinite(next)) {
								setLive(next);
								setLiveStatus("connected");
								setLiveMessage("");
							}
						}
						boundary = buffer.indexOf("\n\n");
					}
				}
				if (!controller.signal.aborted) throw new Error("Quote stream ended.");
			} catch {
				if (controller.signal.aborted) return;
				setLiveStatus("error");
				setLiveMessage(t("signal.streamInterrupted"));
				await new Promise((resolve) => window.setTimeout(resolve, 2e3));
			}
		};
		consumeStream();
		return () => controller.abort();
	}, [
		phase,
		search.symbol,
		t
	]);
	(0, import_react.useEffect)(() => {
		if (phase !== "run" || left > 0 || settled.current || !search.symbol) return;
		settled.current = true;
		setPhase("check");
		readClose({ data: { symbol: search.symbol } }).then((quote) => {
			setClose(quote.close);
			const digits = Math.max(digitsOf(search.open), digitsOf(quote.close));
			const entry = Number(search.open.toFixed(digits));
			const finish = Number(quote.close.toFixed(digits));
			const move = finish === entry ? 0 : finish > entry ? 1 : -1;
			const outcome = classifySignalAttempt(search.direction, move, search.step);
			const saved = recordSignalOutcome(journalId, quote.close, outcome);
			if (!saved) setJournalWarning("Результат не удалось сохранить в локальный журнал.");
			if (search.batchRunId && search.batchPosition) {
				if (outcome === "overlay") {
					if (!saved) pauseSignalBatch(search.batchRunId, "Не удалось сохранить исход серии в истории.");
				} else if (saved) {
					const completed = completeSignalBatchAttempt(search.batchRunId, search.batchPosition, outcome);
					if (!completed || completed.completed < search.batchPosition) pauseSignalBatch(search.batchRunId, "Не удалось сохранить завершение серии.");
				} else pauseSignalBatch(search.batchRunId, "Не удалось сохранить исход серии в истории.");
			}
			if (outcome === "draw") {
				setPhase("draw");
				return;
			}
			if (outcome === "win") setPhase("win");
			else if (outcome === "loss") setPhase("stop");
			else {
				setCopied(false);
				setCopyRemaining(10);
				setCopyUntil(null);
				setPreparedRecovery(null);
				setPhase("preparing-recovery");
			}
		}).catch((cause) => {
			if (search.batchRunId) pauseSignalBatch(search.batchRunId, "Не удалось сверить котировку; результат не придуман.");
			setError(cause instanceof Error ? cause.message : "Не удалось сверить цену.");
			if (search.batchRunId && Date.now() > until + 1e4) {
				markSignalUnverified(journalId);
				setPhase("no-signal");
				setError("Котировку не удалось сверить в срок экспирации; исход не придуман.");
				return;
			}
			window.setTimeout(() => {
				settled.current = false;
				setPhase("run");
			}, 8e3);
		});
	}, [
		journalId,
		left,
		phase,
		search.batchPosition,
		search.batchRunId,
		search.open,
		search.step,
		search.symbol,
		until,
		up
	]);
	(0, import_react.useEffect)(() => {
		if (phase !== "preparing-recovery") return;
		let stop = false;
		waitForSignalRequest(settleSignalRequest(takeSignal({ data: {
			symbol: search.symbol,
			expirySeconds: search.seconds
		} })), SIGNAL_PREPARATION_TIMEOUT_MS, t("signal.analysisTimeout")).then((result) => {
			if (result.decision === "pass") {
				if (stop) return;
				setPhase("no-signal");
				setError(result.reason);
				if (search.batchRunId) pauseSignalBatch(search.batchRunId, "Не удалось подтвердить сигнал для следующей попытки.");
				return;
			}
			if (stop) return;
			setPreparedRecovery(result);
			const visibleReleaseAt = visibleSignalReleaseAt(result.releaseAtMs, Date.now());
			setCopyUntil(visibleReleaseAt);
			setCopyRemaining(Math.max(0, Math.ceil((visibleReleaseAt - Date.now()) / 1e3)));
			setPhase("copy");
		}).catch((cause) => {
			if (stop) return;
			setPhase("no-signal");
			setError(cause instanceof Error ? cause.message : "Не удалось подготовить перекрытие.");
			if (search.batchRunId) pauseSignalBatch(search.batchRunId, "Не удалось подготовить подтверждённое перекрытие.");
		});
		return () => {
			stop = true;
		};
	}, [
		phase,
		search.seconds,
		search.symbol,
		t
	]);
	(0, import_react.useEffect)(() => {
		if (phase !== "hunt" || !preparedRecovery) return;
		let stop = false;
		confirmSignalEntry({ data: { symbol: search.symbol } }).then(async (entry) => {
			if (stop) return;
			await navigate({
				to: "/signal",
				replace: true,
				search: {
					symbol: search.symbol,
					name: preparedRecovery.name,
					group: search.group,
					direction: preparedRecovery.direction,
					open: entry.openPrice,
					payout: preparedRecovery.payout,
					seconds: search.seconds,
					analysisSeconds: preparedRecovery.analysisSeconds,
					note: preparedRecovery.note,
					bars: preparedRecovery.bars,
					aiConfidence: preparedRecovery.aiConfidence,
					step: search.step + 1,
					started: Date.now(),
					...search.batchRunId && search.batchPosition ? {
						batchRunId: search.batchRunId,
						batchPosition: search.batchPosition
					} : {}
				}
			});
		}).catch((cause) => {
			if (stop) return;
			setPhase("no-signal");
			setError(cause instanceof Error ? cause.message : "Не удалось подтвердить вход перекрытия.");
			if (search.batchRunId) pauseSignalBatch(search.batchRunId, "Не удалось подтвердить цену входа для перекрытия.");
		});
		return () => {
			stop = true;
		};
	}, [
		navigate,
		phase,
		preparedRecovery,
		search.group,
		search.seconds,
		search.step,
		search.symbol
	]);
	(0, import_react.useEffect)(() => {
		if (!search.batchRunId || phase !== "win" && phase !== "draw" && phase !== "stop") return;
		const timer = window.setTimeout(() => {
			navigate({ to: "/" });
		}, 2200);
		return () => window.clearTimeout(timer);
	}, [
		navigate,
		phase,
		search.batchRunId
	]);
	if (!search.symbol || !search.open) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackLink, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-muted",
			children: t("common.noSignal")
		})]
	});
	if (phase === "no-signal") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackLink, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel arrive mt-3 overflow-hidden rounded-3xl border border-blue/25 bg-[#0e1420] p-0 text-left shadow-[0_18px_50px_rgba(0,0,0,0.24)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold tracking-[0.16em] text-blue-soft uppercase",
								children: t("common.skipEntry")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 text-lg font-bold leading-snug text-fg sm:text-xl",
								children: t("common.notConfirmed")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-muted",
								children: error || t("common.skipReason")
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 p-4 sm:flex-row sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/history",
						className: "btn-ghost min-h-11 flex-1 justify-center",
						children: t("common.openHistory")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "btn-prime min-h-11 flex-1 justify-center",
						children: t("common.toSignals")
					})]
				}),
				journalWarning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-4 mb-4 rounded-xl border border-loss/25 bg-loss/5 p-3 text-xs leading-relaxed text-loss sm:mx-5",
					role: "status",
					children: journalWarning
				}) : null
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackLink, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "panel arrive mt-3 p-3 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-[#10151f]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PairMark, {
									symbol: search.symbol,
									name: search.name,
									group: search.group
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-lg font-extrabold tracking-tight text-fg sm:text-xl",
									children: search.name.replace(/\s+OTC$/i, "")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-semibold tracking-[0.16em] text-blue-soft uppercase",
										children: /\sOTC$/i.test(search.name) ? "OTC" : t("common.categoryFx")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "press min-h-10 shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-blue-soft",
										onClick: () => void copyCurrentPair(),
										children: copied ? t("common.copied") : t("common.copy")
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex shrink-0 flex-col items-end gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-blue-soft",
									children: expiryLabel(search.seconds)
								}), search.step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] font-semibold text-dim",
									children: [search.step, "/3"]
								}) : null]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs leading-relaxed text-dim",
						children: [
							t("history.expiry"),
							" ",
							expiryLabel(search.seconds),
							" · ",
							t("history.candles"),
							" ",
							expiryLabel(search.analysisSeconds)
						]
					}),
					phase === "run" || phase === "check" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "glow-text mt-4 text-center font-mono text-4xl font-bold text-fg sm:text-5xl",
						children: phase === "check" ? "…" : clock(left)
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-3 text-3xl font-extrabold sm:text-4xl ${up ? "text-win" : "text-loss"}`,
						children: t(up ? "history.up" : "history.down")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, {
						bars: search.bars,
						entry: search.open,
						live: phase === "run" ? live : close
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2",
						children: search.note.split("\n").filter(Boolean).map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "arrive rounded-xl bg-white/4 px-3 py-2 text-sm leading-snug text-muted",
							style: { animationDelay: `${index * 60}ms` },
							children: line
						}, line))
					}),
					search.aiConfidence !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-2xl border border-blue/20 bg-blue/5 p-4",
						"aria-live": "polite",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold tracking-[0.14em] text-blue-soft uppercase",
								children: t("ai.title")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-lg font-bold text-fg",
								children: [search.aiConfidence, "/100"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-relaxed text-muted",
							children: t("ai.explanation")
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-dim",
							children: t("common.entryPrice")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 font-mono text-xl font-bold text-fg sm:text-2xl",
							children: search.open.toFixed(digitsOf(search.open))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-dim",
							children: t("history.payout")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
							className: "mt-1 font-mono text-xl font-bold text-fg sm:text-2xl",
							children: [search.payout, "%"]
						})] })]
					}),
					phase === "run" || phase === "check" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl border border-white/10 bg-[#080b12] px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: `flex items-center justify-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase ${liveStatus === "connected" ? "text-win" : liveStatus === "error" ? "text-loss" : "text-dim"}`,
								role: "status",
								"aria-live": "polite",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: liveStatus === "connected" ? "live-dot" : "size-2 rounded-full bg-current" }), liveStatus === "connected" ? t("common.quoteActive") : liveStatus === "error" ? t("common.quoteUnavailable") : t("common.quoteWaiting")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `mt-2 font-mono text-4xl font-extrabold tracking-tight sm:text-5xl ${live === null || live === search.open ? "text-fg" : live > search.open ? "text-win" : "text-loss"}`,
								children: live === null ? "…" : live.toFixed(digitsOf(live))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `mt-1 font-mono text-sm font-semibold ${live === null || live === search.open ? "text-dim" : live > search.open ? "text-win" : "text-loss"}`,
								children: live === null ? t("common.waitQuote") : live === search.open ? t("common.noChange") : `${live > search.open ? "+" : "−"}${Math.abs(live - search.open).toFixed(digitsOf(search.open))} ${t("common.fromEntry")}`
							}),
							liveMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `mt-2 text-xs ${liveStatus === "error" ? "text-loss" : "text-dim"}`,
								children: liveMessage
							}) : null
						]
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-loss",
						children: error
					}) : null,
					journalWarning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-relaxed text-loss",
						role: "status",
						children: journalWarning
					}) : null
				]
			}),
			phase === "win" && close !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "win-screen",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "spark spark-a" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "spark spark-b" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "spark spark-c" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "spark spark-d" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						viewBox: "0 0 72 72",
						className: "win-check",
						"aria-hidden": true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "36",
							cy: "36",
							r: "32",
							fill: "none",
							stroke: "#3dd68c",
							strokeWidth: "3"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M22 37l10 10 18-20",
							fill: "none",
							stroke: "#3dd68c",
							strokeWidth: "4",
							strokeLinecap: "round",
							strokeLinejoin: "round"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm font-semibold tracking-[0.18em] text-win uppercase",
						children: t("common.win")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-2xl font-extrabold text-fg",
						children: t(up ? "common.priceRose" : "common.priceFell")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 font-mono text-lg text-fg",
						children: [
							search.open.toFixed(digitsOf(search.open)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mx-2 text-win",
								children: "→"
							}),
							close.toFixed(digitsOf(close))
						]
					})
				]
			}) : null,
			phase === "draw" && close !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel arrive mt-4 px-6 py-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tracking-[0.16em] text-blue-soft uppercase",
						children: t("common.draw")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-lg font-bold text-fg",
						children: t("common.refund")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-sm text-muted",
						children: [
							search.open.toFixed(digitsOf(search.open)),
							" → ",
							close.toFixed(digitsOf(close))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-dim",
						children: t("common.priceUnchanged")
					})
				]
			}) : null,
			phase === "stop" && close !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel arrive mt-4 px-6 py-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tracking-[0.16em] text-loss uppercase",
						children: t("common.loss")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-lg font-bold text-fg",
						children: t("common.recoveryStop")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-sm text-muted",
						children: [
							search.open.toFixed(digitsOf(search.open)),
							" → ",
							close.toFixed(digitsOf(close))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/history",
							className: "btn-ghost min-h-11 justify-center",
							children: t("common.openHistory")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "btn-prime min-h-11 justify-center",
							children: t("common.toSignals")
						})]
					})
				]
			}) : null,
			phase === "copy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisModal, {
				pair: search.name,
				expiry: expiryLabel(search.seconds),
				countdown: copyRemaining,
				copied,
				onCopy: () => void copyCurrentPair()
			}) : null,
			phase === "preparing-recovery" || phase === "hunt" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisModal, {
				pair: search.name,
				expiry: expiryLabel(search.seconds)
			}) : null
		]
	});
}
//#endregion
export { SignalRoute as component };
