//#region node_modules/.nitro/vite/services/ssr/assets/expiry-YYPo0RXo.js
var MIN_ENTRY_BUFFER_MS = 15e3;
var SIGNAL_COPY_DELAY_MS = 1e4;
var SIGNAL_ANALYSIS_TIMEOUT_MS = 18e3;
var SIGNAL_PREPARATION_TIMEOUT_MS = 2e4;
var SIGNAL_HISTORY_PAGE_TIMEOUT_MS = 5e3;
var SIGNAL_QUOTE_WAIT_MS = 2e3;
var ANALYSIS_PERIODS_SECONDS = [
	60,
	300,
	900
];
var EXPIRY_OPTIONS_MINUTES = [
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
function isValidExpirySeconds(value) {
	return Number.isInteger(value) && value >= 60 && value <= 14400 && value % 60 === 0;
}
function analysisPeriodForExpiry(expirySeconds) {
	if (expirySeconds <= 180) return 60;
	if (expirySeconds <= 1800) return 300;
	return 900;
}
function formatExpiry(seconds) {
	const minutes = Math.max(1, Math.round(seconds / 60));
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (hours === 0) return `${minutes} мин`;
	return remainingMinutes === 0 ? `${hours} ч` : `${hours} ч ${remainingMinutes} мин`;
}
//#endregion
export { SIGNAL_COPY_DELAY_MS as a, SIGNAL_QUOTE_WAIT_MS as c, isValidExpirySeconds as d, SIGNAL_ANALYSIS_TIMEOUT_MS as i, analysisPeriodForExpiry as l, EXPIRY_OPTIONS_MINUTES as n, SIGNAL_HISTORY_PAGE_TIMEOUT_MS as o, MIN_ENTRY_BUFFER_MS as r, SIGNAL_PREPARATION_TIMEOUT_MS as s, ANALYSIS_PERIODS_SECONDS as t, formatExpiry as u };
