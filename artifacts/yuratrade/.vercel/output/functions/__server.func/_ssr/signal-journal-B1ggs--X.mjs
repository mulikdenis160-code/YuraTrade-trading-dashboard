import { n as analysisPeriodForExpiry, t as ANALYSIS_PERIODS_SECONDS } from "./expiry-B3tUilyb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signal-journal-B1ggs--X.js
var STORAGE_KEY = "vprime_signal_journal_v1";
var JOURNAL_EVENT = "vprime:signal-journal-updated";
var MAX_ENTRIES = 500;
var groups = /* @__PURE__ */ new Set([
	"fx",
	"crypto",
	"stock",
	"commodity"
]);
var outcomes = /* @__PURE__ */ new Set([
	"pending",
	"win",
	"loss",
	"draw"
]);
function signalRecordId(signal) {
	return `${signal.startedAt}:${signal.step}:${signal.symbol}`;
}
function storage() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function normalizeEntry(value) {
	if (!value || typeof value !== "object") return null;
	const entry = value;
	if (typeof entry.id !== "string" || typeof entry.symbol !== "string" || typeof entry.name !== "string" || !groups.has(entry.group) || entry.direction !== "call" && entry.direction !== "put" || !outcomes.has(entry.outcome) || !Number.isFinite(entry.openPrice) || !Number.isFinite(entry.payout) || !Number.isFinite(entry.seconds) || !Number.isFinite(entry.startedAt) || !Number.isFinite(entry.step)) return null;
	const bars = Array.isArray(entry.bars) ? entry.bars.filter((bar) => Array.isArray(bar) && bar.length === 4 && bar.every((price) => Number.isFinite(price))).slice(-32) : [];
	const seconds = Math.max(60, Math.min(14400, Math.round(Number(entry.seconds) / 60) * 60));
	const legacyAnalysisSeconds = [
		60,
		120,
		180,
		300,
		900
	].includes(seconds) ? seconds : analysisPeriodForExpiry(seconds);
	const providedAnalysisSeconds = Number(entry.analysisSeconds);
	const analysisSeconds = ANALYSIS_PERIODS_SECONDS.includes(providedAnalysisSeconds) ? providedAnalysisSeconds : legacyAnalysisSeconds;
	return {
		id: entry.id,
		symbol: entry.symbol,
		name: entry.name,
		group: entry.group,
		direction: entry.direction,
		openPrice: Number(entry.openPrice),
		...Number.isFinite(entry.closePrice) ? { closePrice: Number(entry.closePrice) } : {},
		payout: Math.max(0, Math.min(100, Number(entry.payout))),
		seconds,
		analysisSeconds,
		step: Math.max(0, Math.min(3, Number(entry.step))),
		startedAt: Number(entry.startedAt),
		...Number.isFinite(entry.settledAt) ? { settledAt: Number(entry.settledAt) } : {},
		outcome: entry.outcome,
		ruleScore: Number.isFinite(entry.ruleScore) ? Number(entry.ruleScore) : 0,
		strategyVersion: typeof entry.strategyVersion === "string" ? entry.strategyVersion : "unknown",
		note: typeof entry.note === "string" ? entry.note.slice(0, 4e3) : "",
		bars
	};
}
function readSignalJournal() {
	const local = storage();
	if (!local) return [];
	try {
		const raw = local.getItem(STORAGE_KEY);
		if (!raw) return [];
		const decoded = JSON.parse(raw);
		if (!Array.isArray(decoded)) return [];
		return decoded.map(normalizeEntry).filter((entry) => entry !== null).sort((a, b) => b.startedAt - a.startedAt).slice(0, MAX_ENTRIES);
	} catch {
		return [];
	}
}
function writeSignalJournal(entries) {
	const local = storage();
	if (!local) return false;
	try {
		local.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
		if (typeof window !== "undefined") window.dispatchEvent(new Event(JOURNAL_EVENT));
		return true;
	} catch {
		return false;
	}
}
function recordSignalStarted(signal) {
	const entry = normalizeEntry({
		...signal,
		outcome: "pending"
	});
	if (!entry) return false;
	const entries = readSignalJournal();
	if (entries.some((saved) => saved.id === entry.id)) return true;
	return writeSignalJournal([entry, ...entries].sort((a, b) => b.startedAt - a.startedAt));
}
function recordSignalOutcome(id, closePrice, outcome) {
	if (!Number.isFinite(closePrice)) return false;
	const entries = readSignalJournal();
	const index = entries.findIndex((entry) => entry.id === id);
	if (index < 0 || entries[index].outcome !== "pending") return false;
	const next = [...entries];
	next[index] = {
		...next[index],
		closePrice,
		outcome,
		settledAt: Date.now()
	};
	return writeSignalJournal(next);
}
function summarizeSignals(entries) {
	let wins = 0;
	let losses = 0;
	let draws = 0;
	let pending = 0;
	let netUnits = 0;
	let breakEvenTotal = 0;
	let decided = 0;
	for (const entry of entries) {
		if (entry.outcome === "pending") {
			pending += 1;
			continue;
		}
		if (entry.outcome === "draw") {
			draws += 1;
			continue;
		}
		decided += 1;
		breakEvenTotal += 100 / (100 + entry.payout);
		if (entry.outcome === "win") {
			wins += 1;
			netUnits += entry.payout / 100;
		} else {
			losses += 1;
			netUnits -= 1;
		}
	}
	const settled = wins + losses + draws;
	return {
		total: entries.length,
		settled,
		pending,
		wins,
		losses,
		draws,
		decided,
		hitRate: decided > 0 ? wins / decided * 100 : null,
		breakEvenRate: decided > 0 ? breakEvenTotal / decided * 100 : null,
		netUnits
	};
}
function summarizeByMarket(entries) {
	const buckets = /* @__PURE__ */ new Map();
	for (const entry of entries) {
		const key = `${entry.symbol}\u0000${entry.seconds}`;
		buckets.set(key, [...buckets.get(key) ?? [], entry]);
	}
	return [...buckets.values()].map((group) => ({
		symbol: group[0].symbol,
		name: group[0].name,
		seconds: group[0].seconds,
		summary: summarizeSignals(group)
	})).sort((a, b) => b.summary.decided - a.summary.decided || a.name.localeCompare(b.name) || a.seconds - b.seconds);
}
function subscribeToSignalJournal(listener) {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(JOURNAL_EVENT, listener);
	window.addEventListener("storage", listener);
	return () => {
		window.removeEventListener(JOURNAL_EVENT, listener);
		window.removeEventListener("storage", listener);
	};
}
function signalJournalCsv(entries) {
	const columns = [
		["startedAt", (entry) => new Date(entry.startedAt).toISOString()],
		["symbol", (entry) => entry.symbol],
		["name", (entry) => entry.name],
		["direction", (entry) => entry.direction],
		["seconds", (entry) => entry.seconds],
		["analysisSeconds", (entry) => entry.analysisSeconds],
		["payout", (entry) => entry.payout],
		["openPrice", (entry) => entry.openPrice],
		["closePrice", (entry) => entry.closePrice ?? ""],
		["outcome", (entry) => entry.outcome],
		["step", (entry) => entry.step],
		["ruleScore", (entry) => entry.ruleScore],
		["strategyVersion", (entry) => entry.strategyVersion],
		["candles", (entry) => JSON.stringify(entry.bars)]
	];
	const quote = (value) => `"${String(value).replaceAll("\"", "\"\"")}"`;
	return [columns.map(([name]) => quote(name)).join(","), ...entries.map((entry) => columns.map(([, read]) => quote(read(entry))).join(","))].join("\r\n");
}
//#endregion
export { signalRecordId as a, summarizeSignals as c, signalJournalCsv as i, recordSignalOutcome as n, subscribeToSignalJournal as o, recordSignalStarted as r, summarizeByMarket as s, readSignalJournal as t };
