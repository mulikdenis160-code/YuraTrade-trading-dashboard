import { g as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as useLanguage, _ as levels, b as isAdminId, x as usePocket } from "./router-shM-Bm2r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-3U_BCAri.js
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { t } = useLanguage();
	const { id, leave } = usePocket();
	const admin = isAdminId(id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-lg space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.14em] text-dim uppercase",
						children: admin ? t("profile.admin") : t("profile.title")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 truncate font-mono text-2xl font-bold text-fg",
						children: id
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-ghost shrink-0 text-sm",
					onClick: leave,
					children: t("profile.signOut")
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-muted",
				children: admin ? t("profile.adminInfo") : t("profile.userInfo")
			})]
		}), levels.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "panel arrive p-4",
			style: { animationDelay: `${levels.indexOf(level) * 80}ms` },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.14em] text-blue-soft uppercase",
						children: level.tag
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-2xl font-bold text-fg",
						children: level.name
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xl font-bold text-fg",
						children: ["$", level.deposit]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: level.lead
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: level.points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2 text-sm leading-relaxed text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1 shrink-0 rounded-full bg-blue-soft" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: point })]
					}, point))
				})
			]
		}, level.id))]
	});
}
//#endregion
export { ProfilePage as component };
