globalThis.__nitro_main__ = import.meta.url;
import { i as toEventHandler, n as HTTPError, o as NodeResponse, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { n as wrapper_default } from "./_libs/@google/genai.mjs";
import { t as require_dist } from "./_libs/https-proxy-agent.mjs";
import { t as require_proxy_from_env } from "./_libs/proxy-from-env.mjs";
import { t as require_undici } from "./_libs/undici.mjs";
import { a as object, i as number, n as discriminatedUnion, o as string, r as literal, t as _enum } from "./_libs/zod.mjs";
import "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.5.8_chokidar@5.0.0_drizzle-orm@0.45.2_@ele_84e83e5e11232efb2e32e646a7e9d065/node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region scripts/install-page.html?raw
var install_page_default = "<!DOCTYPE html>\n<html lang=\"en\" class=\"device-desktop\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta\n      name=\"viewport\"\n      content=\"width=device-width, initial-scale=1, viewport-fit=cover\"\n    />\n    <meta name=\"color-scheme\" content=\"dark\" />\n    <meta name=\"theme-color\" content=\"#000000\" />\n    <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\" />\n    <meta name=\"apple-mobile-web-app-title\" content=\"{{APP_NAME}}\" />\n    <title>Add {{APP_NAME}} to your Home Screen</title>\n    <link rel=\"manifest\" href=\"/__grok/manifest.webmanifest\" />\n    <link rel=\"apple-touch-icon\" href=\"/__grok/icon-180.png\" />\n    <link rel=\"stylesheet\" href=\"/__grok/install/styles.css\" />\n    <script>\n      (function () {\n        var ua = navigator.userAgent || \"\";\n        var touch = navigator.maxTouchPoints || 0;\n        var isiPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && touch > 1);\n        var isiPhone = /iPhone|iPod/.test(ua);\n        var isIOS = isiPhone || isiPad;\n        var isAndroid = /Android/i.test(ua);\n        var isAndroidPhone = isAndroid && /Mobile/i.test(ua);\n        var isAndroidTablet = isAndroid && !/Mobile/i.test(ua);\n        var minSide = Math.min(screen.width || 0, screen.height || 0);\n        var maxSide = Math.max(screen.width || 0, screen.height || 0);\n\n        var type = \"desktop\";\n        if (isiPhone) type = \"phone\";\n        else if (isiPad || isAndroidTablet) type = \"tablet\";\n        else if (isAndroidPhone) type = \"phone\";\n        else if (touch > 0 && minSide > 0 && minSide <= 500) type = \"phone\";\n        else if (touch > 0 && minSide > 500 && maxSide <= 1400) type = \"tablet\";\n\n        var iosMajor = null;\n        var osToken = null;\n        var safariToken = null;\n        var iphoneOs = ua.match(/iPhone OS (\\d+)[._]/);\n        var ipadOs = ua.match(/CPU OS (\\d+)[._](\\d+) like Mac OS X/);\n        var safariVer = ua.match(/Version\\/(\\d+)[._]/);\n        if (iphoneOs) osToken = parseInt(iphoneOs[1], 10);\n        else if (ipadOs) osToken = parseInt(ipadOs[1], 10);\n        if (isIOS && safariVer) safariToken = parseInt(safariVer[1], 10);\n        if (osToken != null || safariToken != null) {\n          iosMajor = Math.max(osToken || 0, safariToken || 0);\n        }\n\n        var root = document.documentElement;\n        var classes = [\"device-\" + type];\n        if (iosMajor != null) {\n          root.dataset.ios = String(iosMajor);\n          classes.push(iosMajor >= 27 ? \"ios-27-plus\" : \"ios-below-27\");\n        }\n        root.className = classes.join(\" \");\n      })();\n    <\/script>\n  </head>\n  <body>\n    <div class=\"page\">\n      <header class=\"powered\" aria-label=\"Powered by Grok\">\n        <span class=\"powered-by\">Powered by</span>\n        <span class=\"powered-brand\">\n          <img\n            class=\"grok-logo\"\n            src=\"/__grok/install/assets/homescreen/logo-grok.svg\"\n            width=\"14\"\n            height=\"14\"\n            alt=\"\"\n          />\n          <span class=\"powered-grok\">Grok</span>\n        </span>\n      </header>\n\n      <main class=\"content\">\n        <div class=\"ob\" aria-hidden=\"true\">\n          <img\n            class=\"ob-img ob-phone\"\n            src=\"/__grok/install/assets/homescreen/ob-phone.png\"\n            width=\"338\"\n            height=\"294\"\n            alt=\"\"\n          />\n          <img\n            class=\"ob-img ob-ipad\"\n            src=\"/__grok/install/assets/homescreen/ob-ipad.png\"\n            width=\"634\"\n            height=\"294\"\n            alt=\"\"\n          />\n        </div>\n\n        <section class=\"copy\">\n          <h1>Add {{APP_NAME}} to your&nbsp;Home&nbsp;Screen</h1>\n\n          <div class=\"steps\">\n            <p class=\"step step-tap step-ios27\">\n              <span class=\"muted\">Tap</span>\n              <span class=\"glass glass--icon\" aria-hidden=\"true\">\n                <img src=\"/__grok/install/assets/homescreen/glass-puzzle.svg\" width=\"24\" height=\"24\" alt=\"\" />\n              </span>\n              <span class=\"muted loc loc-phone\">in the bottom bar, then</span>\n              <span class=\"muted loc loc-ipad\">in the tool bar, then</span>\n              <span class=\"glass glass--icon\" aria-hidden=\"true\">\n                <img src=\"/__grok/install/assets/homescreen/glass-share.svg\" width=\"24\" height=\"24\" alt=\"\" />\n              </span>\n            </p>\n\n            <p class=\"step step-tap step-ios-legacy\">\n              <span class=\"muted\">Tap</span>\n              <span class=\"glass glass--icon\" aria-hidden=\"true\">\n                <img src=\"/__grok/install/assets/homescreen/glass-share.svg\" width=\"24\" height=\"24\" alt=\"\" />\n              </span>\n              <span class=\"muted loc loc-phone\">in the bottom bar</span>\n              <span class=\"muted loc loc-ipad\">in the tool bar</span>\n            </p>\n\n            <p class=\"step step-select\">\n              <span class=\"muted\">Select</span>\n              <span class=\"add-label\">\n                <img\n                  class=\"plus-icon\"\n                  src=\"/__grok/install/assets/homescreen/plus.svg\"\n                  width=\"16\"\n                  height=\"16\"\n                  alt=\"\"\n                />\n                <span class=\"add-text\">Add to Home Screen</span>\n              </span>\n            </p>\n          </div>\n        </section>\n      </main>\n\n      <main class=\"content content-desktop\">\n        <section class=\"copy\">\n          <h1>Open this link on your iPhone&nbsp;or&nbsp;iPad</h1>\n          <p class=\"desktop-note\">\n            This page shows how to add {{APP_NAME}} to an iOS Home Screen.\n          </p>\n          <a class=\"desktop-open\" href=\"{{APP_URL}}\">Open {{APP_NAME}}</a>\n        </section>\n      </main>\n    </div>\n  </body>\n</html>\n";
//#endregion
//#region \0virtual:grok-og-identity
var grokOgIdentity = { "site": {
	"title": "PRIME BOT",
	"card": "custom",
	"image": "/og.jpg"
} };
//#endregion
//#region scripts/grok-pwa-shared.mjs
/**
* Single source of truth for platform head chrome (PWA, extensions.js, OG),
* shared by the Vite plugin and Nitro middleware. Plain ESM so `node --test`
* and the Nitro bundler can both consume it.
*/
var DEFAULT_APP_NAME = "Grok App";
var OG_SITE_REL_PATH = "src/lib/og/site.json";
var SHARE_META_KEYS = /* @__PURE__ */ new Set([
	"og:title",
	"og:description",
	"og:image",
	"og:image:width",
	"og:image:height",
	"og:type",
	"og:url",
	"og:site_name",
	"twitter:card",
	"twitter:title",
	"twitter:image",
	"twitter:description",
	"x:game:image",
	"x:game:image:width",
	"x:game:image:height"
]);
function escapeHtml(value) {
	return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
/** Inverse of escapeHtml. Decode &amp; last so a single pass undoes one encode. */
function unescapeHtml(value) {
	return String(value).replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", "\"").replaceAll("&#39;", "'").replaceAll("&amp;", "&");
}
/** 6-digit hex for the og.grok.me placeholder, or "" if site.color is missing/invalid. */
function placeholderCardColor(site = {}) {
	const raw = String(site.color ?? "").trim();
	const hex = raw.startsWith("#") ? raw.slice(1) : raw;
	return /^[0-9a-fA-F]{6}$/.test(hex) ? hex : "";
}
/**
* "wild-race.grok.me" → "Wild Race". Only published app hosts encode the
* display name in the first label. Preview / guest hosts are image origins
* only — slugifying them produced internal names like "Hds Abc 3000 Xy".
*/
function appNameFromHost(hostHeader) {
	const host = String(hostHeader ?? "").split(",")[0].trim().split(":")[0].toLowerCase();
	if (!host.endsWith(".grok.me")) return DEFAULT_APP_NAME;
	const slug = host.split(".")[0] ?? "";
	if (!slug || slug === "www" || !/^[a-z0-9-]{1,63}$/.test(slug)) return DEFAULT_APP_NAME;
	return slug.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Grok App";
}
/** True for Vercel system domains. Envoy rewrites origin Host to these; they SSO-protect `/og.jpg`. */
function isVercelSystemHost(host) {
	return host === "vercel.app" || host.endsWith(".vercel.app") || host === "vercel.com" || host.endsWith(".vercel.com");
}
/** Hostname suitable for absolute og:image URLs. Preview guests (X-Forwarded-Host) are allowed. */
function publicAppHost(hostHeader) {
	const host = String(hostHeader ?? "").split(",")[0].trim().split(":")[0].toLowerCase();
	if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
	if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
	if (isVercelSystemHost(host)) return "";
	return host;
}
/**
* Published apps always use `VITE_PUBLIC_HOSTNAME` (the grok.me host the
* deployer injects). Live preview has no such env, so fall back to the
* request host / X-Forwarded-Host. Never prefer request Host on a published
* app — Envoy rewrites it to `*.vercel.app`.
*/
function resolvePublicHost(hostHeader) {
	return publicAppHost(process.env?.VITE_PUBLIC_HOSTNAME) || publicAppHost(hostHeader);
}
function isInstallQuery(url) {
	const query = String(url ?? "").split("?", 2)[1] ?? "";
	const params = new URLSearchParams(query);
	const install = params.get("install");
	const platform = (params.get("platform") ?? "").toLowerCase();
	return (install === "1" || install === "true") && platform === "ios";
}
/** Paths that can carry an app document (vs assets / API / internals). */
function isDocumentPath(pathname) {
	const path = String(pathname ?? "");
	return !path.startsWith("/__grok/") && !path.startsWith("/api/") && !path.startsWith("/@") && !path.startsWith("/node_modules") && !/\.[a-z0-9]+$/i.test(path);
}
function acceptsHtml(accept) {
	const value = String(accept ?? "");
	return value === "" || value.includes("text/html") || value.includes("*/*");
}
/** The same URL without the install-tutorial params (used as the app link). */
function stripInstallParams(url) {
	const [path = "/", query = ""] = String(url ?? "/").split("?", 2);
	const params = new URLSearchParams(query);
	params.delete("install");
	params.delete("platform");
	const rest = params.toString();
	return rest ? `${path}?${rest}` : path;
}
function renderInstallPageHtml(template, { host, url } = {}) {
	return String(template).replaceAll("{{APP_NAME}}", escapeHtml(appNameFromHost(host))).replaceAll("{{APP_URL}}", escapeHtml(stripInstallParams(url)));
}
function renderWebManifest(hostHeader) {
	const name = appNameFromHost(hostHeader);
	return JSON.stringify({
		name,
		short_name: name,
		id: "/",
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#000000",
		theme_color: "#000000",
		icons: [{
			src: "/__grok/icon-180.png",
			sizes: "180x180",
			type: "image/png"
		}]
	}, null, 2);
}
function grokPwaHeadTags(appName = DEFAULT_APP_NAME) {
	return [
		["manifest", "<link rel=\"manifest\" href=\"/__grok/manifest.webmanifest\">"],
		["apple-touch-icon", "<link rel=\"apple-touch-icon\" href=\"/__grok/icon-180.png\">"],
		["apple-mobile-web-app-title", `<meta name="apple-mobile-web-app-title" content="${escapeHtml(appName)}">`],
		["apple-mobile-web-app-status-bar-style", "<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\">"],
		["theme-color", "<meta name=\"theme-color\" content=\"#000000\">"]
	];
}
var GROK_EXTENSIONS_SCRIPT_SRC = "https://grok.com/grok-app-builder/extensions.js";
function readGrokProjectId() {
	const fromProcess = typeof process !== "undefined" ? process.env?.VITE_PROJECT_ID : "";
	return String(fromProcess ?? "").trim();
}
function readGrokExtensionsEnabled() {
	const fromProcess = typeof process !== "undefined" ? process.env?.VITE_GROK_EXTENSIONS : "";
	return String(fromProcess ?? "").trim() !== "0";
}
function readXCreator() {
	const fromProcess = typeof process !== "undefined" ? process.env?.X_CREATOR : "";
	return String(fromProcess ?? "").trim();
}
function readXCreatorId() {
	const fromProcess = typeof process !== "undefined" ? process.env?.X_CREATOR_ID : "";
	return String(fromProcess ?? "").trim();
}
function grokXCreatorHeadTags(creator = readXCreator(), creatorId = readXCreatorId()) {
	const name = String(creator ?? "").trim();
	const id = String(creatorId ?? "").trim();
	if (!name || !id) return [];
	return [`<meta property="x:creator" content="${escapeHtml(name)}">`, `<meta property="x:creator:id" content="${escapeHtml(id)}">`];
}
/** Platform "Created with Grok" banner — injected into every HTML document. */
function grokExtensionsHeadTags(projectId = readGrokProjectId()) {
	const id = escapeHtml(projectId);
	const tags = [];
	if (projectId) tags.push(`<meta name="grok-project-id" content="${id}">`);
	if (!readGrokExtensionsEnabled()) return tags;
	tags.push(`<script src="${GROK_EXTENSIONS_SCRIPT_SRC}"${projectId ? ` data-project-id="${id}"` : ""} defer><\/script>`);
	return tags;
}
function readOgSite(cwd = process.cwd()) {
	try {
		const raw = readFileSync(join(cwd, OG_SITE_REL_PATH), "utf8");
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
	} catch {
		return {};
	}
}
/** Public path of an on-disk share card, or "" if neither file exists. */
function ogCardPublicPath(cwd = process.cwd()) {
	if (existsSync(join(cwd, "public/og.jpg"))) return "/og.jpg";
	if (existsSync(join(cwd, "public/og.png"))) return "/og.png";
	return "";
}
function detectCustomOgCard(cwd = process.cwd(), site = {}) {
	if (ogCardPublicPath(cwd)) return true;
	return siteHasCustomCard(site) || Boolean(String(site.image ?? "").trim());
}
/** Snapshot for Vite/Nitro to bake into the server bundle (Vercel has no workspace FS). */
function snapshotOgIdentity(cwd = process.cwd()) {
	const site = { ...readOgSite(cwd) };
	const disk = ogCardPublicPath(cwd);
	if (disk) {
		site.card = "custom";
		site.image = disk;
	} else {
		if (siteHasCustomCard(site)) delete site.card;
		if (site.image) delete site.image;
	}
	if (existsSync(join(cwd, "public/x-banner.jpg"))) site.banner = site.banner || "/x-banner.jpg";
	return { site };
}
function ogServiceUrl() {
	return (String(process.env?.VITE_OG_SERVICE_URL ?? "").trim() || "https://og.grok.me").replace(/\/+$/, "");
}
function titleFromDocument(html) {
	const match = String(html ?? "").match(/<title\b[^>]*>([^<]*)<\/title>/i);
	return match ? unescapeHtml(match[1]).trim() : "";
}
function resolveOgTitle(site = {}, appName = DEFAULT_APP_NAME, host = "", documentTitle = "") {
	const fromSite = String(site.title ?? "").trim();
	if (fromSite) return fromSite;
	const fromDoc = String(documentTitle ?? "").trim();
	if (fromDoc) return fromDoc;
	const fromHost = appNameFromHost(host);
	if (fromHost && fromHost !== "Grok App") return fromHost;
	return String(appName ?? "").trim() || "Grok App";
}
function siteHasCustomCard(site = {}) {
	return String(site.card ?? "").toLowerCase() === "custom";
}
/**
* Preview: public/og.jpg|png on disk.
* Vercel: the bake (`card=custom` / `image`) because the function cannot stat public/.
* Otherwise empty — caller emits the og.grok.me placeholder.
*/
function resolveOgCardAsset(site = {}, cwd = process.cwd()) {
	return ogCardPublicPath(cwd) || (detectCustomOgCard(cwd, site) ? String(site.image ?? "").trim() || "/og.jpg" : "");
}
/** Stamp `card=custom` when public/og.jpg or public/og.png is on disk. */
function applyCustomCardFromFs(site, cwd) {
	const disk = ogCardPublicPath(cwd);
	if (!disk) return site;
	return {
		...site,
		card: "custom",
		image: disk
	};
}
function grokOgHeadTags({ host = "", appName = DEFAULT_APP_NAME, site = {}, documentTitle = "", cwd = process.cwd() } = {}) {
	const title = resolveOgTitle(site, appName, host, documentTitle);
	const publicHost = resolvePublicHost(host);
	const tags = [`<meta name="twitter:card" content="summary_large_image">`, `<meta property="og:title" content="${escapeHtml(title)}">`];
	const description = String(site.description ?? "").trim();
	if (description) tags.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
	if (String(site.type ?? "").toLowerCase() === "x:game") tags.push(`<meta property="og:type" content="x:game">`);
	if (publicHost) {
		const asset = resolveOgCardAsset(site, cwd);
		const custom = Boolean(asset);
		let image = custom ? `https://${publicHost}${asset.startsWith("/") ? asset : `/${asset}`}` : `${ogServiceUrl()}/v1/card.png?host=${encodeURIComponent(publicHost)}&title=${encodeURIComponent(title)}`;
		const color = !custom ? placeholderCardColor(site) : "";
		if (color) image += `&color=${encodeURIComponent(color)}`;
		tags.push(`<meta property="og:image" content="${escapeHtml(image)}">`);
		tags.push(`<meta property="og:image:width" content="1200">`);
		tags.push(`<meta property="og:image:height" content="630">`);
		const banner = String(site.banner ?? "").trim();
		if (banner) {
			const bannerUrl = `https://${publicHost}${banner.startsWith("/") ? banner : `/${banner}`}`;
			tags.push(`<meta property="x:game:image" content="${escapeHtml(bannerUrl)}">`);
			tags.push(`<meta property="x:game:image:width" content="1200">`);
			tags.push(`<meta property="x:game:image:height" content="264">`);
		}
	}
	return tags;
}
function stripGrokExtensionsScript(html) {
	return String(html).replace(/<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/grok-app-builder\/extensions\.js[^"']*["'][^>]*>\s*<\/script>/gi, "");
}
function stripShareMetaTags(html) {
	return String(html).replace(/<meta\b[^>]*>/gi, (tag) => {
		const attrs = [...tag.matchAll(/\b(?:property|name)\s*=\s*["']([^"']+)["']/gi)];
		for (const match of attrs) if (SHARE_META_KEYS.has(String(match[1]).toLowerCase())) return "";
		return tag;
	});
}
function insertAfterHeadOpen(html, snippet) {
	if (/<head\b[^>]*>/i.test(html)) return html.replace(/<head\b[^>]*>/i, (open) => `${open}${snippet}`);
	if (/<html\b[^>]*>/i.test(html)) return html.replace(/<html\b[^>]*>/i, (open) => `${open}<head>${snippet}</head>`);
	return `<!doctype html><html><head>${snippet}</head>${html}`;
}
function insertBeforeHeadClose(html, snippet) {
	if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${snippet}</head>`);
	return insertAfterHeadOpen(html, snippet);
}
function normalizeHeadContext(ctx = {}) {
	const cwd = ctx.cwd ?? process.cwd();
	const site = applyCustomCardFromFs(ctx.site !== void 0 ? ctx.site : snapshotOgIdentity(cwd).site, cwd);
	return {
		appName: resolveOgTitle(site, ctx.appName ?? "Grok App", ctx.host ?? ""),
		projectId: ctx.projectId ?? readGrokProjectId(),
		creator: ctx.creator ?? readXCreator(),
		creatorId: ctx.creatorId ?? readXCreatorId(),
		host: ctx.host ?? "",
		cwd,
		site
	};
}
function injectGrokPwaHead(html, ctx = {}) {
	if (typeof html !== "string") return html;
	const { site, projectId, creator, creatorId, host, cwd } = normalizeHeadContext(ctx);
	const documentTitle = titleFromDocument(html);
	const appName = resolveOgTitle(site, ctx.appName ?? "Grok App", host, documentTitle);
	let next = stripShareMetaTags(html);
	if (!readGrokExtensionsEnabled()) next = stripGrokExtensionsScript(next);
	const missing = grokPwaHeadTags(appName).filter(([key]) => {
		if (key === "manifest") return !next.includes("href=\"/__grok/manifest.webmanifest\"");
		if (key === "apple-touch-icon") return !next.includes("href=\"/__grok/icon-180.png\"");
		return !next.includes(`name="${key}"`);
	}).map(([, tag]) => tag);
	next = insertAfterHeadOpen(next, grokOgHeadTags({
		host,
		appName,
		site,
		documentTitle,
		cwd
	}).join(""));
	if (readGrokExtensionsEnabled() && !next.includes("/grok-app-builder/extensions.js")) missing.push(...grokExtensionsHeadTags(projectId));
	else if (projectId && !next.includes("name=\"grok-project-id\"")) missing.push(`<meta name="grok-project-id" content="${escapeHtml(projectId)}">`);
	if (projectId && !next.includes("property=\"grok:app_id\"") && !next.includes("property='grok:app_id'")) missing.push(`<meta property="grok:app_id" content="${escapeHtml(projectId)}">`);
	const creatorTags = grokXCreatorHeadTags(creator, creatorId);
	if (creatorTags.length > 0) {
		if (!(next.includes("property=\"x:creator\" content=") || next.includes("property='x:creator' content="))) missing.push(creatorTags[0]);
		if (!next.includes("property=\"x:creator:id\"")) missing.push(creatorTags[1]);
	}
	if (missing.length === 0) return next;
	return insertBeforeHeadClose(next, missing.join(""));
}
function findHeadClose(buf) {
	return buf.toString("latin1").search(/<\/head>/i);
}
/**
* Streaming head injector: buffers only until `</head>` (ASCII marker; never
* appears inside a UTF-8 continuation byte), overwrites share-card metas,
* then passes later chunks through so streaming SSR keeps streaming.
*/
function createHeadInjector(ctx = {}) {
	const normalized = normalizeHeadContext(ctx);
	/** @type {Buffer[]} */
	let pending = [];
	let done = false;
	const apply = (html) => injectGrokPwaHead(html, {
		appName: normalized.appName,
		projectId: normalized.projectId,
		creator: normalized.creator,
		creatorId: normalized.creatorId,
		host: normalized.host,
		cwd: normalized.cwd,
		site: normalized.site
	});
	return {
		/** @param {Uint8Array | string} chunk @returns {Buffer[]} chunks ready to emit */
		push(chunk) {
			const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
			if (done) return [buf];
			pending.push(buf);
			const joined = Buffer.concat(pending);
			const at = findHeadClose(joined);
			if (at === -1) return [];
			done = true;
			pending = [];
			const closeLen = joined.toString("latin1", at).match(/^<\/head>/i)[0].length;
			const head = apply(joined.subarray(0, at + closeLen).toString("utf8"));
			return [Buffer.concat([Buffer.from(head, "utf8"), joined.subarray(at + closeLen)])];
		},
		/** @returns {Buffer[]} whatever is still buffered (no `</head>` seen) */
		flush() {
			if (done || pending.length === 0) return [];
			const rest = Buffer.concat(pending);
			pending = [];
			done = true;
			return [Buffer.from(apply(rest.toString("utf8")), "utf8")];
		}
	};
}
//#endregion
//#region server/middleware/grok-pwa.ts
/**
* Deployed-app (Nitro) half of the platform PWA chrome. Auto-registered as
* global h3 middleware because vite.config.ts sets `serverDir: "./server"` —
* without that option Nitro v3 never scans this directory.
*
* - `?install=1&platform=ios` on a document path → the Home Screen tutorial,
*   bundled into the server build via `?raw` (the public/ directory is CDN
*   static output on Vercel and not readable from the function).
* - `/__grok/manifest.webmanifest` → per-app-named manifest (kept out of
*   public/ so this dynamic response is the only one).
* - Other HTML documents → stream-inject PWA + OG head tags at `</head>`.
*   OG identity is baked via `virtual:grok-og-identity` at `vite build`
*   (this function cannot read `src/lib/og/site.json` or `public/og.jpg`).
*   This must be a middleware transforming `next()`: h3 discards the `response`
*   runtime hook's return value, and `render:html` does not exist in Nitro v3.
*/
function requestHost(event) {
	return event.req.headers.get("x-forwarded-host") ?? event.req.headers.get("host") ?? event.url.host;
}
function injectHeadStreaming(response, host) {
	const injector = createHeadInjector({
		host,
		site: grokOgIdentity.site
	});
	const transformed = response.body.pipeThrough(new TransformStream({
		transform(chunk, controller) {
			for (const out of injector.push(chunk)) controller.enqueue(out);
		},
		flush(controller) {
			for (const out of injector.flush()) controller.enqueue(out);
		}
	}));
	const headers = new Headers(response.headers);
	headers.delete("content-length");
	return new Response(transformed, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
async function grokPwaMiddleware(event, next) {
	if ((event.req.method ?? "GET").toUpperCase() !== "GET") return next();
	const path = event.url.pathname;
	const urlWithQuery = path + event.url.search;
	if (path === "/__grok/manifest.webmanifest" || path === "/__grok/manifest.json") return new Response(renderWebManifest(requestHost(event)), { headers: {
		"content-type": "application/manifest+json; charset=utf-8",
		"cache-control": "no-cache"
	} });
	if (isInstallQuery(urlWithQuery) && isDocumentPath(path) && acceptsHtml(event.req.headers.get("accept"))) {
		const html = renderInstallPageHtml(install_page_default, {
			host: requestHost(event),
			url: urlWithQuery
		});
		return new Response(html, { headers: {
			"content-type": "text/html; charset=utf-8",
			"cache-control": "no-cache"
		} });
	}
	if (!isDocumentPath(path)) return next();
	const result = await next();
	if (result instanceof Response && result.body && String(result.headers.get("content-type") ?? "").includes("text/html") && !result.headers.get("content-encoding")) return injectHeadStreaming(result, requestHost(event));
	return result;
}
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_If1dcy = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_If1dcy
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(grokPwaMiddleware)].filter(Boolean);
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.5.8_chokidar@5.0.0_drizzle-orm@0.45.2_@ele_84e83e5e11232efb2e32e646a7e9d065/node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region src/lib/pocket-proxy.server.ts
var import_dist = require_dist();
var import_proxy_from_env = require_proxy_from_env();
/** WebSocket upgrades use HTTPS routing, including NO_PROXY exclusions. */
function pocketProxyAgent(feedUrl) {
	const destination = new URL(feedUrl);
	destination.protocol = destination.protocol === "wss:" ? "https:" : "http:";
	const proxy = (0, import_proxy_from_env.getProxyForUrl)(destination.href);
	return proxy ? new import_dist.HttpsProxyAgent(proxy) : void 0;
}
require_undici();
//#endregion
//#region src/lib/external-api-control.server.ts
function externalApisDisabled(env = process.env) {
	return env.PRIME_EXTERNAL_APIS_DISABLED?.trim().toLowerCase() === "true";
}
//#endregion
//#region src/lib/market-ai.server.ts
var signalReviewSchema = object({
	decision: literal("signal"),
	symbol: string().min(1).max(80),
	direction: _enum(["call", "put"]),
	confidence: number().int().min(0).max(100),
	explanation: string().trim().min(1).max(1200)
});
var passReviewSchema = object({
	decision: literal("pass"),
	reason: string().trim().min(1).max(1200)
});
discriminatedUnion("decision", [signalReviewSchema, passReviewSchema]);
[
	"Ты анализируешь одну OTC-валютную пару. В данных есть свежая цена, до 64 последних закрытых OHLC-свечей выбранного интервала и до 16 свечей старшего интервала.",
	"Используй dataQuality для оценки полноты и свежести. Времена свечей заданы в Unix-секундах; null означает, что показатель недоступен, а не ноль. Значения с суффиксом Bps заданы в базисных пунктах.",
	"Учитывай EMA 9/21/50 и наклоны, RSI 14, MACD-гистограмму, Bollinger z-score, ATR и его отношение, недавние доходности, расстояния до прошлых максимумов/минимумов, а также ADX 14 и +DI/-DI. ADX оценивает силу, а не направление тренда; сравнивай +DI с -DI и проверяй согласованность с EMA, старшим таймфреймом и реальными OHLC-свечами.",
	"Не называй движение выраженным трендом, если ADX слабый или индикаторы и старший таймфрейм противоречат друг другу. Не выдумывай OHLC, индикаторы, новости или цены. Подстраивай прогноз под expirySeconds из входных данных; candleSeconds — это интервал свечей, а не срок сделки.",
	"Поле trend сравнивает последнее закрытие с закрытием четырьмя свечами ранее; используй его вместе с индикаторами, а не как единственное основание.",
	"При корректных входных данных обязательно выбери направление вверх или вниз. Не используй вторую модель-классификатор. Не добавляй к заданному формату дополнительные поля или метки.",
	"Верни только один компактный JSON-объект: {\"direction\":\"up\"|\"down\",\"explanation\":\"одно короткое предложение на русском, не более 160 символов\",\"confidence\":0..100}. Уверенность — субъективная оценка, а не вероятность выигрыша и не подтверждённая статистика. Не обещай результат и не открывай сделки."
].join(" ");
//#endregion
//#region src/lib/signal-data-error.ts
var SignalDataError = class extends Error {
	scope;
	constructor(message, scope) {
		super(message);
		this.scope = scope;
		this.name = "SignalDataError";
	}
	toResult() {
		return {
			decision: "pass",
			reason: this.message,
			retryAcrossPairs: this.scope === "pair",
			retryAfterMs: this.scope === "feed" ? 2e3 : 0
		};
	}
};
//#endregion
//#region src/lib/pocket-option-history.ts
function mergePocketHistoryByTime(cached, incoming, limit = 128) {
	const byTime = new Map(cached.map((candle) => [candle.time, candle]));
	for (const candle of incoming) byTime.set(candle.time, candle);
	return [...byTime.values()].sort((a, b) => a.time - b.time).slice(-limit);
}
function appendCoveredFastCandles(candles, ticks, periodSeconds, nowMs, maxGapCandles = 8, onCoverage) {
	if (candles.length === 0 || ticks.length === 0 || !Number.isInteger(periodSeconds) || periodSeconds <= 0) return candles;
	const periodMs = periodSeconds * 1e3;
	const orderedCandles = [...candles].sort((a, b) => a.time - b.time);
	const latestKnownTimeMs = orderedCandles.at(-1).time * 1e3;
	const formingCandleStartMs = latestKnownTimeMs + Math.floor((nowMs - latestKnownTimeMs) / periodMs) * periodMs;
	const missingCount = Math.floor((formingCandleStartMs - periodMs - latestKnownTimeMs) / periodMs);
	if (missingCount <= 0 || missingCount > maxGapCandles) return candles;
	const grouped = /* @__PURE__ */ new Map();
	for (const tick of ticks) {
		if (!Number.isFinite(tick.time) || !Number.isFinite(tick.price) || tick.time <= latestKnownTimeMs || tick.time >= formingCandleStartMs || tick.price <= 0) continue;
		const candleIndex = Math.floor((tick.time - latestKnownTimeMs) / periodMs);
		if (candleIndex < 1 || candleIndex > missingCount) continue;
		const candleTimeMs = latestKnownTimeMs + candleIndex * periodMs;
		const group = grouped.get(candleTimeMs) ?? [];
		group.push(tick);
		grouped.set(candleTimeMs, group);
	}
	const reconstructed = [];
	let blockedAtIndex = null;
	let blockedTickCount = null;
	let blockedCoverageMs = null;
	for (let index = 1; index <= missingCount; index += 1) {
		const candleTimeMs = latestKnownTimeMs + index * periodMs;
		const group = (grouped.get(candleTimeMs) ?? []).sort((a, b) => a.time - b.time);
		if (group.length < 4) {
			blockedAtIndex = index;
			blockedTickCount = group.length;
			blockedCoverageMs = group.length > 1 ? group.at(-1).time - group[0].time : 0;
			break;
		}
		const coverageMs = group.at(-1).time - group[0].time;
		if (coverageMs < periodMs * .7) {
			blockedAtIndex = index;
			blockedTickCount = group.length;
			blockedCoverageMs = coverageMs;
			break;
		}
		const prices = group.map((tick) => tick.price);
		reconstructed.push({
			time: candleTimeMs / 1e3,
			open: prices[0],
			high: Math.max(...prices),
			low: Math.min(...prices),
			close: prices.at(-1)
		});
	}
	onCoverage?.({
		latestKnownTimeMs,
		formingCandleStartMs,
		candleOffsetMs: latestKnownTimeMs % periodMs,
		missingCount,
		reconstructedCount: reconstructed.length,
		blockedAtIndex,
		blockedTickCount,
		blockedCoverageMs
	});
	return reconstructed.length > 0 ? [...orderedCandles, ...reconstructed] : candles;
}
function parsePocketOptionHistory(data) {
	const candles = [];
	for (const row of data) {
		if (!row || typeof row !== "object" || Array.isArray(row)) continue;
		const candle = row;
		const time = Number(candle.time);
		const open = Number(candle.open);
		const close = Number(candle.close);
		const high = Number(candle.high);
		const low = Number(candle.low);
		if (![
			time,
			open,
			close,
			high,
			low
		].every(Number.isFinite) || time <= 0 || open <= 0 || close <= 0 || low <= 0 || high < Math.max(open, close) || low > Math.min(open, close) || high < low) continue;
		candles.push({
			time,
			open,
			close,
			high,
			low
		});
	}
	candles.sort((a, b) => a.time - b.time);
	return {
		candles,
		rejectedRows: data.length - candles.length
	};
}
/** Fast history tuples are [open time, open, close, high, low, volume]. */
function parsePocketFastCandles(data) {
	return parsePocketOptionHistory(data.map((row) => {
		if (!Array.isArray(row) || row.length < 5) return null;
		const rawTime = Number(row[0]);
		return {
			time: rawTime >= 0xe8d4a51000 ? rawTime / 1e3 : rawTime,
			open: row[1],
			close: row[2],
			high: row[3],
			low: row[4]
		};
	}));
}
/** Cache only closed candles; live ticks may complete later missing intervals. */
function reconcileClosedPocketHistory(cached, incoming, ticks, periodSeconds, nowMs, limit = 128) {
	return appendCoveredFastCandles(mergePocketHistoryByTime(cached, incoming, limit).filter((candle) => (candle.time + periodSeconds) * 1e3 <= nowMs), ticks, periodSeconds, nowMs).slice(-limit);
}
//#endregion
//#region src/lib/pocket-market-cache.ts
function historyForPeriod(state, period) {
	return state?.historyByPeriod?.get(period) ?? (state?.historyPeriodSeconds === period ? state.history : []);
}
function storePeriodHistory(state, period, candles) {
	state.historyByPeriod ??= /* @__PURE__ */ new Map();
	if (state.historyPeriodSeconds !== null && !state.historyByPeriod.has(state.historyPeriodSeconds)) state.historyByPeriod.set(state.historyPeriodSeconds, state.history);
	state.historyByPeriod.set(period, candles);
	state.historyPeriodSeconds = period;
	state.history = candles;
}
function refreshPeriodHistories(state, nowMs, limit = 128) {
	if (state.historyPeriodSeconds !== null) {
		state.historyByPeriod ??= /* @__PURE__ */ new Map();
		if (!state.historyByPeriod.has(state.historyPeriodSeconds)) state.historyByPeriod.set(state.historyPeriodSeconds, state.history);
	}
	for (const [period, candles] of state.historyByPeriod ?? []) state.historyByPeriod.set(period, reconcileClosedPocketHistory(candles, [], state.ticks, period, nowMs, limit));
	if (state.historyPeriodSeconds !== null) state.history = historyForPeriod(state, state.historyPeriodSeconds);
}
[...[
	1,
	2,
	3,
	5,
	10,
	15,
	25,
	30,
	60,
	120,
	180,
	240
].map((minutes) => minutes * 60)];
//#endregion
//#region src/lib/async-keyed-queue.ts
function createKeyedAsyncQueue() {
	const queues = /* @__PURE__ */ new Map();
	return function run(key, operation, priority = 0) {
		return new Promise((resolve, reject) => {
			const turn = {
				priority,
				start: () => {
					Promise.resolve().then(operation).then(resolve, reject).finally(() => {
						const waiting = queues.get(key);
						if (waiting.length === 0) {
							queues.delete(key);
							return;
						}
						let next = 0;
						for (let i = 1; i < waiting.length; i++) if (waiting[i].priority > waiting[next].priority) next = i;
						waiting.splice(next, 1)[0].start();
					});
				}
			};
			const waiting = queues.get(key);
			if (waiting) waiting.push(turn);
			else {
				queues.set(key, []);
				turn.start();
			}
		});
	};
}
//#endregion
//#region src/lib/pocket-history-recovery.ts
function scheduleHistoryRecovery(options) {
	let stopped = false;
	let retryTimer;
	const deadlineTimer = setTimeout(() => {
		if (stopped) return;
		stop();
		options.expire();
	}, options.timeoutMs);
	function stop() {
		stopped = true;
		clearTimeout(deadlineTimer);
		clearTimeout(retryTimer);
	}
	if (options.retry) retryTimer = setTimeout(() => {
		if (stopped) return;
		try {
			options.retry?.();
		} catch (error) {
			stop();
			options.fail(error);
		}
	}, Math.min(2500, options.timeoutMs / 2));
	return {
		timer: deadlineTimer,
		stop
	};
}
//#endregion
//#region src/lib/signal-candidate-pool.ts
function createRotatingCandidateSelector(batchSize) {
	if (!Number.isInteger(batchSize) || batchSize < 1) throw new Error("Candidate batch size must be a positive integer.");
	let offset = 0;
	return (items) => {
		if (items.length === 0) return [];
		const size = Math.min(batchSize, items.length);
		const start = offset % items.length;
		offset = (start + size) % items.length;
		return Array.from({ length: size }, (_, index) => items[(start + index) % items.length]);
	};
}
//#endregion
//#region src/lib/pocket-feed-frame.ts
/** Socket.IO may send an event header followed by separate JSON attachments. */
function createPocketEventDecoder() {
	let pending = null;
	function replace(value, attachments) {
		if (Array.isArray(value)) return value.map((child) => replace(child, attachments));
		if (value && typeof value === "object") {
			const record = value;
			if (record._placeholder === true && Number.isInteger(record.num)) return attachments[record.num];
			return Object.fromEntries(Object.entries(record).map(([key, child]) => [key, replace(child, attachments)]));
		}
		return value;
	}
	return (message) => {
		const header = /^45([1-9]\d*)-(\[.*)$/s.exec(message);
		if (header) {
			pending = null;
			try {
				const packet = JSON.parse(header[2]);
				const count = Number(header[1]);
				if (Array.isArray(packet) && typeof packet[0] === "string" && count <= 16) pending = {
					packet,
					count,
					attachments: []
				};
			} catch {}
			return null;
		}
		if (message.startsWith("42")) {
			const event = parsePocketSocketIoEvent(message);
			if (event?.name === "successauth" || event?.name === "NotAuthorized") pending = null;
			return event;
		}
		if (!pending || !message.startsWith("[") && !message.startsWith("{")) return null;
		try {
			pending.attachments.push(JSON.parse(message));
			if (pending.attachments.length < pending.count) return null;
			const packet = replace(pending.packet, pending.attachments);
			pending = null;
			return {
				name: packet[0],
				payload: packet[1]
			};
		} catch {
			pending = null;
			return null;
		}
	};
}
function buildPocketAuthFrame(auth) {
	const frame = auth.trim();
	if (!frame.startsWith("42")) return null;
	try {
		const packet = JSON.parse(frame.slice(2));
		if (!Array.isArray(packet) || packet[0] !== "auth" || !packet[1] || typeof packet[1] !== "object" || Array.isArray(packet[1])) return null;
		return `42${JSON.stringify(["auth", {
			...packet[1],
			platform: 2,
			isFastHistory: true,
			isOptimized: true
		}])}`;
	} catch {
		return null;
	}
}
function pocketFeedUrlForAuth(auth) {
	const frame = auth.trim();
	if (!frame.startsWith("42")) return null;
	try {
		const packet = JSON.parse(frame.slice(2));
		if (!Array.isArray(packet) || packet[0] !== "auth" || !packet[1] || typeof packet[1] !== "object") return null;
		const isDemo = packet[1].isDemo;
		if (isDemo === true || isDemo === 1 || isDemo === "1") return "wss://demo-api-eu.po.market/socket.io/?EIO=4&transport=websocket";
		if (isDemo === false || isDemo === 0 || isDemo === "0") return "wss://api-eu.po.market/socket.io/?EIO=4&transport=websocket";
	} catch {
		return null;
	}
	return null;
}
function buildPocketSubscriptionFrames(symbol, periodSeconds) {
	return [
		`42${JSON.stringify(["subscribeSymbol", symbol])}`,
		`42${JSON.stringify(["changeSymbol", {
			asset: symbol,
			period: periodSeconds
		}])}`,
		`42${JSON.stringify(["subfor", symbol])}`
	];
}
function buildPocketQuoteSubscriptionFrames(symbol) {
	return [`42${JSON.stringify(["subscribeSymbol", symbol])}`, `42${JSON.stringify(["subfor", symbol])}`];
}
function parsePocketSocketIoEvent(message) {
	if (!message.startsWith("42")) return null;
	try {
		const packet = JSON.parse(message.slice(2));
		if (!Array.isArray(packet) || typeof packet[0] !== "string") return null;
		return {
			name: packet[0],
			payload: packet[1]
		};
	} catch {
		return null;
	}
}
function parsePocketHistoryResponse(message) {
	let payload;
	if (message.startsWith("42")) payload = parsePocketSocketIoEvent(message)?.payload;
	else if (message.startsWith("{")) try {
		payload = JSON.parse(message);
	} catch {
		return null;
	}
	else return null;
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
	const response = payload;
	if (typeof response.asset !== "string" || !response.asset || !Array.isArray(response.data)) return null;
	return {
		asset: response.asset,
		data: response.data,
		...typeof response.index === "number" && Number.isFinite(response.index) ? { index: response.index } : {},
		...typeof response.period === "number" && Number.isFinite(response.period) ? { periodSeconds: response.period } : {}
	};
}
function pocketHistoryMatchesRequest(response, request) {
	return response.asset === request.asset && (response.index === void 0 || response.index === request.index) && (response.periodSeconds === void 0 || response.periodSeconds === request.periodSeconds);
}
function findPocketRows(value, isRow, depth = 0) {
	if (depth > 6) return null;
	if (Array.isArray(value)) {
		if (isRow(value)) return [value];
		const rows = value.filter(Array.isArray);
		if (rows.some(isRow)) return rows;
		for (const child of value) {
			const found = findPocketRows(child, isRow, depth + 1);
			if (found) return found;
		}
	} else if (value && typeof value === "object") for (const child of Object.values(value)) {
		const found = findPocketRows(child, isRow, depth + 1);
		if (found) return found;
	}
	return null;
}
function buildPocketHistoryRequest(asset, periodSeconds, requestTime, index, historyWindow) {
	return {
		asset,
		index,
		offset: historyWindow,
		period: periodSeconds,
		time: requestTime
	};
}
function parsePocketFastHistory(payload) {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
	const record = payload;
	if (typeof record.asset !== "string" || !record.asset) return null;
	const period = Number(record.period);
	const rows = findPocketRows(record.history, (row) => row.length >= 2 && Number.isFinite(Number(row[0])) && Number.isFinite(Number(row[1])));
	if (!rows) return null;
	const ticks = rows.flatMap((row) => {
		const time = Number(row[0]);
		const price = Number(row[1]);
		return Number.isFinite(time) && time > 0 && price > 0 ? [{
			time,
			price
		}] : [];
	});
	if (ticks.length === 0) return null;
	return {
		asset: record.asset,
		periodSeconds: Number.isInteger(period) && period > 0 ? period : null,
		ticks
	};
}
function parsePocketFastCandleHistory(payload) {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
	const record = payload;
	const periodSeconds = Number(record.period);
	if (typeof record.asset !== "string" || !record.asset || !Number.isInteger(periodSeconds) || periodSeconds <= 0 || !Array.isArray(record.candles)) return null;
	const history = parsePocketFastCandles(record.candles);
	return history.candles.length > 0 ? {
		asset: record.asset,
		periodSeconds,
		history
	} : null;
}
//#endregion
//#region src/lib/pocket-server-time.ts
var MAX_SERVER_CLOCK_OFFSET_SECONDS = 50400;
function estimatePocketServerClockOffsetSeconds(rawServerTime, receivedAtMs) {
	if (!Number.isFinite(rawServerTime) || rawServerTime <= 0 || !Number.isFinite(receivedAtMs)) return null;
	const offsetSeconds = (rawServerTime >= 0xe8d4a51000 ? rawServerTime / 1e3 : rawServerTime) - receivedAtMs / 1e3;
	if (Math.abs(offsetSeconds) > MAX_SERVER_CLOCK_OFFSET_SECONDS) return null;
	return Math.round(offsetSeconds);
}
function pocketHistoryRequestTime(nowMs, serverClockOffsetSeconds, periodSeconds) {
	if (!Number.isFinite(nowMs) || !Number.isFinite(serverClockOffsetSeconds) || !Number.isInteger(periodSeconds) || periodSeconds <= 0) throw new Error("Некорректное время для запроса истории Pocket Option.");
	const serverTimeSeconds = nowMs / 1e3 + serverClockOffsetSeconds;
	return Math.floor(serverTimeSeconds / periodSeconds) * periodSeconds;
}
function pocketHistoryCandleLocalTime(serverTimeSeconds, serverClockOffsetSeconds) {
	if (!Number.isFinite(serverTimeSeconds) || !Number.isFinite(serverClockOffsetSeconds)) throw new Error("Некорректное время свечи Pocket Option.");
	return serverTimeSeconds - serverClockOffsetSeconds;
}
//#endregion
//#region src/lib/pocket-live.server.ts
var FEED_AUTH = (process.env.POCKET_OPTION_FEED_AUTH ?? "").trim();
var FEED_DISABLED = externalApisDisabled() || process.env.POCKET_OPTION_FEED_DISABLED?.trim().toLowerCase() === "true";
var FEED_DISABLED_MESSAGE = "Поток Pocket Option временно отключён.";
var AUTH_MISSING_MESSAGE = "Не настроена свежая авторизация Pocket Option. Добавьте её в Replit Secrets как POCKET_OPTION_FEED_AUTH.";
var AUTH_REJECTED_MESSAGE = "Pocket Option отклонил авторизацию. Проверьте актуальность секрета POCKET_OPTION_FEED_AUTH.";
var HISTORY_PAGE_CANDLES = 128;
var SIGNAL_CANDIDATES_PER_SEARCH = 1;
var MAX_ELIGIBLE_PAIRS = 8;
var WARM_HISTORY_REFRESH_MS = 3e4;
var ELIGIBLE_PAYOUTS = /* @__PURE__ */ new Set([80, 92]);
var BROKER_QUEUE_KEY = "single-pocket-option-connection";
var FEED_IDLE_TIMEOUT_MS = 9e4;
var pocketGlobal = globalThis;
var pocketSharedRuntime = pocketGlobal.__primePocketSharedRuntime ??= {
	pairMarketData: /* @__PURE__ */ new Map(),
	clockOffsetSeconds: null
};
var pocketBrokerRuntime = pocketGlobal;
pocketBrokerRuntime.__primePocketDispose?.();
var runBrokerCommand = pocketBrokerRuntime.__primePocketBrokerPriorityQueue ??= createKeyedAsyncQueue();
var pendingHistory = pocketBrokerRuntime.__primePocketPendingHistory ??= /* @__PURE__ */ new Map();
var pairs = /* @__PURE__ */ new Map();
var pairMarketData = pocketSharedRuntime.pairMarketData;
var socket = null;
var ready = null;
var cancelReady = null;
var disposed = false;
var isAuthorized = false;
var connectionError = "";
var retryAfter = 0;
var expectAssets = false;
var expectBalance = false;
var lastPocketMessageAt = 0;
var lastHistoryRequestIndex = 0;
var lastWarmHistoryAttempt = /* @__PURE__ */ new Map();
createRotatingCandidateSelector(SIGNAL_CANDIDATES_PER_SEARCH);
createRotatingCandidateSelector(MAX_ELIGIBLE_PAIRS);
var expectStream = false;
var decodePocketEvent = createPocketEventDecoder();
var earlyFastHistory = /* @__PURE__ */ new Map();
var lastStreamDiagnosticAt = 0;
var feedWarmupStarted = false;
var lastFeedActivityAt = 0;
var feedIdleTimer = null;
function latestPairTick(symbol) {
	return (pairMarketData.get(symbol)?.ticks)?.at(-1) ?? null;
}
function latestPairQuote(symbol) {
	const tick = latestPairTick(symbol);
	return tick ? {
		price: tick.price,
		at: tick.time
	} : null;
}
function logStreamDiagnostic(level, details) {
	const now = Date.now();
	if (now - lastStreamDiagnosticAt < 15e3) return;
	lastStreamDiagnosticAt = now;
	const entry = JSON.stringify(details);
	if (level === "warn") console.warn("[pocket-feed-stream]", entry);
	else console.info("[pocket-feed-stream]", entry);
}
function textOf(data) {
	if (typeof data === "string") return data;
	if (Buffer.isBuffer(data)) return data.toString("utf8");
	if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
	return Buffer.concat(data).toString("utf8");
}
function groupOf(type) {
	if (type === "currency") return "fx";
	if (type === "cryptocurrency") return "crypto";
	if (type === "stock") return "stock";
	if (type === "commodity") return "commodity";
	return null;
}
function cleanName(name) {
	return `${name.replace(/\s*OTC\s*/gi, " ").replace(/\s+/g, " ").trim()} OTC`;
}
function readNumber(source, key) {
	const match = source.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
	return match ? Number(match[1]) : null;
}
function storeAssets(rows) {
	const next = /* @__PURE__ */ new Map();
	for (const row of rows) {
		if (!Array.isArray(row) || row.length < 15 || row[14] !== true || row[9] !== 1) continue;
		if (!String(row[1]).toLowerCase().includes("otc")) continue;
		const group = groupOf(String(row[3]));
		const payout = Number(row[5]);
		if (group !== "fx" || !Number.isFinite(payout)) continue;
		const symbol = String(row[1]);
		next.set(symbol, {
			symbol,
			name: cleanName(String(row[2] || symbol)),
			payout,
			group
		});
	}
	if (next.size > 0) {
		pairs.clear();
		for (const [symbol, pair] of next) pairs.set(symbol, pair);
		connectionError = "";
	}
}
function settleLatestHistoryFromCache(symbol, rejectedRows = 0) {
	const request = pendingHistory.get(symbol);
	const state = pairMarketData.get(symbol);
	if (!request?.latestWanted || !state) return false;
	const history = historyForPeriod(state, request.periodSeconds);
	if (closedHistory(history, request.periodSeconds).length < 30 || !historyIsFresh(history, request.periodSeconds)) return false;
	clearTimeout(request.timer);
	pendingHistory.delete(symbol);
	request.resolve({
		candles: [...history],
		rejectedRows
	});
	return true;
}
function rememberTickRows(rows, frameFormat) {
	if (!Array.isArray(rows)) return;
	const receivedAtMs = Date.now();
	let quoteRows = 0;
	let epochLikeTimestamps = 0;
	for (const row of rows) {
		if (!Array.isArray(row) || row.length < 3 || typeof row[0] !== "string") continue;
		const rawTimestamp = Number(row[1]);
		const serverTimeMs = rawTimestamp >= 0xe8d4a51000 ? rawTimestamp : rawTimestamp * 1e3;
		if (Number.isFinite(rawTimestamp) && Math.abs(rawTimestamp) >= 1e9) epochLikeTimestamps += 1;
		const offsetSeconds = estimatePocketServerClockOffsetSeconds(rawTimestamp, receivedAtMs);
		if (offsetSeconds !== null && pocketSharedRuntime.clockOffsetSeconds === null) {
			pocketSharedRuntime.clockOffsetSeconds = offsetSeconds;
			console.info("[pocket-feed-clock-synced]", JSON.stringify({
				offsetSeconds,
				source: "updateStream"
			}));
		}
		const price = Number(row[2]);
		const clockOffsetSeconds = pocketSharedRuntime.clockOffsetSeconds ?? offsetSeconds;
		if (!Number.isFinite(rawTimestamp) || rawTimestamp <= 0 || !Number.isFinite(price) || price <= 0 || clockOffsetSeconds === null) continue;
		const symbol = String(row[0]);
		const tickTime = Math.min(receivedAtMs, serverTimeMs - clockOffsetSeconds * 1e3);
		const state = pairMarketData.get(symbol) ?? {
			ticks: [],
			history: [],
			historyPeriodSeconds: null
		};
		state.ticks.push({
			price,
			time: tickTime
		});
		state.ticks.sort((left, right) => left.time - right.time);
		if (state.ticks.length > 2e3) state.ticks.splice(0, state.ticks.length - 2e3);
		refreshPeriodHistories(state, receivedAtMs, 128);
		pairMarketData.set(symbol, state);
		settleLatestHistoryFromCache(symbol);
		quoteRows += 1;
	}
	logStreamDiagnostic("info", {
		frameFormat,
		receivedRows: rows.length,
		quoteRows,
		epochLikeTimestamps,
		clockSynced: pocketSharedRuntime.clockOffsetSeconds !== null
	});
	if (pocketSharedRuntime.clockOffsetSeconds !== null && earlyFastHistory.size > 0) {
		const updates = [...earlyFastHistory.values()];
		earlyFastHistory.clear();
		for (const update of updates) rememberFastHistory(update);
	}
}
function rememberFastHistory(payload) {
	const update = parsePocketFastHistory(payload);
	const candleUpdate = parsePocketFastCandleHistory(payload);
	if (!update && !candleUpdate) {
		const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
		const history = record?.history;
		console.warn("[pocket-fast-history-unusable]", JSON.stringify({
			payloadType: Array.isArray(payload) ? "array" : typeof payload,
			keys: record ? Object.keys(record).slice(0, 12) : [],
			assetType: typeof record?.asset,
			periodType: typeof record?.period,
			historyType: Array.isArray(history) ? "array" : typeof history,
			historyLength: Array.isArray(history) ? history.length : null,
			firstRowLength: Array.isArray(history) && Array.isArray(history[0]) ? history[0].length : null
		}));
		return;
	}
	const receivedAtMs = Date.now();
	const asset = candleUpdate?.asset ?? update.asset;
	const periodSeconds = candleUpdate?.periodSeconds ?? update.periodSeconds;
	const clockOffsetSeconds = pocketSharedRuntime.clockOffsetSeconds;
	if (clockOffsetSeconds === null) {
		earlyFastHistory.set(asset, payload);
		console.warn("[pocket-fast-history-unusable]", JSON.stringify({
			symbol: asset,
			reason: "clock-not-synced",
			tickCount: update?.ticks.length ?? 0
		}));
		return;
	}
	const ticks = [];
	for (const tick of update?.ticks ?? []) {
		const rawTime = tick.time >= 0xe8d4a51000 ? tick.time / 1e3 : tick.time;
		ticks.push({
			time: (rawTime - clockOffsetSeconds) * 1e3,
			price: tick.price
		});
	}
	const state = pairMarketData.get(asset) ?? {
		ticks: [],
		history: [],
		historyPeriodSeconds: null
	};
	const byTime = new Map(state.ticks.map((tick) => [tick.time, tick]));
	for (const tick of ticks) byTime.set(tick.time, tick);
	state.ticks = [...byTime.values()].sort((left, right) => left.time - right.time).slice(-2e3);
	if (candleUpdate) {
		const candles = candleUpdate.history.candles.map((candle) => ({
			...candle,
			time: pocketHistoryCandleLocalTime(candle.time, clockOffsetSeconds)
		}));
		const history = reconcileClosedPocketHistory(historyForPeriod(state, candleUpdate.periodSeconds), candles, state.ticks, candleUpdate.periodSeconds, receivedAtMs, 128);
		storePeriodHistory(state, candleUpdate.periodSeconds, history);
	}
	refreshPeriodHistories(state, receivedAtMs, 128);
	pairMarketData.set(asset, state);
	settleLatestHistoryFromCache(asset, candleUpdate?.history.rejectedRows ?? 0);
	console.info("[pocket-fast-history]", JSON.stringify({
		symbol: asset,
		periodSeconds,
		validCandles: candleUpdate?.history.candles.length ?? 0,
		rejectedCandleRows: candleUpdate?.history.rejectedRows ?? 0,
		tickCount: ticks.length,
		oldestTickTime: ticks.length ? Math.floor(Math.min(...ticks.map((tick) => tick.time)) / 1e3) : null,
		newestTickAgeMs: ticks.length ? Math.max(0, Date.now() - Math.max(...ticks.map((tick) => tick.time))) : null
	}));
}
function rememberTicks(message, frameFormat = "split-array") {
	try {
		const parsed = JSON.parse(message);
		const rows = findPocketRows(parsed, (row) => typeof row[0] === "string" && row.length >= 3);
		if (rows) rememberTickRows(rows, frameFormat);
		else logStreamDiagnostic("warn", {
			frameFormat,
			payloadType: Array.isArray(parsed) ? "array" : typeof parsed,
			topLevelLength: Array.isArray(parsed) ? parsed.length : null,
			clockSynced: pocketSharedRuntime.clockOffsetSeconds !== null
		});
	} catch {
		logStreamDiagnostic("warn", {
			frameFormat,
			payloadType: "invalid-json"
		});
	}
}
var subscribedAt = /* @__PURE__ */ new Map();
function sendPocketSubscription(target, symbol, periodSeconds) {
	for (const frame of buildPocketSubscriptionFrames(symbol, periodSeconds)) target.send(frame);
	console.info("[pocket-feed-subscribe]", JSON.stringify({
		symbol,
		periodSeconds,
		socketReadyState: target.readyState
	}));
}
function subscribe(symbol, periodSeconds = 1) {
	const now = Date.now();
	const key = `${symbol}:${periodSeconds}`;
	if (now - (subscribedAt.get(key) ?? 0) < 3e4) return;
	if (!socket || socket.readyState !== wrapper_default.OPEN) return;
	subscribedAt.set(key, now);
	try {
		for (const frame of buildPocketQuoteSubscriptionFrames(symbol)) socket.send(frame);
	} catch {
		subscribedAt.delete(key);
	}
}
function failPending(error) {
	for (const request of pendingHistory.values()) {
		clearTimeout(request.timer);
		request.reject(error);
	}
	pendingHistory.clear();
}
function handleMessage(current, message) {
	lastPocketMessageAt = Date.now();
	if (message.startsWith("0") && message.includes("sid")) {
		current.send("40");
		return;
	}
	if (message === "2") {
		current.send("3");
		return;
	}
	if (message.startsWith("40") && message.includes("sid")) {
		const authFrame = buildPocketAuthFrame(FEED_AUTH);
		if (!authFrame) {
			connectionError = "Неверный формат авторизации Pocket Option.";
			console.error("[pocket-feed-auth-format-invalid]");
			current.close();
			return;
		}
		current.send(authFrame);
		return;
	}
	const socketEvent = decodePocketEvent(message);
	if (socketEvent?.name === "NotAuthorized" || message.includes("NotAuthorized")) {
		isAuthorized = false;
		connectionError = AUTH_REJECTED_MESSAGE;
		console.warn("[pocket-feed-auth-rejected]", JSON.stringify({ socketReadyState: current.readyState }));
		failPending(new Error(connectionError));
		try {
			current.close();
		} catch {}
		return;
	}
	if (socketEvent?.name === "successauth") {
		isAuthorized = true;
		connectionError = "";
		console.info("[pocket-feed-authenticated]", JSON.stringify({
			socketReadyState: current.readyState,
			activePairs: pairs.size
		}));
		return;
	}
	if (socketEvent?.name === "updateAssets") {
		const rows = findPocketRows(socketEvent.payload, (row) => row.length >= 15 && row[14] === true && row[9] === 1);
		if (rows) {
			expectAssets = false;
			storeAssets(rows);
			console.info("[pocket-feed-assets]", JSON.stringify({
				receivedRows: rows.length,
				activePairs: pairs.size,
				socketReadyState: current.readyState,
				frameFormat: "socket.io-inline"
			}));
		} else expectAssets = true;
		return;
	}
	if (socketEvent?.name === "updateStream") {
		const rows = findPocketRows(socketEvent.payload, (row) => typeof row[0] === "string" && row.length >= 3);
		if (rows) {
			expectStream = false;
			rememberTickRows(rows, "socket.io-inline");
		} else {
			expectStream = true;
			logStreamDiagnostic("warn", {
				payloadType: Array.isArray(socketEvent.payload) ? "array" : typeof socketEvent.payload,
				topLevelLength: Array.isArray(socketEvent.payload) ? socketEvent.payload.length : null,
				frameFormat: "socket.io-inline",
				clockSynced: pocketSharedRuntime.clockOffsetSeconds !== null
			});
		}
		return;
	}
	if (socketEvent?.name === "updateHistoryNewFast") {
		rememberFastHistory(socketEvent.payload);
		return;
	}
	const historyResponse = parsePocketHistoryResponse(message);
	if (historyResponse) {
		const request = pendingHistory.get(historyResponse.asset);
		if (request && pocketHistoryMatchesRequest(historyResponse, request)) {
			request.receivedHistory = true;
			const serverClockOffsetSeconds = pocketSharedRuntime.clockOffsetSeconds;
			if (serverClockOffsetSeconds === null) {
				request.reject(/* @__PURE__ */ new Error("Время потока Pocket Option не синхронизировано."));
				return;
			}
			const parsedHistory = parsePocketOptionHistory(historyResponse.data);
			const history = {
				...parsedHistory,
				candles: parsedHistory.candles.map((candle) => ({
					...candle,
					time: pocketHistoryCandleLocalTime(candle.time, serverClockOffsetSeconds)
				}))
			};
			const state = pairMarketData.get(historyResponse.asset) ?? {
				ticks: [],
				history: [],
				historyPeriodSeconds: null
			};
			history.candles = reconcileClosedPocketHistory(historyForPeriod(state, request.periodSeconds), history.candles, state.ticks, request.periodSeconds, Date.now(), 128);
			storePeriodHistory(state, request.periodSeconds, history.candles);
			pairMarketData.set(historyResponse.asset, state);
			console.info("[pocket-history-response]", JSON.stringify({
				symbol: historyResponse.asset,
				periodSeconds: request.periodSeconds,
				receivedRows: historyResponse.data.length,
				validCandles: history.candles.length,
				rejectedRows: history.rejectedRows,
				latestClosedAgeSeconds: history.candles.filter((candle) => candle.time + request.periodSeconds <= Date.now() / 1e3).at(-1) ? Math.round(Date.now() / 1e3 - (history.candles.filter((candle) => candle.time + request.periodSeconds <= Date.now() / 1e3).at(-1).time + request.periodSeconds)) : null,
				candleTimestampBasis: "open",
				frameFormat: message.startsWith("42") ? "socket.io-inline" : "plain-json"
			}));
			if (!request.latestWanted || closedHistory(history.candles, request.periodSeconds).length >= 30 && historyIsFresh(history.candles, request.periodSeconds)) {
				clearTimeout(request.timer);
				pendingHistory.delete(historyResponse.asset);
				request.resolve(history);
			}
		}
		return;
	}
	if (message.includes("updateAssets")) {
		expectAssets = true;
		return;
	}
	if (expectAssets && message.startsWith("[")) {
		expectAssets = false;
		try {
			const rows = JSON.parse(message);
			storeAssets(rows);
			console.info("[pocket-feed-assets]", JSON.stringify({
				receivedRows: rows.length,
				activePairs: pairs.size,
				socketReadyState: current.readyState
			}));
		} catch {
			console.warn("[pocket-feed-assets-parse-failed]", JSON.stringify({
				socketReadyState: current.readyState,
				frameLength: message.length
			}));
		}
		return;
	}
	if (message.includes("updateStream")) {
		expectStream = true;
		return;
	}
	if (expectStream && message.startsWith("[")) {
		expectStream = false;
		rememberTicks(message);
		return;
	}
	if (message.includes("successupdateBalance")) expectBalance = true;
	if (!expectBalance || message.length > 400) return;
	if (readNumber(message, "balance") === null) return;
	expectBalance = false;
}
function connect() {
	if (disposed) throw new Error("Поток Pocket Option перезапускается после обновления сервера.");
	if (FEED_DISABLED) {
		connectionError = FEED_DISABLED_MESSAGE;
		return;
	}
	if (!FEED_AUTH.trim()) {
		connectionError = AUTH_MISSING_MESSAGE;
		console.error("[pocket-feed-auth-missing]");
		throw new Error(connectionError);
	}
	const feedUrl = pocketFeedUrlForAuth(FEED_AUTH);
	if (!feedUrl) {
		connectionError = "Неверный формат авторизации Pocket Option: нужен полный кадр 42[\"auth\",…] с полем isDemo.";
		console.error("[pocket-feed-auth-format-invalid]");
		throw new Error(connectionError);
	}
	if (socket && (socket.readyState === wrapper_default.OPEN || socket.readyState === 0)) return;
	if (socket) {
		const old = socket;
		socket = null;
		old.on("error", () => {});
		try {
			old.terminate();
		} catch {}
	}
	connectionError = "";
	isAuthorized = false;
	pocketSharedRuntime.clockOffsetSeconds = null;
	subscribedAt.clear();
	pairs.clear();
	pairMarketData.clear();
	expectAssets = false;
	expectStream = false;
	expectBalance = false;
	decodePocketEvent = createPocketEventDecoder();
	earlyFastHistory.clear();
	console.info("[pocket-feed-region-selected]", JSON.stringify({
		account: feedUrl.includes("demo-api-") ? "demo" : "real",
		region: "eu"
	}));
	const next = new wrapper_default(feedUrl, {
		agent: pocketProxyAgent(feedUrl),
		headers: {
			Origin: "https://pocketoption.com",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0"
		},
		handshakeTimeout: 8e3
	});
	next.on("error", (error) => {
		if (socket !== next) return;
		console.error("[pocket-feed-error]", JSON.stringify({
			errorName: error.name,
			errorCode: error.code ?? null,
			socketReadyState: next.readyState
		}));
		socket = null;
		isAuthorized = false;
		retryAfter = Date.now() + 2e3;
		connectionError = "Не удалось подключиться к потоку Pocket Option. Повторяем подключение.";
		failPending(new Error(connectionError));
	});
	socket = next;
	next.on("message", (data) => {
		if (socket === next) handleMessage(next, textOf(data));
	});
	next.on("close", (code, reason) => {
		if (socket !== next) return;
		console.warn("[pocket-feed-closed]", JSON.stringify({
			socketReadyState: next.readyState,
			closeCode: code,
			closeReasonLength: reason.length
		}));
		socket = null;
		isAuthorized = false;
		retryAfter = Date.now() + 2e3;
		if (!connectionError) connectionError = "Соединение с Pocket Option прервано. Повторяем подключение.";
		failPending(new Error(connectionError));
	});
}
async function ensureFeed() {
	try {
		await ensureFeedConnection();
	} catch (error) {
		throw new SignalDataError(error instanceof Error ? error.message : "Поток Pocket Option недоступен.", "feed");
	}
}
function ensureFeedConnection() {
	if (disposed) return Promise.reject(/* @__PURE__ */ new Error("Поток Pocket Option остановлен."));
	if (FEED_DISABLED) return Promise.reject(/* @__PURE__ */ new Error(FEED_DISABLED_MESSAGE));
	if (isAuthorized && pairs.size > 0 && socket && socket.readyState === wrapper_default.OPEN) return Promise.resolve();
	if (ready) return ready;
	connect();
	ready = new Promise((resolve, reject) => {
		const started = Date.now();
		const timer = setInterval(() => {
			if (isAuthorized && pairs.size > 0 && socket && socket.readyState === wrapper_default.OPEN) {
				clearInterval(timer);
				ready = null;
				cancelReady = null;
				resolve();
				return;
			}
			if ((!socket || socket.readyState === 3) && Date.now() >= retryAfter) try {
				connect();
			} catch (error) {
				clearInterval(timer);
				ready = null;
				cancelReady = null;
				reject(error);
				return;
			}
			if (Date.now() - started > 12e3) {
				clearInterval(timer);
				ready = null;
				cancelReady = null;
				if (!connectionError) connectionError = "Котировки Pocket Option не получены за 12 секунд.";
				reject(new Error(connectionError));
			}
		}, 200);
		cancelReady = () => {
			clearInterval(timer);
			ready = null;
			cancelReady = null;
			reject(/* @__PURE__ */ new Error("Поток Pocket Option перезапускается."));
		};
	});
	return ready;
}
function startPocketFeed() {
	if (FEED_DISABLED) return;
	lastFeedActivityAt = Date.now();
	if (feedIdleTimer) clearTimeout(feedIdleTimer);
	feedIdleTimer = setTimeout(() => {
		feedIdleTimer = null;
		const idleForMs = Date.now() - lastFeedActivityAt;
		if (idleForMs < FEED_IDLE_TIMEOUT_MS) {
			startPocketFeedIdleTimer();
			return;
		}
		stopPocketFeedAfterIdle(idleForMs);
	}, FEED_IDLE_TIMEOUT_MS);
	if (feedWarmupStarted) return;
	feedWarmupStarted = true;
	(async () => {
		while (feedWarmupStarted) {
			try {
				await ensureFeed();
				const candidates = eligibleSignalPairs();
				for (const pair of candidates) {
					if (!feedWarmupStarted) return;
					subscribe(pair.symbol, 1);
					const quote = latestPairQuote(pair.symbol);
					if (!quote || Date.now() - quote.at > 2e3) continue;
					const cachedHistory = historyForPeriod(pairMarketData.get(pair.symbol), 60);
					const historyNeedsWarm = !historyIsFresh(cachedHistory, 60) || closedHistory(cachedHistory, 60).length < 30;
					const lastAttempt = lastWarmHistoryAttempt.get(pair.symbol) ?? 0;
					if (historyNeedsWarm && Date.now() - lastAttempt >= WARM_HISTORY_REFRESH_MS) {
						lastWarmHistoryAttempt.set(pair.symbol, Date.now());
						try {
							await loadCandles(pair.symbol, 60, 4500, 1, -1);
						} catch (error) {
							console.warn("[pocket-history-warmup-failed]", JSON.stringify({
								symbol: pair.symbol,
								errorName: error instanceof Error ? error.name : typeof error
							}));
						}
					}
				}
			} catch (error) {
				console.warn("[pocket-feed-warmup]", JSON.stringify({
					errorName: error instanceof Error ? error.name : typeof error,
					activePairs: pairs.size,
					socketReadyState: socket?.readyState ?? null
				}));
			}
			await new Promise((resolve) => setTimeout(resolve, 3e3));
		}
	})();
}
function startPocketFeedIdleTimer() {
	if (feedIdleTimer) clearTimeout(feedIdleTimer);
	feedIdleTimer = setTimeout(() => {
		feedIdleTimer = null;
		const idleForMs = Date.now() - lastFeedActivityAt;
		if (idleForMs < FEED_IDLE_TIMEOUT_MS) {
			startPocketFeedIdleTimer();
			return;
		}
		stopPocketFeedAfterIdle(idleForMs);
	}, FEED_IDLE_TIMEOUT_MS);
}
function stopPocketFeedAfterIdle(idleForMs) {
	feedWarmupStarted = false;
	cancelReady?.();
	failPending(/* @__PURE__ */ new Error("Поток Pocket Option остановлен после простоя."));
	const oldSocket = socket;
	socket = null;
	isAuthorized = false;
	expectAssets = false;
	expectStream = false;
	expectBalance = false;
	pairs.clear();
	subscribedAt.clear();
	oldSocket?.terminate();
	console.info("[pocket-feed-idle-stop]", JSON.stringify({ idleForMs }));
}
pocketBrokerRuntime.__primePocketDispose = () => {
	disposed = true;
	feedWarmupStarted = false;
	if (feedIdleTimer) clearTimeout(feedIdleTimer);
	feedIdleTimer = null;
	cancelReady?.();
	const oldSocket = socket;
	socket = null;
	isAuthorized = false;
	failPending(/* @__PURE__ */ new Error("Поток Pocket Option перезапускается."));
	oldSocket?.terminate();
};
function eligibleSignalPairs() {
	return [...pairs.values()].filter((pair) => pair.group === "fx" && pair.symbol.toLowerCase().includes("otc") && ELIGIBLE_PAYOUTS.has(pair.payout)).sort((a, b) => b.payout - a.payout || a.name.localeCompare(b.name)).slice(0, MAX_ELIGIBLE_PAIRS);
}
async function loadHistoryPage(symbol, seconds, time, timeoutMs = 4500, priority = 0) {
	return runBrokerCommand(BROKER_QUEUE_KEY, async () => {
		await ensureFeed();
		if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
		const cached = historyForPeriod(pairMarketData.get(symbol), seconds);
		if (Math.abs(Date.now() / 1e3 - time) <= seconds * 2 && closedHistory(cached, seconds).length >= 30 && historyIsFresh(cached, seconds)) return {
			candles: [...cached],
			rejectedRows: 0
		};
		if (!socket || socket.readyState !== wrapper_default.OPEN) throw new Error("Котировки сейчас недоступны.");
		const clockDeadline = Date.now() + Math.min(timeoutMs, 4500);
		while (pocketSharedRuntime.clockOffsetSeconds === null && Date.now() < clockDeadline) await new Promise((resolve) => setTimeout(resolve, 100));
		const clockOffsetSeconds = pocketSharedRuntime.clockOffsetSeconds;
		if (clockOffsetSeconds === null) {
			console.warn("[pocket-history-clock-unsynced]", JSON.stringify({
				symbol,
				periodSeconds: seconds,
				socketReadyState: socket?.readyState ?? null,
				pairAvailable: pairs.has(symbol)
			}));
			throw new Error("Время потока Pocket Option не синхронизировано; история не запрашивалась.");
		}
		const current = socket;
		if (!current || current.readyState !== wrapper_default.OPEN) throw new Error("Соединение с Pocket Option прервалось перед запросом истории.");
		return new Promise((resolve, reject) => {
			let request;
			const requestTime = pocketHistoryRequestTime(time * 1e3, clockOffsetSeconds, seconds);
			const requestIndex = Math.max(lastHistoryRequestIndex + 1, Math.floor(Date.now() / 10));
			lastHistoryRequestIndex = requestIndex;
			const sendHistory = () => {
				if (socket !== current || current.readyState !== wrapper_default.OPEN) throw new Error("Соединение с Pocket Option прервалось во время загрузки истории.");
				sendPocketSubscription(current, symbol, seconds);
				current.send("42" + JSON.stringify(["loadHistoryPeriod", buildPocketHistoryRequest(symbol, seconds, requestTime, requestIndex, seconds * HISTORY_PAGE_CANDLES)]));
			};
			const recovery = scheduleHistoryRecovery({
				timeoutMs,
				retry: priority < 0 ? null : () => {
					if (settleLatestHistoryFromCache(symbol)) return;
					console.info("[pocket-history-retry]", JSON.stringify({
						symbol,
						periodSeconds: seconds,
						requestIndex
					}));
					sendHistory();
				},
				fail: (error) => {
					if (pendingHistory.get(symbol) === request) pendingHistory.delete(symbol);
					reject(error);
				},
				expire: () => {
					if (settleLatestHistoryFromCache(symbol)) return;
					if (pendingHistory.get(symbol) === request) pendingHistory.delete(symbol);
					console.warn("[pocket-history-timeout]", JSON.stringify({
						symbol,
						periodSeconds: seconds,
						requestTime,
						serverClockOffsetSeconds: clockOffsetSeconds,
						timeBasis: "local-plus-feed-offset",
						timeoutMs,
						socketReadyState: socket?.readyState ?? null,
						pairAvailable: pairs.has(symbol),
						connectionError: connectionError || null,
						lastPocketMessageAgeMs: lastPocketMessageAt ? Date.now() - lastPocketMessageAt : null
					}));
					reject(/* @__PURE__ */ new Error(request.receivedHistory ? "Pocket Option прислал только устаревшую или неполную историю. Свежие свечи пока недоступны." : `История свечей не пришла за ${Math.ceil(timeoutMs / 1e3)} секунд. Попробуйте ещё раз.`));
				}
			});
			request = {
				asset: symbol,
				index: requestIndex,
				periodSeconds: seconds,
				latestWanted: Math.abs(Date.now() / 1e3 - time) <= seconds * 2,
				resolve: (history) => {
					recovery.stop();
					resolve(history);
				},
				reject: (error) => {
					recovery.stop();
					reject(error);
				},
				timer: recovery.timer
			};
			pendingHistory.set(symbol, request);
			try {
				console.info("[pocket-history-request]", JSON.stringify({
					symbol,
					periodSeconds: seconds,
					requestTime,
					serverClockOffsetSeconds: clockOffsetSeconds,
					timeBasis: "local-plus-feed-offset",
					socketReadyState: current.readyState
				}));
				sendHistory();
			} catch {
				recovery.stop();
				if (pendingHistory.get(symbol) === request) pendingHistory.delete(symbol);
				reject(/* @__PURE__ */ new Error("Не удалось запросить историю свечей Pocket Option."));
			}
		});
	}, priority);
}
var historyLoads = /* @__PURE__ */ new Map();
function loadCandles(symbol, seconds, pageTimeoutMs = 4500, pageLimit, priority = 0) {
	const key = `${symbol}:${seconds}:${pageLimit ?? "all"}:${priority}`;
	const existing = historyLoads.get(key);
	if (existing) return existing;
	const task = loadCandlesUnshared(symbol, seconds, pageTimeoutMs, pageLimit, priority).finally(() => {
		if (historyLoads.get(key) === task) historyLoads.delete(key);
	});
	historyLoads.set(key, task);
	return task;
}
async function loadCandlesUnshared(symbol, seconds, pageTimeoutMs = 4500, pageLimit, priority = 0) {
	await ensureFeed();
	const collected = /* @__PURE__ */ new Map();
	let rejectedRows = 0;
	let cursor = Math.floor(Date.now() / 1e3);
	const maxPages = pageLimit ?? Math.ceil(128 / HISTORY_PAGE_CANDLES);
	for (let page = 0; page < maxPages && collected.size < 128; page += 1) {
		const history = await loadHistoryPage(symbol, seconds, cursor, pageTimeoutMs, priority);
		rejectedRows += history.rejectedRows;
		const candles = history.candles;
		if (candles.length === 0) break;
		const previousSize = collected.size;
		for (const candle of candles) collected.set(candle.time, candle);
		const oldestTime = candles[0].time;
		if (collected.size === previousSize || oldestTime <= 0 || oldestTime >= cursor) break;
		cursor = oldestTime - 1;
	}
	let candles = [...collected.values()].sort((a, b) => a.time - b.time).slice(-128);
	const state = pairMarketData.get(symbol) ?? {
		ticks: [],
		history: [],
		historyPeriodSeconds: null
	};
	candles = mergePocketHistoryByTime(historyForPeriod(state, seconds), closedHistory(candles, seconds), 128);
	const beforeRealtime = candles.at(-1)?.time ?? null;
	candles = appendCoveredFastCandles(candles, state.ticks, seconds, Date.now(), void 0, (coverage) => console.info("[pocket-fast-history-coverage]", JSON.stringify({
		symbol,
		periodSeconds: seconds,
		...coverage
	})));
	const latest = candles.at(-1)?.time ?? null;
	const now = Date.now();
	const tickTimes = state.ticks.map((tick) => tick.time);
	const latestClosedTime = latest === null ? null : latest + seconds;
	const latestClosedAgeSeconds = latestClosedTime === null ? null : Math.round(now / 1e3 - latestClosedTime);
	if (latestClosedAgeSeconds === null || latestClosedAgeSeconds > seconds + 4.5) console.warn("[pocket-history-still-stale]", JSON.stringify({
		symbol,
		periodSeconds: seconds,
		latestClosedAgeSeconds,
		tickCount: state.ticks.length,
		tickSpanSeconds: tickTimes.length > 1 ? Math.round((Math.max(...tickTimes) - Math.min(...tickTimes)) / 1e3) : 0,
		latestTickAgeMs: tickTimes.length ? Math.max(0, now - Math.max(...tickTimes)) : null,
		tickCoverageAfterHistory: tickTimes.filter((time) => beforeRealtime !== null && time > beforeRealtime * 1e3).length
	}));
	if (latest !== beforeRealtime) console.info("[pocket-history-reconciled]", JSON.stringify({
		symbol,
		periodSeconds: seconds,
		appendedCandles: candles.length - collected.size,
		latestCandleTime: latest,
		latestCandleAgeSeconds: latest === null ? null : Math.max(0, Math.floor(Date.now() / 1e3) - latest - seconds)
	}));
	storePeriodHistory(state, seconds, candles);
	pairMarketData.set(symbol, state);
	return {
		candles,
		rejectedRows
	};
}
function closedHistory(candles, seconds, nowMs = Date.now()) {
	const nowSeconds = nowMs / 1e3;
	return candles.filter((candle) => candle.time + seconds <= nowSeconds).sort((a, b) => a.time - b.time);
}
function historyIsFresh(candles, seconds, nowMs = Date.now()) {
	const latest = closedHistory(candles, seconds, nowMs).at(-1);
	if (!latest) return false;
	const ageSinceCloseMs = nowMs - (latest.time + seconds) * 1e3;
	return ageSinceCloseMs >= -1e3 && ageSinceCloseMs <= seconds * 1e3 + 4500;
}
//#endregion
//#region server/plugins/pocket-feed.ts
function pocketFeedPlugin() {
	startPocketFeed();
}
//#endregion
//#region #nitro/virtual/plugins
var plugins = [pocketFeedPlugin];
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const hooks = new HookableCore();
	const captureError = (error, errorCtx) => {
		const promise = hooks.callHook("error", error, errorCtx)?.catch?.((hookError) => {
			console.error("Error while capturing another error", hookError);
		});
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
			if (promise && typeof errorCtx.event.req.waitUntil === "function") errorCtx.event.req.waitUntil(promise);
		}
	};
	const h3App = createH3App({ onError(error, event) {
		captureError(error, { event });
		return error_handler_default(error, event);
	} });
	h3App.config.onRequest = (event) => {
		return hooks.callHook("request", event)?.catch?.((error) => {
			captureError(error, {
				event,
				tags: ["request"]
			});
		});
	};
	h3App.config.onResponse = (res, event) => {
		return hooks.callHook("response", res, event)?.catch?.((error) => {
			captureError(error, {
				event,
				tags: ["response"]
			});
		});
	};
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks,
		captureError
	};
}
function initNitroPlugins(app) {
	for (const plugin of plugins) try {
		plugin(app);
	} catch (error) {
		app.captureError?.(error, { tags: ["plugin"] });
		throw error;
	}
	return app;
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.5.8_chokidar@5.0.0_drizzle-orm@0.45.2_@ele_84e83e5e11232efb2e32e646a7e9d065/node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	initNitroPlugins(instance);
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.5.8_chokidar@5.0.0_drizzle-orm@0.45.2_@ele_84e83e5e11232efb2e32e646a7e9d065/node_modules/nitro/dist/presets/vercel/runtime/isr.mjs
var ISR_URL_PARAM = "__isr_route";
function isrRouteRewrite(reqUrl, xNowRouteMatches) {
	if (xNowRouteMatches) {
		const isrURL = new URLSearchParams(xNowRouteMatches).get(ISR_URL_PARAM);
		if (isrURL) return [decodeURIComponent(isrURL), ""];
	} else {
		const queryIndex = reqUrl.indexOf("?");
		if (queryIndex !== -1) {
			const params = new URLSearchParams(reqUrl.slice(queryIndex + 1));
			const isrURL = params.get(ISR_URL_PARAM);
			if (isrURL) {
				params.delete(ISR_URL_PARAM);
				return [decodeURIComponent(isrURL), params.toString()];
			}
		}
	}
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.5.8_chokidar@5.0.0_drizzle-orm@0.45.2_@ele_84e83e5e11232efb2e32e646a7e9d065/node_modules/nitro/dist/presets/vercel/runtime/vercel.web.mjs
var nitroApp = useNitroApp();
var vercel_web_default = { async fetch(req, context) {
	const isrURL = isrRouteRewrite(req.url, req.headers.get("x-now-route-matches"));
	if (isrURL) {
		const { routeRules } = getRouteRules("", isrURL[0]);
		if (routeRules?.isr) req = new Request(new URL(isrURL[0] + (isrURL[1] ? `?${isrURL[1]}` : ""), req.url).href, req);
	}
	req.runtime ??= { name: "vercel" };
	req.runtime.vercel = { context };
	let ip;
	Object.defineProperty(req, "ip", { get() {
		const h = req.headers.get("x-forwarded-for");
		return ip ??= h?.split(",").shift()?.trim();
	} });
	req.waitUntil = context?.waitUntil;
	return nitroApp.fetch(req);
} };
//#endregion
export { vercel_web_default as default };
