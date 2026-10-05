import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, g as require_jsx_runtime, n as require_react_dom } from "../_libs/@tanstack/react-router+[...].mjs";
import { w as useLanguage } from "./router-Dhe2BtWJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analysis-modal-Q5Es4Ty-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = require_react_dom();
var lines = [
	"modal.step1",
	"modal.step2",
	"modal.step3"
];
function AnalysisModal({ pair, expiry }) {
	const { t } = useLanguage();
	const [line, setLine] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => setLine((current) => (current + 1) % lines.length), 900);
		return () => window.clearInterval(timer);
	}, []);
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center p-4",
		style: { background: "#080b12" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-3xl border border-[#2c3a50] px-6 py-8 text-center",
			style: {
				background: "#121826",
				boxShadow: "0 24px 64px #000"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-semibold tracking-[0.14em] text-dim uppercase",
					children: [
						pair,
						" · ",
						expiry
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative mx-auto mt-6 grid size-36 place-items-center rounded-full border-2 border-[#2c3a50]",
					style: { background: "#1c2636" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-16 items-end gap-1.5",
						children: [
							0,
							1,
							2,
							3,
							4
						].map((index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "candle-bar",
							style: { animationDelay: `${index * .12}s` }
						}, index))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-6 text-2xl font-bold text-fg",
					children: t("modal.title")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 min-h-10 text-sm text-muted",
					children: t(lines[line])
				})
			]
		})
	}), document.body);
}
//#endregion
export { AnalysisModal as t };
