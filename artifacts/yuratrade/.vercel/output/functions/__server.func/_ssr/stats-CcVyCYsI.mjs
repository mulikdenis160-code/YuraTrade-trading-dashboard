import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, g as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as summarizeSignals, i as readSignalJournal, u as subscribeToSignalJournal, w as useLanguage } from "./router-Czlfb_jQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stats-CcVyCYsI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StatRow() {
	const { t } = useLanguage();
	const [summary, setSummary] = (0, import_react.useState)(() => summarizeSignals([]));
	(0, import_react.useEffect)(() => {
		const update = () => setSummary(summarizeSignals(readSignalJournal().filter((entry) => entry.group === "fx")));
		update();
		return subscribeToSignalJournal(update);
	}, []);
	const items = [
		{
			label: t("stats.settled"),
			value: String(summary.settled),
			tone: "text-fg"
		},
		{
			label: t("stats.wins"),
			value: String(summary.wins),
			tone: "text-win"
		},
		{
			label: t("stats.losses"),
			value: String(summary.losses),
			tone: "text-loss"
		},
		{
			label: t("stats.rate"),
			value: summary.hitRate === null ? "—" : `${summary.hitRate.toFixed(1)}%`,
			tone: "text-blue-soft"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
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
	});
}
//#endregion
export { StatRow as t };
