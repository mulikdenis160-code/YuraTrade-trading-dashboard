import { t as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pocket-gate.middleware-yFUUqodX.js
var MIN_ENTRY_BUFFER_MS = 15e3;
var SIGNAL_COPY_DELAY_MS = 1e4;
var SIGNAL_ANALYSIS_TIMEOUT_MS = 19e3;
var SIGNAL_PREPARATION_TIMEOUT_MS = 2e4;
var SIGNAL_HISTORY_PAGE_TIMEOUT_MS = 5e3;
var SIGNAL_QUOTE_WAIT_MS = 2e3;
var ANALYSIS_PERIODS_SECONDS = [
	60,
	300,
	900
];
var EXPIRY_OPTIONS_SECONDS = [30, ...[
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
].map((minutes) => minutes * 60)];
function isValidExpirySeconds(value) {
	return Number.isInteger(value) && (value === 30 || value >= 60) && value <= 14400 && (value === 30 || value % 60 === 0);
}
function analysisPeriodForExpiry(expirySeconds) {
	if (expirySeconds <= 180) return 60;
	if (expirySeconds <= 1800) return 300;
	return 900;
}
function formatExpiry(seconds) {
	if (seconds === 30) return "30 сек";
	const minutes = Math.max(1, Math.round(seconds / 60));
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (hours === 0) return `${minutes} мин`;
	return remainingMinutes === 0 ? `${hours} ч` : `${hours} ч ${remainingMinutes} мин`;
}
function getTelegramInitData() {
	if (typeof window === "undefined") return "";
	const initData = window.Telegram?.WebApp?.initData;
	return typeof initData === "string" ? initData : "";
}
function initializeTelegramWebApp() {
	if (typeof window === "undefined") return false;
	const webApp = window.Telegram?.WebApp;
	if (!webApp || typeof webApp.initData !== "string" || webApp.initData.length === 0) return false;
	webApp.ready?.();
	webApp.expand?.();
	return true;
}
var pocketGateMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	return next({ sendContext: { pocketGateInitData: getTelegramInitData() } });
}).server(async ({ next, context }) => {
	const { requireVerifiedPocketAccess } = await import("./pocket-gate.server-eoJOoUVz.mjs");
	return next({ context: { pocketGateIdentity: await requireVerifiedPocketAccess(context.pocketGateInitData) } });
});
//#endregion
export { SIGNAL_COPY_DELAY_MS as a, SIGNAL_QUOTE_WAIT_MS as c, getTelegramInitData as d, initializeTelegramWebApp as f, SIGNAL_ANALYSIS_TIMEOUT_MS as i, analysisPeriodForExpiry as l, pocketGateMiddleware as m, EXPIRY_OPTIONS_SECONDS as n, SIGNAL_HISTORY_PAGE_TIMEOUT_MS as o, isValidExpirySeconds as p, MIN_ENTRY_BUFFER_MS as r, SIGNAL_PREPARATION_TIMEOUT_MS as s, ANALYSIS_PERIODS_SECONDS as t, formatExpiry as u };
