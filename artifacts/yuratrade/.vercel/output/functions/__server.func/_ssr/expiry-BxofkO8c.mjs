//#region node_modules/.nitro/vite/services/ssr/assets/expiry-BxofkO8c.js
var ANALYSIS_PERIODS_SECONDS = [
	60,
	180,
	300,
	900
];
function isValidExpirySeconds(value) {
	return Number.isInteger(value) && value >= 60 && value <= 14400 && value % 60 === 0;
}
function analysisPeriodForExpiry(expirySeconds) {
	const expiryMinutes = Math.ceil(expirySeconds / 60);
	if (expiryMinutes <= 5) return 60;
	if (expiryMinutes <= 15) return 180;
	if (expiryMinutes <= 60) return 300;
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
export { isValidExpirySeconds as i, analysisPeriodForExpiry as n, formatExpiry as r, ANALYSIS_PERIODS_SECONDS as t };
