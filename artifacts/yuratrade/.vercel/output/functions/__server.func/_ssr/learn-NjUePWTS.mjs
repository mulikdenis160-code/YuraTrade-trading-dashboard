import { g as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { k as useLanguage } from "./router-BXL1pvJA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn-NjUePWTS.js
var import_jsx_runtime = require_jsx_runtime();
var trendCards = [
	{
		key: "learn.trend.up",
		color: "bg-emerald-400",
		border: "border-emerald-400/25",
		dot: "bg-emerald-400"
	},
	{
		key: "learn.trend.down",
		color: "bg-rose-400",
		border: "border-rose-400/25",
		dot: "bg-rose-400"
	},
	{
		key: "learn.trend.sideways",
		color: "bg-amber-300",
		border: "border-amber-300/25",
		dot: "bg-amber-300"
	}
];
function LearnPage() {
	const { t } = useLanguage();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-5xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "rise",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tracking-[0.16em] text-blue-soft uppercase",
						children: t("learn.kicker")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl",
						children: t("learn.title")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-base leading-relaxed text-muted",
						children: t("learn.trend.definition")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", {
				className: "rise rise-2 overflow-hidden rounded-3xl border border-white/8 bg-[#07101c] shadow-[0_24px_70px_rgba(0,0,0,0.28)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/images/trend-infographic.webp",
					alt: t("learn.trend.imageAlt"),
					className: "mx-auto block h-auto w-full",
					fetchPriority: "high"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise rise-3",
				"aria-labelledby": "trend-summary-title",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "trend-summary-title",
					className: "mb-3 text-xl font-bold tracking-tight text-fg sm:text-2xl",
					children: t("learn.intro")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-3",
					children: trendCards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
						className: `rounded-2xl border ${card.border} bg-white/[0.025] p-4 sm:p-5`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `mt-1.5 size-3 shrink-0 rounded-full ${card.dot}`,
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-fg/90 sm:text-base",
								children: t(card.key)
							})]
						})
					}, card.key))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "rise rise-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-4 sm:px-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-muted sm:text-base",
					children: t("learn.trend.caution")
				})
			})
		]
	});
}
//#endregion
export { LearnPage as component };
