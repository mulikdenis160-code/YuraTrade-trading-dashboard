import { n as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-DlvCGy7w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pocket-gate-CZELm9U-.js
var readInitData = (input) => typeof input?.initData === "string" && input.initData.length <= 1e4 ? input.initData : "";
var getPocketGateState_createServerFn_handler = createServerRpc({
	id: "b900180c993554286d82dd224bf57a5fc610cd2c0e205fb2e89f79e8fa4a3641",
	name: "getPocketGateState",
	filename: "src/lib/pocket-gate.ts"
}, (opts) => getPocketGateState.__executeServer(opts));
var getPocketGateState = createServerFn({ method: "POST" }).validator((input) => ({ initData: readInitData(input) })).handler(getPocketGateState_createServerFn_handler, async ({ data }) => {
	const { getPocketGateStateForTelegram } = await import("./pocket-gate.server-CSH3Pyex.mjs");
	return getPocketGateStateForTelegram(data.initData);
});
var verifyPocketAccount_createServerFn_handler = createServerRpc({
	id: "aac57122ce5b3a8923821121771eb8cb948eb3f0ce20a93ea73c801a87060f96",
	name: "verifyPocketAccount",
	filename: "src/lib/pocket-gate.ts"
}, (opts) => verifyPocketAccount.__executeServer(opts));
var verifyPocketAccount = createServerFn({ method: "POST" }).validator((input) => ({
	pocketId: typeof input?.pocketId === "string" ? input.pocketId.trim() : "",
	initData: readInitData(input)
})).handler(verifyPocketAccount_createServerFn_handler, async ({ data }) => {
	const { verifyPocketAccountForTelegram } = await import("./pocket-gate.server-CSH3Pyex.mjs");
	return verifyPocketAccountForTelegram(data.pocketId, data.initData);
});
//#endregion
export { getPocketGateState_createServerFn_handler, verifyPocketAccount_createServerFn_handler };
