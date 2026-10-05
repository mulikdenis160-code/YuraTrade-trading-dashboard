import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, g as require_jsx_runtime, m as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as lookbackForExpiry } from "./expiry-B3tUilyb.mjs";
import { C as useLanguage, S as formatExpiryForLanguage, a as recordSignalOutcome, c as signalRecordId, h as takeSignal, i as readSignalJournal, n as Route$1, o as recordSignalStarted, p as readClose } from "./router-C6jSBPUp.mjs";
import { t as AnalysisModal } from "./analysis-modal-pdo1vHbd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signal-BiFBPZbr.js
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
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function featuresOf(input) {
	const bars = input.bars.slice(-8);
	if (bars.length < 3) return null;
	const ranges = bars.map(([, high, low]) => Math.max(0, high - low));
	const rangeSum = ranges.reduce((sum, value) => sum + value, 0);
	const [firstOpen] = bars[0];
	const [, , , lastClose] = bars[bars.length - 1];
	const directionSign = input.direction === "call" ? 1 : -1;
	const directionalCandles = bars.filter(([open, , , close]) => input.direction === "call" ? close >= open : close <= open).length;
	const averageBodyRatio = bars.map(([open, high, low, close]) => {
		const range = Math.max(high - low, Math.abs(close) * 1e-8, 1e-12);
		return Math.abs(close - open) / range;
	}).reduce((sum, value) => sum + value, 0) / bars.length;
	const averageNormalizedRange = ranges.reduce((sum, value, index) => sum + value / Math.max(Math.abs(bars[index][3]), 1e-12), 0) / bars.length;
	const momentum = rangeSum > 0 ? (lastClose - firstOpen) / rangeSum : 0;
	return [
		clamp(input.ruleScore, 0, 1),
		clamp(input.payout / 100, 0, 1),
		clamp(Math.log(Math.max(1, input.seconds / 60)) / Math.log(240), 0, 1),
		directionSign,
		clamp(input.step / 3, 0, 1),
		clamp(momentum, -2, 2),
		directionalCandles / bars.length,
		averageBodyRatio,
		clamp(averageNormalizedRange * 1e3, 0, 2)
	];
}
function sigmoid(value) {
	const safe = clamp(value, -30, 30);
	return 1 / (1 + Math.exp(-safe));
}
function standardize(features, means, scales) {
	return features.map((value, index) => (value - means[index]) / scales[index]);
}
function fitLogistic(examples) {
	const featureCount = examples[0].features.length;
	const means = Array.from({ length: featureCount }, (_, index) => examples.reduce((sum, example) => sum + example.features[index], 0) / examples.length);
	const scales = Array.from({ length: featureCount }, (_, index) => {
		const variance = examples.reduce((sum, example) => sum + (example.features[index] - means[index]) ** 2, 0) / examples.length;
		return Math.sqrt(variance) || 1;
	});
	const rows = examples.map((example) => standardize(example.features, means, scales));
	const positiveCount = examples.filter((example) => example.label === 1).length;
	const negativeCount = examples.length - positiveCount;
	const weights = Array(featureCount).fill(0);
	let bias = Math.log((positiveCount + 1) / (negativeCount + 1));
	for (let epoch = 0; epoch < 700; epoch += 1) {
		const gradients = Array(featureCount).fill(0);
		let biasGradient = 0;
		for (let row = 0; row < rows.length; row += 1) {
			const error = sigmoid(rows[row].reduce((sum, value, index) => sum + value * weights[index], bias)) - examples[row].label;
			biasGradient += error;
			for (let index = 0; index < featureCount; index += 1) gradients[index] += error * rows[row][index];
		}
		const rate = .08 / examples.length;
		bias -= rate * biasGradient;
		for (let index = 0; index < featureCount; index += 1) weights[index] -= rate * (gradients[index] + .02 * weights[index]);
	}
	return {
		means,
		scales,
		weights,
		bias
	};
}
function logit(model, features) {
	return standardize(features, model.means, model.scales).reduce((sum, value, index) => sum + value * model.weights[index], model.bias);
}
function fitCalibration(logits, labels) {
	let slope = 1;
	let intercept = 0;
	for (let epoch = 0; epoch < 500; epoch += 1) {
		let slopeGradient = 0;
		let interceptGradient = 0;
		for (let index = 0; index < logits.length; index += 1) {
			const error = sigmoid(slope * logits[index] + intercept) - labels[index];
			slopeGradient += error * logits[index];
			interceptGradient += error;
		}
		const rate = .03 / logits.length;
		slope -= rate * (slopeGradient + .02 * (slope - 1));
		intercept -= rate * interceptGradient;
	}
	return {
		slope,
		intercept
	};
}
function assessSignalModel(entries, candidate) {
	const chronological = entries.filter((entry) => entry.group === "fx" && (entry.outcome === "win" || entry.outcome === "loss") && featuresOf(entry) !== null).sort((a, b) => a.startedAt - b.startedAt).map((entry) => ({
		features: featuresOf(entry),
		label: entry.outcome === "win" ? 1 : 0
	}));
	const sampleCount = chronological.length;
	const trainCount = Math.floor(sampleCount * .7);
	const calibrationEnd = Math.floor(sampleCount * .85);
	const training = chronological.slice(0, trainCount);
	const calibrationSet = chronological.slice(trainCount, calibrationEnd);
	const validation = chronological.slice(calibrationEnd);
	const collecting = () => ({
		status: "collecting",
		reason: "sample-count",
		sampleCount,
		minimumSamples: 120,
		validationCount: validation.length
	});
	if (sampleCount < 120) return collecting();
	const trainingWins = training.filter((example) => example.label === 1).length;
	const calibrationWins = calibrationSet.filter((example) => example.label === 1).length;
	const validationWins = validation.filter((example) => example.label === 1).length;
	if (trainingWins < 25 || training.length - trainingWins < 25 || calibrationWins < 5 || calibrationSet.length - calibrationWins < 5 || validationWins < 5 || validation.length - validationWins < 5) return {
		...collecting(),
		reason: "class-balance"
	};
	const model = fitLogistic(training);
	const calibration = fitCalibration(calibrationSet.map((example) => logit(model, example.features)), calibrationSet.map((example) => example.label));
	const probabilities = validation.map((example) => logit(model, example.features)).map((value) => sigmoid(calibration.slope * value + calibration.intercept));
	const baseRate = calibrationWins / calibrationSet.length;
	const brierScore = probabilities.reduce((sum, value, index) => sum + (value - validation[index].label) ** 2, 0) / validation.length;
	const baselineBrier = validation.reduce((sum, example) => sum + (baseRate - example.label) ** 2, 0) / validation.length;
	if (brierScore >= baselineBrier) return {
		status: "unreliable",
		reason: "no-baseline-edge",
		sampleCount,
		minimumSamples: 120,
		validationCount: validation.length,
		brierScore,
		baselineBrier
	};
	const candidateFeatures = featuresOf(candidate);
	if (!candidateFeatures) return {
		status: "unreliable",
		reason: "no-baseline-edge",
		sampleCount,
		minimumSamples: 120,
		validationCount: validation.length,
		brierScore,
		baselineBrier
	};
	const probability = sigmoid(calibration.slope * logit(model, candidateFeatures) + calibration.intercept);
	const expectedValue = probability * (candidate.payout / 100) - (1 - probability);
	return {
		status: "ready",
		sampleCount,
		minimumSamples: 120,
		validationCount: validation.length,
		probability,
		expectedValue,
		brierScore,
		baselineBrier
	};
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
function copyName(text) {
	const pairName = text.replace(/\s+OTC$/i, "").trim();
	const area = document.createElement("textarea");
	area.value = pairName;
	area.setAttribute("readonly", "");
	area.style.position = "fixed";
	area.style.top = "0";
	area.style.left = "0";
	area.style.opacity = "0";
	document.body.appendChild(area);
	area.focus();
	area.select();
	area.setSelectionRange(0, pairName.length);
	let copied = false;
	try {
		copied = document.execCommand("copy");
	} catch {
		copied = false;
	}
	area.remove();
	if (copied) return Promise.resolve();
	if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(pairName);
	return Promise.reject(/* @__PURE__ */ new Error("copy"));
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
	const search = Route$1.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalCard, { search }, `${search.started}-${search.step}`);
}
function SignalCard({ search }) {
	const { language, t } = useLanguage();
	const navigate = useNavigate();
	const expiryLabel = (seconds) => formatExpiryForLanguage(seconds, language);
	const lookbackBars = lookbackForExpiry(search.seconds, search.analysisSeconds);
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const [phase, setPhase] = (0, import_react.useState)("run");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [close, setClose] = (0, import_react.useState)(null);
	const [prepLeft, setPrepLeft] = (0, import_react.useState)(10);
	const [error, setError] = (0, import_react.useState)("");
	const [journalWarning, setJournalWarning] = (0, import_react.useState)("");
	const [aiAssessment, setAiAssessment] = (0, import_react.useState)(null);
	const [live, setLive] = (0, import_react.useState)(null);
	const [liveStatus, setLiveStatus] = (0, import_react.useState)("connecting");
	const [liveMessage, setLiveMessage] = (0, import_react.useState)("");
	const settled = (0, import_react.useRef)(false);
	const journalId = signalRecordId({
		symbol: search.symbol,
		startedAt: search.started,
		step: search.step
	});
	const until = search.started + search.seconds * 1e3;
	const left = Math.max(0, until - now);
	const up = search.direction === "call";
	(0, import_react.useEffect)(() => {
		if (!search.symbol || !search.open) return;
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
			ruleScore: search.ruleScore,
			strategyVersion: "expiry-adaptive-filter-v1",
			note: search.note,
			bars: search.bars
		});
		setJournalWarning(saved ? "" : "Не удалось сохранить сигнал в локальный журнал браузера.");
	}, [
		journalId,
		search.analysisSeconds,
		search.bars,
		search.direction,
		search.group,
		search.name,
		search.note,
		search.open,
		search.payout,
		search.ruleScore,
		search.seconds,
		search.started,
		search.step,
		search.symbol
	]);
	(0, import_react.useEffect)(() => {
		setAiAssessment(assessSignalModel(readSignalJournal(), {
			direction: search.direction,
			payout: search.payout,
			seconds: search.seconds,
			step: search.step,
			ruleScore: search.ruleScore,
			bars: search.bars
		}));
	}, [
		search.bars,
		search.direction,
		search.payout,
		search.ruleScore,
		search.seconds,
		search.step
	]);
	(0, import_react.useEffect)(() => {
		if (phase !== "run") return;
		const timer = window.setInterval(() => setNow(Date.now()), 200);
		return () => window.clearInterval(timer);
	}, [phase]);
	(0, import_react.useEffect)(() => {
		if (phase !== "run" || !search.symbol) return;
		const source = new EventSource(`/api/ticks?symbol=${encodeURIComponent(search.symbol)}`);
		source.onopen = () => setLiveStatus("connecting");
		source.addEventListener("feed-status", (event) => {
			try {
				const status = JSON.parse(event.data);
				if (status.status === "connected" || status.status === "connecting" || status.status === "error") {
					setLiveStatus(status.status);
					setLiveMessage(status.message ?? "");
				}
			} catch {
				setLiveStatus("error");
				setLiveMessage("Не удалось прочитать состояние потока котировок.");
			}
		});
		source.onmessage = (event) => {
			const next = Number(event.data);
			if (Number.isFinite(next)) {
				setLive(next);
				setLiveStatus("connected");
				setLiveMessage("");
			}
		};
		source.onerror = () => {
			setLiveStatus("error");
			setLiveMessage("Соединение с потоком котировок прервано. Переподключаемся…");
		};
		return () => source.close();
	}, [phase, search.symbol]);
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
			const won = up ? move > 0 : move < 0;
			if (!recordSignalOutcome(journalId, quote.close, move === 0 ? "draw" : won ? "win" : "loss")) setJournalWarning("Результат не удалось сохранить в локальный журнал.");
			if (move === 0) {
				setPhase("draw");
				return;
			}
			setPhase(won ? "win" : search.step >= 3 ? "stop" : "prep");
		}).catch((cause) => {
			setPhase("run");
			settled.current = false;
			setError(cause instanceof Error ? cause.message : "Не удалось сверить цену.");
		});
	}, [
		left,
		phase,
		search.open,
		search.step,
		search.symbol,
		up
	]);
	(0, import_react.useEffect)(() => {
		if (phase !== "prep") return;
		const ends = Date.now() + 1e4;
		const timer = window.setInterval(() => {
			const left = Math.max(0, Math.ceil((ends - Date.now()) / 1e3));
			setPrepLeft(left);
			if (left <= 0) {
				window.clearInterval(timer);
				setPhase("hunt");
			}
		}, 200);
		return () => window.clearInterval(timer);
	}, [phase]);
	(0, import_react.useEffect)(() => {
		if (phase !== "hunt") return;
		let stop = false;
		const started = Date.now();
		takeSignal({ data: {
			symbol: search.symbol,
			expirySeconds: search.seconds
		} }).then(async (result) => {
			if (!result) {
				if (stop) return;
				setPhase("no-signal");
				setError("");
				return;
			}
			const wait = Math.max(0, 2200 - (Date.now() - started));
			await new Promise((resolve) => window.setTimeout(resolve, wait));
			if (stop) return;
			await navigate({
				to: "/signal",
				replace: true,
				search: {
					symbol: search.symbol,
					name: result.name,
					group: search.group,
					direction: result.direction,
					open: result.openPrice,
					payout: result.payout,
					seconds: search.seconds,
					analysisSeconds: result.analysisSeconds,
					note: result.note,
					bars: result.bars,
					ruleScore: result.ruleScore,
					step: search.step + 1,
					started: Date.now()
				}
			});
		}).catch((cause) => {
			if (stop) return;
			setPhase("prep");
			setError(cause instanceof Error ? cause.message : "Не удалось дать перекрытие.");
		});
		return () => {
			stop = true;
		};
	}, [
		navigate,
		phase,
		search.group,
		search.seconds,
		search.step,
		search.symbol
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
			className: "panel arrive mt-3 px-4 py-8 text-center sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-[0.16em] text-blue-soft uppercase",
					children: t("common.skipEntry")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 text-xl font-bold text-fg",
					children: t("common.notConfirmed")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted",
					children: t("common.skipReason")
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
				}),
				journalWarning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs leading-relaxed text-loss",
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
										onClick: () => {
											copyName(search.name).then(() => {
												setCopied(true);
												window.setTimeout(() => setCopied(false), 1400);
											}).catch(() => setCopied(false));
										},
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
							expiryLabel(search.analysisSeconds),
							" · ",
							lookbackBars,
							" свечей"
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
					aiAssessment ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-2xl border border-blue/20 bg-blue/5 p-4",
						"aria-live": "polite",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold tracking-[0.14em] text-blue-soft uppercase",
									children: t("ai.title")
								}), aiAssessment.status === "ready" && aiAssessment.probability !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-lg font-bold text-fg",
									children: [Math.round(aiAssessment.probability * 100), "%"]
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-relaxed text-muted",
								children: t("ai.explanation")
							}),
							aiAssessment.status === "ready" && aiAssessment.probability !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-relaxed text-muted",
								children: t("ai.validated", {
									samples: aiAssessment.sampleCount,
									brier: aiAssessment.brierScore?.toFixed(3) ?? "—"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-relaxed text-muted",
								children: t("ai.expectedValue", { value: `${(aiAssessment.expectedValue ?? 0) >= 0 ? "+" : ""}${(aiAssessment.expectedValue ?? 0).toFixed(3)}` })
							})] }) : aiAssessment.status === "unreliable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-relaxed text-muted",
								children: t("ai.unreliable")
							}) : aiAssessment.reason === "class-balance" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-relaxed text-muted",
								children: t("ai.classBalance", { samples: aiAssessment.sampleCount })
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-relaxed text-muted",
								children: t("ai.collecting", {
									samples: aiAssessment.sampleCount,
									minimum: aiAssessment.minimumSamples
								})
							})
						]
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
			phase === "prep" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel arrive mt-4 px-6 py-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tracking-[0.16em] text-loss uppercase",
						children: t("common.loss")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-lg font-bold text-fg",
						children: t("common.prepareRecovery")
					}),
					close !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-sm text-loss",
						children: [
							search.open.toFixed(digitsOf(search.open)),
							" → ",
							close.toFixed(digitsOf(close))
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-5xl font-bold text-fg",
						children: prepLeft
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-dim",
						children: t("common.samePairAttempts", { count: 3 - search.step })
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
					})
				]
			}) : null,
			phase === "hunt" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisModal, {
				pair: search.name,
				expiry: expiryLabel(search.seconds)
			}) : null
		]
	});
}
//#endregion
export { SignalRoute as component };
