import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, g as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { k as useLanguage, p as subscribeToSignalJournal, s as readSignalJournalTotals } from "./router-ESQ7Iyd6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stats-w6qzhDFC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DAILY_SIGNAL_STATS_STORAGE_KEY = "vprime_daily_signal_stats_v1";
function localSignalStatsDayKey(date) {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0")
	].join("-");
}
function millisecondsUntilNextLocalDay(date) {
	const nextDay = new Date(date);
	nextDay.setHours(24, 0, 0, 0);
	return Math.max(1, nextDay.getTime() - date.getTime());
}
function normalizeDailySignalStatsSnapshot(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (typeof candidate.dayKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.dayKey) || typeof candidate.stats !== "object" || candidate.stats === null) return null;
	const stats = candidate.stats;
	const count = (input) => Number.isSafeInteger(input) && Number(input) >= 0 ? Number(input) : null;
	const wins = count(stats.wins);
	const losses = count(stats.losses);
	const draws = count(stats.draws);
	if (wins === null || losses === null || draws === null) return null;
	const decided = wins + losses;
	return {
		dayKey: candidate.dayKey,
		stats: {
			settled: wins + losses + draws,
			wins,
			losses,
			draws,
			hitRate: decided > 0 ? wins / decided * 100 : null
		}
	};
}
function resolveDailySignalStatsSnapshot(saved, today, current) {
	if (saved?.dayKey === today && saved.stats.settled === current.settled && saved.stats.wins === current.wins && saved.stats.losses === current.losses && saved.stats.draws === current.draws && saved.stats.hitRate === current.hitRate) return saved;
	return {
		dayKey: today,
		stats: current
	};
}
var emptyStats = {
	settled: 0,
	wins: 0,
	losses: 0,
	draws: 0,
	hitRate: null
};
function readSavedSnapshot() {
	try {
		const raw = window.localStorage.getItem(DAILY_SIGNAL_STATS_STORAGE_KEY);
		return raw ? normalizeDailySignalStatsSnapshot(JSON.parse(raw)) : null;
	} catch {
		return null;
	}
}
function saveSnapshot(snapshot) {
	try {
		window.localStorage.setItem(DAILY_SIGNAL_STATS_STORAGE_KEY, JSON.stringify(snapshot));
	} catch {}
}
function StatRow() {
	const { language, t } = useLanguage();
	const [snapshot, setSnapshot] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let timer = 0;
		let disposed = false;
		const update = () => {
			if (disposed) return;
			const now = /* @__PURE__ */ new Date();
			const today = localSignalStatsDayKey(now);
			const saved = readSavedSnapshot();
			const next = resolveDailySignalStatsSnapshot(saved, today, readSignalJournalTotals());
			if (JSON.stringify(saved) !== JSON.stringify(next)) saveSnapshot(next);
			setSnapshot(next);
			window.clearTimeout(timer);
			timer = window.setTimeout(update, millisecondsUntilNextLocalDay(now) + 100);
		};
		const onVisibility = () => {
			if (document.visibilityState === "visible") update();
		};
		update();
		const unsubscribeJournal = subscribeToSignalJournal(update);
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			disposed = true;
			window.clearTimeout(timer);
			unsubscribeJournal();
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, []);
	const stats = snapshot?.stats ?? emptyStats;
	const formattedDay = snapshot ? (() => {
		const [year, month, day] = snapshot.dayKey.split("-").map(Number);
		return new Intl.DateTimeFormat(language, {
			year: "numeric",
			month: "short",
			day: "numeric"
		}).format(new Date(year, month - 1, day, 12));
	})() : "—";
	const items = [
		{
			label: t("stats.settled"),
			value: String(stats.settled),
			tone: "text-fg"
		},
		{
			label: t("stats.wins"),
			value: String(stats.wins),
			tone: "text-win"
		},
		{
			label: t("stats.losses"),
			value: String(stats.losses),
			tone: "text-loss"
		},
		{
			label: t("stats.draws"),
			value: String(stats.draws),
			tone: "text-muted"
		},
		{
			label: t("stats.rate"),
			value: stats.hitRate === null ? "—" : `${stats.hitRate.toFixed(1)}%`,
			tone: "text-blue-soft"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": t("stats.title"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-5",
				children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel arrive min-w-0 px-3 py-3 text-center",
					style: { animationDelay: `${index * 70}ms` },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `font-mono text-2xl font-extrabold ${item.tone}`,
						children: item.value
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs font-semibold tracking-wide text-dim uppercase",
						children: item.label
					})]
				}, item.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-center text-xs leading-relaxed text-dim",
				children: [
					t("stats.source"),
					" · ",
					t("stats.asOf", { date: formattedDay })
				]
			}),
			snapshot && snapshot.stats.settled === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-center text-xs text-muted",
				children: t("stats.empty")
			}) : null
		]
	});
}
//#endregion
export { StatRow as t };
