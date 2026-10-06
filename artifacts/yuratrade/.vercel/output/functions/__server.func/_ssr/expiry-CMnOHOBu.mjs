//#region node_modules/.nitro/vite/services/ssr/assets/expiry-CMnOHOBu.js
var ANALYSIS_PERIODS_SECONDS = [
	60,
	180,
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
function alternativeExpiryMinutes(currentMinutes) {
	const currentPeriod = analysisPeriodForExpiry(currentMinutes * 60);
	const otherOptions = [...EXPIRY_OPTIONS_MINUTES].filter((minutes) => minutes !== currentMinutes).sort((a, b) => Math.abs(a - currentMinutes) - Math.abs(b - currentMinutes) || a - b);
	const samePeriod = otherOptions.find((minutes) => analysisPeriodForExpiry(minutes * 60) === currentPeriod);
	const differentPeriod = otherOptions.find((minutes) => analysisPeriodForExpiry(minutes * 60) !== currentPeriod);
	const alternatives = [];
	if (samePeriod !== void 0) alternatives.push(samePeriod);
	if (differentPeriod !== void 0 && differentPeriod !== samePeriod) alternatives.push(differentPeriod);
	return alternatives;
}
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
export { formatExpiry as a, analysisPeriodForExpiry as i, EXPIRY_OPTIONS_MINUTES as n, isValidExpirySeconds as o, alternativeExpiryMinutes as r, ANALYSIS_PERIODS_SECONDS as t };
