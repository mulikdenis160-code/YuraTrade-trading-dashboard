//#region node_modules/.nitro/vite/services/ssr/assets/pocket-admin-DnzTuOI1.js
var ADMIN_IDS = [
	"113510708",
	"92535291",
	"984367891",
	"987651256"
];
function isAdminId(value) {
	return value !== null && ADMIN_IDS.includes(value);
}
function isValidPocketOptionId(value) {
	return value !== null && (/^\d{9}$/.test(value) || isAdminId(value));
}
//#endregion
export { isValidPocketOptionId as n, isAdminId as t };
