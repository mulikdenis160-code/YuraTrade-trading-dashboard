//#region node_modules/.nitro/vite/services/ssr/assets/expiry-JyfywvSv.js
var ANALYSIS_PERIODS_SECONDS = [60];
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
function analysisPeriodForExpiry(_expirySeconds) {
	return 60;
}
function formatExpiry(seconds) {
	const minutes = Math.max(1, Math.round(seconds / 60));
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (hours === 0) return `${minutes} мин`;
	return remainingMinutes === 0 ? `${hours} ч` : `${hours} ч ${remainingMinutes} мин`;
}
//#endregion
export { isValidExpirySeconds as a, formatExpiry as i, EXPIRY_OPTIONS_MINUTES as n, analysisPeriodForExpiry as r, ANALYSIS_PERIODS_SECONDS as t };
