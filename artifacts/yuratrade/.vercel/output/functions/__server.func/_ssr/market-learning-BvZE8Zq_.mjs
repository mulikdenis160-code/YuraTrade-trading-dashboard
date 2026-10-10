import { g as require_jsx_runtime, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { k as useLanguage } from "./router-Bg7lHBFl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-learning-BvZE8Zq_.js
var import_jsx_runtime = require_jsx_runtime();
function MarketLearning({ compact = false }) {
	const { t } = useLanguage();
	const topics = [
		{
			title: t("market.trendTitle"),
			body: t("market.trendBody"),
			detail: t("market.trendDetail")
		},
		{
			title: t("market.retestTitle"),
			body: t("market.retestBody"),
			detail: t("market.retestDetail")
		},
		{
			title: t("market.doubleTitle"),
			body: t("market.doubleBody"),
			detail: t("market.doubleDetail")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel p-4 sm:p-5",
		"aria-labelledby": compact ? "market-home-title" : "market-learn-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-[0.16em] text-blue-soft uppercase",
				children: t("market.kicker")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: compact ? "market-home-title" : "market-learn-title",
				className: "mt-2 text-xl font-bold tracking-tight text-fg sm:text-2xl",
				children: compact ? t("market.homeTitle") : t("market.title")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-relaxed text-muted",
				children: t("market.intro")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `mt-4 grid gap-3 ${compact ? "sm:grid-cols-2" : ""}`,
				children: topics.map((topic) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-white/8 bg-white/4 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-bold text-fg",
							children: topic.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: topic.body
						}),
						!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 rounded-xl bg-blue/8 px-3 py-2 text-xs leading-relaxed text-blue-soft",
							children: topic.detail
						}) : null
					]
				}, topic.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 rounded-xl border border-white/8 bg-black/15 px-3 py-2 text-xs leading-relaxed text-dim",
				children: t("market.caution")
			}),
			compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/learn",
				className: "btn-ghost mt-3 min-h-10 justify-center text-sm",
				children: t("market.learnMore")
			}) : null
		]
	});
}
//#endregion
export { MarketLearning as t };
