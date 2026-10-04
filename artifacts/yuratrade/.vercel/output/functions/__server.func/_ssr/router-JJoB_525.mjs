import { o as __toESM } from "../_runtime.mjs";
import { i as isValidExpirySeconds, n as analysisPeriodForExpiry } from "./expiry-B3tUilyb.mjs";
import { _ as require_react, a as HeadContent, c as createRouter, d as createFileRoute, f as createRootRoute, g as require_jsx_runtime, h as useRouter, i as Scripts, l as Outlet, o as useRouterState, p as Link, u as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as KeyRound, i as LayoutDashboard, n as TriangleAlert, o as History, r as ShieldCheck, s as GraduationCap, t as UserRound, u as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-JJoB_525.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function BrandName({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `font-bold tracking-tight ${className}`,
		children: ["VLADOS ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-blue-soft",
			children: "PRIME"
		})]
	});
}
var KEY = "pocket_option_id";
var ADMIN_IDS = ["113510708", "92535291"];
function isPocketId(value) {
	return /^\d{9}$/.test(value);
}
function isAdminId(value) {
	return value !== null && ADMIN_IDS.includes(value);
}
function readStoredId() {
	try {
		const value = localStorage.getItem(KEY) ?? "";
		return isPocketId(value) ? value : null;
	} catch {
		return null;
	}
}
var PocketContext = (0, import_react.createContext)(null);
function PocketProvider({ children }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [id, setId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setId(readStoredId());
		setReady(true);
	}, []);
	const accept = (next) => {
		const trimmed = next.trim();
		if (!isPocketId(trimmed)) return;
		localStorage.setItem(KEY, trimmed);
		setId(trimmed);
	};
	const leave = () => {
		localStorage.removeItem(KEY);
		setId(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PocketContext.Provider, {
		value: {
			ready,
			id,
			accept,
			leave
		},
		children
	});
}
function usePocket() {
	const value = (0, import_react.useContext)(PocketContext);
	if (!value) throw new Error("Pocket session missing");
	return value;
}
var notes = [
	"Только 9 цифр из профиля Pocket Option",
	"Пароль от кабинета не нужен",
	"Сделки сами не открываются",
	"Сумму считает калькулятор риска"
];
function Gate() {
	const { accept } = usePocket();
	const [value, setValue] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const ready = isPocketId(value);
	const submit = () => {
		if (!ready) {
			setError("Идентификатор должен состоять ровно из 9 цифр");
			return;
		}
		accept(value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "stage flex min-h-dvh items-center justify-center px-4 py-10 pb-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rise text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold tracking-[0.18em] text-blue-soft",
							children: "VLADOS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandName, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-3 max-w-sm text-base leading-relaxed text-muted",
							children: "Проверка идентификатора. Регистрация не нужна — пароль не запрашиваем."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "panel rise rise-2 mt-8 space-y-4 p-5",
					onSubmit: (event) => {
						event.preventDefault();
						submit();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-semibold text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4 text-blue-soft" }), "Идентификатор Pocket Option"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "pocket-help",
							className: "text-sm leading-relaxed text-dim",
							children: "Девять цифр из профиля. Это проверка ID, не создание аккаунта."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "pocket-id",
								inputMode: "numeric",
								autoComplete: "off",
								maxLength: 9,
								"aria-describedby": error ? "pocket-help pocket-error" : "pocket-help",
								"aria-invalid": Boolean(error),
								placeholder: "123456789",
								value,
								onChange: (event) => {
									setValue(event.target.value.replace(/\D/g, "").slice(0, 9));
									if (error) setError("");
								},
								className: "field h-14 px-4 pr-14 text-center font-mono text-xl font-semibold tracking-[0.28em] placeholder:tracking-[0.28em] placeholder:text-dim/40"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `absolute top-1/2 right-4 -translate-y-1/2 font-mono text-xs font-semibold ${ready ? "text-blue-soft" : "text-dim"}`,
								children: [value.length, "/9"]
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "pocket-error",
							role: "alert",
							className: "text-sm text-loss",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							className: "btn-prime w-full",
							disabled: !ready,
							children: [ready ? "Проверить ID" : "Введите 9 цифр", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2 rounded-xl bg-blue/10 px-3 py-3 text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0 text-blue-soft" }), "ID остаётся только в этом браузере. На сервер он не отправляется."]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid grid-cols-2 gap-2",
					children: notes.map((note, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: `panel rise rise-${index + 1} p-3 text-sm leading-snug text-muted`,
						children: note
					}, note))
				})
			]
		})
	});
}
var levels = [
	{
		id: "iskra",
		name: "Искра",
		deposit: 60,
		tag: "Базовый",
		lead: "Один срок, направление и короткая карточка. Хватает, чтобы войти по свечам и не перепутать пару.",
		daily: 5,
		points: [
			"5 сигналов в день. Перекрытия в этот счёт не входят.",
			"Цена входа и выплата пары на одной карточке.",
			"График последних свечей, по которым выбран вход.",
			"Пунктир цены входа на графике.",
			"Живая цена, пока идёт таймер.",
			"RSI одной строкой, без старшего графика.",
			"Счёт бычьих и медвежьих среди последних пяти свечей.",
			"Короткое пояснение, почему взята эта сторона.",
			"Анимация победы, если цена закрылась в нужную сторону.",
			"Ничья, если цена не сдвинулась: возврат и без перекрытия.",
			"Одно перекрытие после проигрыша, не серия без конца.",
			"10 секунд, чтобы подготовиться к перекрытию.",
			"Валюты, крипто, акции и сырьё в одном выборе.",
			"В конце названия пары стоит OTC.",
			"Кнопка копирует полное имя пары.",
			"Сроки 1, 3, 5 и 15 минут.",
			"Таймер до конца экспирации.",
			"Калькулятор риска на главной для размера входа."
		]
	},
	{
		id: "vector",
		name: "Вектор",
		deposit: 200,
		tag: "Профессиональный",
		lead: "Младший срок сверяется со старшим. Слабый и спорный вход отсекается до карточки.",
		daily: 20,
		points: [
			"20 сигналов в день. Перекрытия в этот счёт не входят.",
			"Младший график не торгуется против старшего.",
			"SMA 12: цена выше или ниже средней и на сколько процентов.",
			"Наклон окна: восходящий, нисходящий или плоский.",
			"Отдельная строка, если свечи спорят с наклоном.",
			"Слабый вход не выдаётся, когда стороны почти равны.",
			"Пила не маскируется под сильный сигнал.",
			"Диапазон: цена в верхней, средней или нижней трети.",
			"Оценка, тянет ли выплата шум этого срока.",
			"Приоритет пар, где выплата выше порога безубытка.",
			"Разбор тела свечи, не только её цвета.",
			"Учёт теней: длинный хвост ослабляет сторону.",
			"Сравнение импульса вверх и импульса вниз.",
			"Текст говорит, чего не хватило обратной стороне.",
			"Пометка, если до экспирации входить уже поздно.",
			"Два перекрытия, у каждого свой разбор, не копия первого.",
			"После второго проигрыша серия останавливается.",
			"Живая точка на графике отдельно от исторической свечи.",
			"Более длинная карточка: RSI, средняя, диапазон, свечи, наклон.",
			"Подсказка размера ставки из калькулятора рядом со входом."
		]
	},
	{
		id: "apex",
		name: "Апекс",
		deposit: 500,
		tag: "Глубокий",
		lead: "Полный разбор окна, запас до границы и жёсткий пропуск слабого сценария. Три перекрытия и стоп.",
		daily: null,
		points: [
			"Сигналы без дневного лимита.",
			"Где именно стоит цена внутри старшего диапазона.",
			"Запас до противоположной границы: тесно или есть место.",
			"Сценарий пропуска, если индикаторы не собрались в одну сторону.",
			"Отдельная пометка, если выплата не тянет выбранный срок.",
			"Порог безубытка считается от выплаты на карточке.",
			"Полный набор: RSI 14, SMA 12, треть диапазона, пять свечей, наклон.",
			"Согласованность: сколько признаков за сторону и сколько против.",
			"Оценка качества окна до того, как появится направление.",
			"Текст, почему не взята обратная сторона, а не только почему взята эта.",
			"Сравнение 1, 3 и 5 минут одной и той же пары.",
			"На 15 минутах шум минутного графика не перебивает старший.",
			"На 1 минуте фильтр жёстче: плоский наклон не проходит.",
			"Спорные свечи выкидываются, а не усредняются в сторону.",
			"Разбор теней и тел по отдельности.",
			"Пометка опоздавшего входа, если цена уже ушла от точки.",
			"Строка уверенности: сильный, средний или слабый сценарий.",
			"Ничья описана отдельно: это возврат, не победа и не перекрытие.",
			"Три перекрытия, каждое с новым разбором той же пары.",
			"10 секунд подготовки перед каждым следующим входом.",
			"После третьего проигрыша четвёртого сигнала нет.",
			"План серии смотрит на калькулятор, а не на желание отбить.",
			"Приоритет чистого импульса над красивой, но спорной свечой.",
			"Контекст категории: валюта, крипто, акция или сырьё.",
			"Старший график упомянут в пояснении, не только последняя свеча.",
			"Слабая выплата на шумном сроке режет сигнал до карточки."
		]
	}
];
var USED_KEY = "vprime_signals_used";
function todayKey() {
	const now = /* @__PURE__ */ new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function levelForBalance(balance) {
	if (balance === null) return null;
	return [...levels].reverse().find((level) => balance >= level.deposit) ?? null;
}
function signalsUsedToday() {
	if (typeof localStorage === "undefined") return 0;
	try {
		const raw = JSON.parse(localStorage.getItem(USED_KEY) || "null");
		if (!raw || raw.day !== todayKey() || !Number.isFinite(raw.count)) return 0;
		return Math.max(0, Number(raw.count));
	} catch {
		return 0;
	}
}
function markSignalUsed() {
	const count = signalsUsedToday() + 1;
	localStorage.setItem(USED_KEY, JSON.stringify({
		day: todayKey(),
		count
	}));
	return count;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var loadFeed = createServerFn({ method: "GET" }).handler(createSsrRpc("fb07d0a82ccd0e21eb307fec3024649c271630507c2eb15012c43274deadb043"));
var readClose = createServerFn({ method: "POST" }).validator((input) => {
	const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) throw new Error("Пара недоступна.");
	return { symbol };
}).handler(createSsrRpc("c3bf91de64f793a1fdff73992de93db6878fb230b41776a1663843f0dd5e02d1"));
var takeSignal = createServerFn({ method: "POST" }).validator((input) => {
	const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
	const expirySeconds = Number(input?.expirySeconds);
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol) || !isValidExpirySeconds(expirySeconds)) throw new Error("Выберите пару и срок экспирации от 1 минуты до 4 часов.");
	return {
		symbol,
		expirySeconds
	};
}).handler(createSsrRpc("e7eabc0cd6ed805a34adcafedfe18f606c2fbbb009e971fe08cadbcf71358857"));
var takeBest = createServerFn({ method: "POST" }).validator((input) => {
	const expirySeconds = Number(input?.expirySeconds);
	if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
	return { expirySeconds };
}).handler(createSsrRpc("65a316e774e0ea4a3bef3cd70e45365d003566e62fb4f915e8f227872abf97ab"));
var links = [
	{
		to: "/",
		label: "Сигналы",
		icon: LayoutDashboard
	},
	{
		to: "/history",
		label: "История",
		icon: History
	},
	{
		to: "/learn",
		label: "Обучение",
		icon: GraduationCap
	},
	{
		to: "/profile",
		label: "Профиль",
		icon: UserRound
	}
];
function Shell({ children }) {
	const path = useRouterState({ select: (state) => state.location.pathname });
	const { id } = usePocket();
	const admin = isAdminId(id);
	const [levelName, setLevelName] = (0, import_react.useState)("Без уровня");
	(0, import_react.useEffect)(() => {
		let stop = false;
		const pull = () => {
			loadFeed().then((feed) => {
				if (stop || feed.balance === null) return;
				if (admin) return;
				const level = [...levels].reverse().find((item) => feed.balance !== null && feed.balance >= item.deposit);
				setLevelName(level ? `${level.name} · $${level.deposit}` : "Без уровня");
			}).catch(() => {});
		};
		pull();
		const timer = window.setInterval(pull, 8e3);
		return () => {
			stop = true;
			window.clearInterval(timer);
		};
	}, [admin]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stage min-h-dvh",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "aurora",
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-white/6 bg-bg/55 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-14 max-w-lg items-center gap-1.5 px-3 sm:h-16 sm:gap-2 sm:px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandName, { className: "min-w-0 truncate text-[15px] sm:text-lg" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "ml-6 hidden items-center lg:flex",
							children: links.map((item) => {
								const on = item.to === "/" ? path === "/" : path.startsWith(item.to);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: item.to,
									className: `nav-link ${on ? "on" : ""}`,
									children: item.label
								}, item.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/profile",
							className: "chip on ml-auto max-w-[7.5rem] shrink-0 truncate text-[11px] sm:max-w-[11rem] sm:text-xs",
							children: admin ? "Админ" : levelName
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "relative z-10 mx-auto w-full max-w-lg px-3 pt-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-6",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-3 z-20 lg:hidden",
				style: { bottom: "max(0.75rem, env(safe-area-inset-bottom))" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "nav-glass grid h-16 grid-cols-4 rounded-3xl border border-white/12 bg-white/8 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl",
					children: links.map((item) => {
						const on = item.to === "/" ? path === "/" : path.startsWith(item.to);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: `flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] leading-none font-semibold ${on ? "text-blue-soft" : "text-dim"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4" }), item.label]
						}, item.to);
					})
				})
			})
		]
	});
}
var styles_default = "/assets/styles-CR2zCjJ_.css";
var Route$6 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: "VLADOS PRIME" },
			{
				name: "theme-color",
				content: "#080b12"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ru",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PocketProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Frame, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
function Frame() {
	const { ready, id } = usePocket();
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "stage min-h-dvh" });
	if (!id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gate, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
var $$splitComponentImporter$4 = () => import("./routes-D1BNcEg0.mjs");
var Route$5 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./history-DNLfnen7.mjs");
var Route$4 = createFileRoute("/history")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./learn-NlbrSYfu.mjs");
var Route$3 = createFileRoute("/learn")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./profile-DUrB8oeu.mjs");
var Route$2 = createFileRoute("/profile")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./signal-BABsRPyx.mjs");
var groups = /* @__PURE__ */ new Set([
	"fx",
	"crypto",
	"stock",
	"commodity"
]);
function readBars(value) {
	if (!Array.isArray(value)) return [];
	const bars = [];
	for (const row of value) {
		if (!Array.isArray(row) || row.length < 4) continue;
		const open = Number(row[0]);
		const high = Number(row[1]);
		const low = Number(row[2]);
		const close = Number(row[3]);
		if ([
			open,
			high,
			low,
			close
		].every(Number.isFinite)) bars.push([
			open,
			high,
			low,
			close
		]);
	}
	return bars.slice(-32);
}
var Route$1 = createFileRoute("/signal")({
	validateSearch: (search) => {
		const group = groups.has(search.group) ? search.group : "fx";
		const direction = search.direction === "put" ? "put" : "call";
		const parsedSeconds = Number(search.seconds);
		const seconds = isValidExpirySeconds(parsedSeconds) ? parsedSeconds : 60;
		return {
			symbol: typeof search.symbol === "string" ? search.symbol : "",
			name: typeof search.name === "string" ? search.name : "",
			group,
			direction,
			open: Number(search.open) || 0,
			payout: Number(search.payout) || 0,
			seconds,
			analysisSeconds: analysisPeriodForExpiry(seconds),
			note: typeof search.note === "string" ? search.note : "",
			bars: readBars(search.bars),
			ruleScore: Number(search.ruleScore) || 0,
			step: Math.min(3, Math.max(0, Number(search.step) || 0)),
			started: Number(search.started) || Date.now()
		};
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route = createFileRoute("/api/ticks")({ server: { handlers: { GET: async ({ request }) => {
	const symbol = new URL(request.url).searchParams.get("symbol")?.trim() ?? "";
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) return new Response("bad symbol", { status: 400 });
	const { followQuote, quoteStatus } = await import("./pocket-live.server-DCe28cVt.mjs");
	const encoder = new TextEncoder();
	let closed = false;
	const stream = new ReadableStream({ start(controller) {
		let timer;
		const stop = () => {
			if (closed) return;
			closed = true;
			clearInterval(timer);
			try {
				controller.close();
			} catch {}
		};
		request.signal.addEventListener("abort", stop);
		let last = "";
		let lastStatus = "";
		timer = setInterval(() => {
			if (closed) return;
			const quote = followQuote(symbol);
			try {
				const status = JSON.stringify(quoteStatus(symbol));
				if (status !== lastStatus) {
					lastStatus = status;
					controller.enqueue(encoder.encode(`event: feed-status\ndata: ${status}\n\n`));
				}
				if (!quote) return;
				const line = String(quote.price);
				if (line === last) return;
				last = line;
				controller.enqueue(encoder.encode(`data: ${line}\n\n`));
			} catch {
				stop();
			}
		}, 250);
	} });
	return new Response(stream, { headers: {
		"content-type": "text/event-stream",
		"cache-control": "no-cache",
		connection: "keep-alive"
	} });
} } } });
var rootRouteChildren = {
	IndexRoute: Route$5.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$6
	}),
	HistoryRoute: Route$4.update({
		id: "/history",
		path: "/history",
		getParentRoute: () => Route$6
	}),
	LearnRoute: Route$3.update({
		id: "/learn",
		path: "/learn",
		getParentRoute: () => Route$6
	}),
	ProfileRoute: Route$2.update({
		id: "/profile",
		path: "/profile",
		getParentRoute: () => Route$6
	}),
	SignalRoute: Route$1.update({
		id: "/signal",
		path: "/signal",
		getParentRoute: () => Route$6
	}),
	ApiTicksRoute: Route.update({
		id: "/api/ticks",
		path: "/api/ticks",
		getParentRoute: () => Route$6
	})
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { takeBest as a, levels as c, isAdminId as d, usePocket as f, readClose as i, markSignalUsed as l, Route$1 as n, takeSignal as o, loadFeed as r, levelForBalance as s, router_exports as t, signalsUsedToday as u };
