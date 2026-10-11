import { n as createServerFn } from "./ssr.mjs";
import { m as pocketGateMiddleware, p as isValidExpirySeconds } from "./pocket-gate.middleware-DqGlDVU6.mjs";
import { t as createServerRpc } from "./createServerRpc-DlvCGy7w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pocket-live-CpWyeBxo.js
var loadFeed_createServerFn_handler = createServerRpc({
	id: "fb07d0a82ccd0e21eb307fec3024649c271630507c2eb15012c43274deadb043",
	name: "loadFeed",
	filename: "src/lib/pocket-live.ts"
}, (opts) => loadFeed.__executeServer(opts));
var loadFeed = createServerFn({ method: "GET" }).middleware([pocketGateMiddleware]).handler(loadFeed_createServerFn_handler, async () => {
	const { feedSnapshot } = await import("./pocket-live.server-BxlBrvaS.mjs");
	return feedSnapshot();
});
var readClose_createServerFn_handler = createServerRpc({
	id: "c3bf91de64f793a1fdff73992de93db6878fb230b41776a1663843f0dd5e02d1",
	name: "readClose",
	filename: "src/lib/pocket-live.ts"
}, (opts) => readClose.__executeServer(opts));
var readClose = createServerFn({ method: "POST" }).middleware([pocketGateMiddleware]).validator((input) => {
	const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) throw new Error("Пара недоступна.");
	return { symbol };
}).handler(readClose_createServerFn_handler, async ({ data }) => {
	const { feedClose } = await import("./pocket-live.server-BxlBrvaS.mjs");
	return { close: await feedClose(data.symbol) };
});
var takeSignal_createServerFn_handler = createServerRpc({
	id: "e7eabc0cd6ed805a34adcafedfe18f606c2fbbb009e971fe08cadbcf71358857",
	name: "takeSignal",
	filename: "src/lib/pocket-live.ts"
}, (opts) => takeSignal.__executeServer(opts));
var takeSignal = createServerFn({ method: "POST" }).middleware([pocketGateMiddleware]).validator((input) => {
	const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
	const expirySeconds = Number(input?.expirySeconds);
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol) || !isValidExpirySeconds(expirySeconds)) throw new Error("Выберите пару и срок экспирации от 30 секунд до 4 часов.");
	return {
		symbol,
		expirySeconds
	};
}).handler(takeSignal_createServerFn_handler, async ({ data }) => {
	const { feedSignal } = await import("./pocket-live.server-BxlBrvaS.mjs");
	return feedSignal(data.symbol, data.expirySeconds);
});
var confirmSignalEntry_createServerFn_handler = createServerRpc({
	id: "8d16ab25d49de3ba563bd027483e243a7e3dc42cde9f9a502b86bdc62ed38062",
	name: "confirmSignalEntry",
	filename: "src/lib/pocket-live.ts"
}, (opts) => confirmSignalEntry.__executeServer(opts));
var confirmSignalEntry = createServerFn({ method: "POST" }).middleware([pocketGateMiddleware]).validator((input) => {
	const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) throw new Error("Пара недоступна.");
	return { symbol };
}).handler(confirmSignalEntry_createServerFn_handler, async ({ data }) => {
	const { feedConfirmSignalEntry } = await import("./pocket-live.server-BxlBrvaS.mjs");
	return feedConfirmSignalEntry(data.symbol);
});
var chooseSignalPair_createServerFn_handler = createServerRpc({
	id: "4cc8a698b27084a764e9f2f4554eb5fdebf61fc3dead4a697775e5341ebfd84e",
	name: "chooseSignalPair",
	filename: "src/lib/pocket-live.ts"
}, (opts) => chooseSignalPair.__executeServer(opts));
var chooseSignalPair = createServerFn({ method: "POST" }).middleware([pocketGateMiddleware]).validator((input) => {
	return { excludedSymbols: Array.isArray(input?.excludedSymbols) ? [...new Set(input.excludedSymbols.filter((symbol) => typeof symbol === "string" && /^[#A-Za-z0-9._-]{2,32}$/.test(symbol.trim())).map((symbol) => symbol.trim()))].slice(0, 24) : [] };
}).handler(chooseSignalPair_createServerFn_handler, async ({ data }) => {
	const { feedNextPair } = await import("./pocket-live.server-BxlBrvaS.mjs");
	return feedNextPair(data.excludedSymbols);
});
var takeBest_createServerFn_handler = createServerRpc({
	id: "65a316e774e0ea4a3bef3cd70e45365d003566e62fb4f915e8f227872abf97ab",
	name: "takeBest",
	filename: "src/lib/pocket-live.ts"
}, (opts) => takeBest.__executeServer(opts));
var takeBest = createServerFn({ method: "POST" }).middleware([pocketGateMiddleware]).validator((input) => {
	const expirySeconds = Number(input?.expirySeconds);
	if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 30 секунд до 4 часов.");
	return {
		expirySeconds,
		excludedSymbols: Array.isArray(input?.excludedSymbols) ? [...new Set(input.excludedSymbols.filter((symbol) => typeof symbol === "string" && /^[#A-Za-z0-9._-]{2,32}$/.test(symbol.trim())).map((symbol) => symbol.trim()))].slice(0, 24) : []
	};
}).handler(takeBest_createServerFn_handler, async ({ data }) => {
	const { feedBest } = await import("./pocket-live.server-BxlBrvaS.mjs");
	return feedBest(data.expirySeconds, data.excludedSymbols);
});
//#endregion
export { chooseSignalPair_createServerFn_handler, confirmSignalEntry_createServerFn_handler, loadFeed_createServerFn_handler, readClose_createServerFn_handler, takeBest_createServerFn_handler, takeSignal_createServerFn_handler };
