import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { i as isValidExpirySeconds } from "./expiry-BxofkO8c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pocket-live-DHQiDU0H.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var loadFeed_createServerFn_handler = createServerRpc({
	id: "fb07d0a82ccd0e21eb307fec3024649c271630507c2eb15012c43274deadb043",
	name: "loadFeed",
	filename: "src/lib/pocket-live.ts"
}, (opts) => loadFeed.__executeServer(opts));
var loadFeed = createServerFn({ method: "GET" }).handler(loadFeed_createServerFn_handler, async () => {
	const { feedSnapshot } = await import("./pocket-live.server-BNCXGBRg.mjs");
	return feedSnapshot();
});
var readClose_createServerFn_handler = createServerRpc({
	id: "c3bf91de64f793a1fdff73992de93db6878fb230b41776a1663843f0dd5e02d1",
	name: "readClose",
	filename: "src/lib/pocket-live.ts"
}, (opts) => readClose.__executeServer(opts));
var readClose = createServerFn({ method: "POST" }).validator((input) => {
	const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) throw new Error("Пара недоступна.");
	return { symbol };
}).handler(readClose_createServerFn_handler, async ({ data }) => {
	const { feedClose } = await import("./pocket-live.server-BNCXGBRg.mjs");
	return { close: await feedClose(data.symbol) };
});
var takeSignal_createServerFn_handler = createServerRpc({
	id: "e7eabc0cd6ed805a34adcafedfe18f606c2fbbb009e971fe08cadbcf71358857",
	name: "takeSignal",
	filename: "src/lib/pocket-live.ts"
}, (opts) => takeSignal.__executeServer(opts));
var takeSignal = createServerFn({ method: "POST" }).validator((input) => {
	const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
	const expirySeconds = Number(input?.expirySeconds);
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol) || !isValidExpirySeconds(expirySeconds)) throw new Error("Выберите пару и срок экспирации от 1 минуты до 4 часов.");
	return {
		symbol,
		expirySeconds
	};
}).handler(takeSignal_createServerFn_handler, async ({ data }) => {
	const { feedSignal } = await import("./pocket-live.server-BNCXGBRg.mjs");
	return feedSignal(data.symbol, data.expirySeconds);
});
var takeBest_createServerFn_handler = createServerRpc({
	id: "65a316e774e0ea4a3bef3cd70e45365d003566e62fb4f915e8f227872abf97ab",
	name: "takeBest",
	filename: "src/lib/pocket-live.ts"
}, (opts) => takeBest.__executeServer(opts));
var takeBest = createServerFn({ method: "POST" }).validator((input) => {
	const expirySeconds = Number(input?.expirySeconds);
	if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
	return { expirySeconds };
}).handler(takeBest_createServerFn_handler, async ({ data }) => {
	const { feedBest } = await import("./pocket-live.server-BNCXGBRg.mjs");
	return feedBest(data.expirySeconds);
});
//#endregion
export { loadFeed_createServerFn_handler, readClose_createServerFn_handler, takeBest_createServerFn_handler, takeSignal_createServerFn_handler };
