import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, g as require_jsx_runtime, n as require_react_dom } from "../_libs/@tanstack/react-router+[...].mjs";
import { k as useLanguage } from "./router-BU3DFwT5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pair-clipboard-BY77PwhS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = require_react_dom();
var lines = [
	"modal.step1",
	"modal.step2",
	"modal.step3"
];
function AnalysisModal({ pair, expiry, title, description, countdown, copied = false, onCopy }) {
	const { t } = useLanguage();
	const [line, setLine] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (countdown !== void 0) return;
		const timer = window.setInterval(() => setLine((current) => (current + 1) % lines.length), 900);
		return () => window.clearInterval(timer);
	}, [countdown]);
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center p-4",
		style: { background: "#080b12" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-3xl border border-[#2c3a50] px-6 py-8 text-center",
			style: {
				background: "#121826",
				boxShadow: "0 24px 64px #000"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-semibold tracking-[0.14em] text-dim uppercase",
				children: [
					pair,
					" · ",
					expiry
				]
			}), countdown !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-6 text-2xl font-bold text-fg",
					children: t("signal.pairChosen")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: t("signal.choosePair")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 rounded-2xl border border-white/10 bg-white/4 px-4 py-4",
					role: "status",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-fg",
							children: t("signal.countdownRemaining", { seconds: countdown })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-dim",
							children: t("signal.countdownUnit")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-5xl font-bold tabular-nums text-blue-soft",
							children: countdown
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-prime mt-4 min-h-11 w-full",
					onClick: onCopy,
					children: t(copied ? "common.copied" : "common.copy")
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
					children: title ?? t("modal.title")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 min-h-10 text-sm leading-relaxed text-muted",
					children: description ?? t(lines[line])
				})
			] })]
		})
	}), document.body);
}
function pairNameForClipboard(name) {
	return name.replace(/\s+OTC$/i, "").trim();
}
function copyPairName(name) {
	const pairName = pairNameForClipboard(name);
	if (typeof document === "undefined") return Promise.reject(/* @__PURE__ */ new Error("copy"));
	const area = document.createElement("textarea");
	area.value = pairName;
	area.setAttribute("readonly", "");
	area.style.position = "fixed";
	area.style.top = "0";
	area.style.left = "0";
	area.style.opacity = "0";
	document.body.appendChild(area);
	area.focus();
	area.select();
	area.setSelectionRange(0, pairName.length);
	let copied = false;
	try {
		copied = document.execCommand("copy");
	} catch {
		copied = false;
	}
	area.remove();
	if (copied) return Promise.resolve();
	if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(pairName);
	return Promise.reject(/* @__PURE__ */ new Error("copy"));
}
//#endregion
export { copyPairName as n, AnalysisModal as t };
