import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, a as HeadContent, c as createRouter, d as createFileRoute, f as createRootRoute, g as require_jsx_runtime, h as useRouter, i as Scripts, l as Outlet, m as useNavigate, o as useRouterState, p as Link, u as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { d as getTelegramInitData, f as initializeTelegramWebApp, l as analysisPeriodForExpiry, m as pocketGateMiddleware, p as isValidExpirySeconds, t as ANALYSIS_PERIODS_SECONDS } from "./pocket-gate.middleware-DqGlDVU6.mjs";
import { n as isValidPocketOptionId, t as isAdminId } from "./pocket-admin-DnzTuOI1.mjs";
import { a as object, i as number, o as string, r as literal, s as union } from "../_libs/zod.mjs";
import { a as KeyRound, i as LayoutDashboard, n as TriangleAlert, o as History, s as GraduationCap, t as UserRound, u as ArrowRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createSsrRpc-CU_ZALBq.js
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
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DzdSW7pa.js
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
var levels = [
	{
		id: "iskra",
		name: "Базовый",
		deposit: 60,
		tag: "Базовый",
		lead: "Один срок, направление и короткая карточка. Хватает, чтобы войти по свечам и не перепутать пару.",
		daily: 10,
		points: [
			"10 сигналов в день. Перекрытия в этот счёт не входят.",
			"Цена входа и выплата пары на одной карточке.",
			"График последних свечей, по которым выбран вход.",
			"Пунктир цены входа на графике.",
			"Живая цена, пока идёт таймер.",
			"RSI одной строкой, без старшего графика.",
			"Счёт бычьих и медвежьих среди последних пяти свечей.",
			"Короткое пояснение, почему взята эта сторона.",
			"Анимация победы, если цена закрылась в нужную сторону.",
			"Ничья, если цена не сдвинулась: возврат и без перекрытия.",
			"До трёх перекрытий после проигрышей; ничья не запускает перекрытие.",
			"10 секунд, чтобы скопировать пару перед сигналом и каждым перекрытием.",
			"Только валютные пары, включая OTC.",
			"В конце названия пары стоит OTC.",
			"Кнопка копирует название пары без завершающей метки OTC.",
			"Сроки 1, 3, 5 и 15 минут.",
			"Таймер до конца экспирации.",
			"Калькулятор риска на главной для размера входа."
		]
	},
	{
		id: "vector",
		name: "Профессиональный",
		deposit: 200,
		tag: "Профессиональный",
		lead: "Младший срок сверяется со старшим. Слабый и спорный вход отсекается до карточки.",
		daily: 40,
		points: [
			"40 сигналов в день. Перекрытия в этот счёт не входят.",
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
			"До трёх перекрытий, у каждого свой разбор той же пары.",
			"После третьего проигрыша серия останавливается.",
			"Живая точка на графике отдельно от исторической свечи.",
			"Более длинная карточка: RSI, средняя, диапазон, свечи, наклон.",
			"Подсказка размера ставки из калькулятора рядом со входом."
		]
	},
	{
		id: "apex",
		name: "Глубокий",
		deposit: 500,
		tag: "Глубокий",
		lead: "Полный разбор окна, запас до границы и жёсткий пропуск слабого сценария. До трёх перекрытий на всех уровнях.",
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
			"10 секунд, чтобы скопировать пару перед первым сигналом и каждым перекрытием.",
			"После третьего проигрыша четвёртого сигнала нет.",
			"План серии смотрит на калькулятор, а не на желание отбить.",
			"Приоритет чистого импульса над красивой, но спорной свечой.",
			"Контекст валютной пары, включая OTC.",
			"Старший график упомянут в пояснении, не только последняя свеча.",
			"Слабая выплата на шумном сроке режет сигнал до карточки."
		]
	}
];
var USED_KEY = "vprime_signals_used";
function usedKey(pocketId) {
	return `${USED_KEY}:${pocketId || "unverified"}`;
}
function todayKey() {
	const now = /* @__PURE__ */ new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function levelForBalance(balance) {
	if (balance === null) return null;
	return [...levels].reverse().find((level) => balance >= level.deposit) ?? null;
}
function signalsUsedToday(pocketId) {
	if (typeof localStorage === "undefined") return 0;
	try {
		const raw = JSON.parse(localStorage.getItem(usedKey(pocketId)) || "null");
		if (!raw || raw.day !== todayKey() || !Number.isFinite(raw.count)) return 0;
		return Math.max(0, Number(raw.count));
	} catch {
		return 0;
	}
}
function markSignalUsed(pocketId) {
	const count = signalsUsedToday(pocketId) + 1;
	localStorage.setItem(usedKey(pocketId), JSON.stringify({
		day: todayKey(),
		count
	}));
	return count;
}
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
var copy = {
	"language.label": [
		"Язык",
		"Мова",
		"Language"
	],
	"language.ru": [
		"Русский",
		"Російська",
		"Russian"
	],
	"language.uk": [
		"Українська",
		"Українська",
		"Ukrainian"
	],
	"language.en": [
		"English",
		"English",
		"English"
	],
	"nav.signals": [
		"Сигналы",
		"Сигнали",
		"Signals"
	],
	"nav.history": [
		"История",
		"Історія",
		"History"
	],
	"nav.learn": [
		"Обучение",
		"Навчання",
		"Learn"
	],
	"nav.profile": [
		"Профиль",
		"Профіль",
		"Profile"
	],
	"nav.admin": [
		"Админ",
		"Адмін",
		"Admin"
	],
	"nav.noLevel": [
		"Без уровня",
		"Без рівня",
		"No level"
	],
	"home.eyebrow": [
		"ТОЛЬКО ВАЛЮТНЫЕ ПАРЫ",
		"ТІЛЬКИ ВАЛЮТНІ ПАРИ",
		"CURRENCY PAIRS ONLY"
	],
	"home.title": [
		"Сигналы для валютного рынка",
		"Сигнали для валютного ринку",
		"Signals for currency markets"
	],
	"home.body": [
		"PRIME BOT анализирует доступные валютные пары Pocket Option, показывает направление, цену входа и время экспирации. Сделки автоматически не открываются.",
		"PRIME BOT аналізує доступні валютні пари Pocket Option, показує напрямок, ціну входу та час експірації. Угоди автоматично не відкриваються.",
		"PRIME BOT analyzes available Pocket Option currency pairs and shows direction, entry price, and expiry. It never places trades automatically."
	],
	"home.feature1.title": [
		"ИИ-анализ свечей",
		"ШІ-аналіз свічок",
		"AI candle analysis"
	],
	"home.feature1.body": [
		"Выбирает направление по истории свечей Pocket Option, полученной через WebSocket.",
		"Обирає напрямок за історією свічок Pocket Option, отриманою через WebSocket.",
		"Chooses a direction from Pocket Option candle history received over WebSocket."
	],
	"home.feature2.title": [
		"Только валюты",
		"Лише валюти",
		"Currency pairs only"
	],
	"home.feature2.body": [
		"В выборе сигналов остаются только валютные пары, включая OTC.",
		"У виборі сигналів залишаються лише валютні пари, зокрема OTC.",
		"Signal selection includes currency pairs only, including OTC."
	],
	"home.feature3.title": [
		"Фактическая статистика",
		"Фактична статистика",
		"Recorded results"
	],
	"home.feature3.body": [
		"Результаты закрытых сигналов можно проверить в истории.",
		"Результати закритих сигналів можна перевірити в історії.",
		"Check completed signal outcomes in your history."
	],
	"home.rateCaption": [
		"Проходимость по завершённым валютным сигналам",
		"Прохідність за завершеними валютними сигналами",
		"Hit rate on completed currency signals"
	],
	"home.disclaimer": [
		"Только подтверждённые результаты сигналов из истории этого браузера. Показатели обновляются после фиксации исхода; прошлые результаты не гарантируют будущих.",
		"Лише підтверджені результати сигналів з історії цього браузера. Показники оновлюються після фіксації результату; минулі результати не гарантують майбутніх.",
		"Only verified signal outcomes from this browser’s history. Statistics update when an outcome is recorded; past results do not guarantee future outcomes."
	],
	"stats.title": [
		"Реальная статистика",
		"Реальна статистика",
		"Recorded statistics"
	],
	"stats.settled": [
		"Завершено",
		"Завершено",
		"Completed"
	],
	"stats.wins": [
		"Побед",
		"Перемог",
		"Wins"
	],
	"stats.losses": [
		"Поражений",
		"Поразок",
		"Losses"
	],
	"stats.draws": [
		"Ничьих",
		"Нічиїх",
		"Draws"
	],
	"stats.rate": [
		"Проходимость",
		"Прохідність",
		"Hit rate"
	],
	"stats.source": [
		"Только подтверждённые исходы из истории этого браузера; срез обновляется раз в сутки. Ничьи не входят в проходимость.",
		"Лише підтверджені результати з історії цього браузера; показники оновлюються після запису результату. Нічиї не входять до прохідності.",
		"Verified outcomes from this browser’s history; statistics refresh after an outcome is recorded. Draws are excluded from hit rate."
	],
	"stats.asOf": [
		"Обновлено: {date}",
		"Оновлено: {date}",
		"Updated: {date}"
	],
	"stats.empty": [
		"Подтверждённых исходов пока нет. Показатели появятся после реальных сигналов.",
		"Підтверджених результатів поки немає. Показники з’являться після реальних сигналів.",
		"No verified outcomes yet. Statistics will appear after real signals are recorded."
	],
	"learn.trend.definition": [
		"Тренд — это общее направление движения цены.",
		"Тренд — це загальний напрямок руху ціни.",
		"A trend is the overall direction in which price is moving."
	],
	"learn.trend.imageAlt": [
		"Инфографика: восходящий тренд с более высокими вершинами и минимумами, нисходящий тренд с более низкими вершинами и минимумами и боковое движение в диапазоне.",
		"Інфографіка: висхідний тренд із вищими вершинами та мінімумами, низхідний тренд із нижчими вершинами та мінімумами й боковий рух у діапазоні.",
		"Infographic showing an uptrend with higher highs and lows, a downtrend with lower highs and lows, and sideways movement within a range."
	],
	"learn.trend.up": [
		"Восходящий тренд — цена в целом движется вверх, вершины и минимумы становятся выше.",
		"Висхідний тренд — ціна загалом рухається вгору, вершини й мінімуми стають вищими.",
		"An uptrend means price is generally moving higher, with higher highs and higher lows."
	],
	"learn.trend.down": [
		"Нисходящий тренд — цена в целом движется вниз, вершины и минимумы становятся ниже.",
		"Нисхідний тренд — ціна загалом рухається вниз, вершини й мінімуми стають нижчими.",
		"A downtrend means price is generally moving lower, with lower highs and lower lows."
	],
	"learn.trend.sideways": [
		"Боковой тренд (флэт) — цена колеблется в определённом диапазоне без выраженного направления.",
		"Боковий тренд (флет) — ціна коливається в певному діапазоні без вираженого напрямку.",
		"A sideways trend (range) means price moves within a defined range without a clear direction."
	],
	"learn.trend.caution": [
		"Тренд помогает понять общее направление движения цены, но не гарантирует результат сделки.",
		"Тренд допомагає зрозуміти загальний напрямок руху ціни, але не гарантує результат угоди.",
		"A trend helps identify the overall direction of price movement, but it does not guarantee a trade outcome."
	],
	"learn.open": [
		"Открыть материал",
		"Відкрити матеріал",
		"Open lesson"
	],
	"learn.collectionTitle": [
		"Тренды, уровни и паттерны",
		"Тренди, рівні та патерни",
		"Trends, levels, and patterns"
	],
	"learn.collectionDescription": [
		"Три коротких материала: о трендах, уровнях поддержки и сопротивления и свечных паттернах.",
		"Три короткі матеріали: про тренди, рівні підтримки та опору й свічкові патерни.",
		"Three short lessons on trends, support and resistance levels, and candlestick patterns."
	],
	"learn.levels.title": [
		"Что такое уровни поддержки и сопротивления?",
		"Що таке рівні підтримки та опору?",
		"What are support and resistance levels?"
	],
	"learn.levels.definition": [
		"Уровни поддержки и сопротивления — это важные зоны на графике, в которых цена может замедлить движение, остановиться или развернуться.",
		"Рівні підтримки та опору — це важливі зони на графіку, у яких ціна може сповільнити рух, зупинитися або розвернутися.",
		"Support and resistance are important chart zones where price may slow down, pause, or reverse."
	],
	"learn.levels.imageAlt": [
		"Инфографика об уровнях поддержки и сопротивления: отскоки цены, пробои и смена роли уровня.",
		"Інфографіка про рівні підтримки та опору: відскоки ціни, пробої та зміна ролі рівня.",
		"Infographic about support and resistance: price bounces, breakouts, and role reversal."
	],
	"learn.levels.supportTitle": [
		"1. Уровень поддержки",
		"1. Рівень підтримки",
		"1. Support level"
	],
	"learn.levels.support": [
		"Это зона, от которой цена ранее отскакивала вверх. Здесь может появляться повышенный интерес покупателей, поэтому цена иногда снова начинает расти.",
		"Це зона, від якої ціна раніше відскакувала вгору. Тут може зростати інтерес покупців, тому ціна іноді знову починає підніматися.",
		"A zone where price has previously bounced upward. Buyer interest may increase here, so price may start rising again."
	],
	"learn.levels.resistanceTitle": [
		"2. Уровень сопротивления",
		"2. Рівень опору",
		"2. Resistance level"
	],
	"learn.levels.resistance": [
		"Это зона, от которой цена ранее отскакивала вниз. Здесь может усиливаться давление продавцов, из-за чего цена иногда начинает снижаться.",
		"Це зона, від якої ціна раніше відскакувала вниз. Тут може посилюватися тиск продавців, через що ціна іноді починає знижуватися.",
		"A zone where price has previously bounced downward. Selling pressure may increase here, sometimes pushing price lower."
	],
	"learn.levels.breakoutTitle": [
		"3. Пробой уровня",
		"3. Пробій рівня",
		"3. Level breakout"
	],
	"learn.levels.breakout": [
		"Если цена проходит через поддержку или сопротивление, это может указывать на продолжение движения. После пробоя сопротивление иногда становится поддержкой, а поддержка — сопротивлением.",
		"Якщо ціна проходить крізь підтримку або опір, це може вказувати на продовження руху. Після пробою опір іноді стає підтримкою, а підтримка — опором.",
		"If price moves through support or resistance, it may signal continuation. After a breakout, resistance can sometimes become support, and support can become resistance."
	],
	"learn.levels.practiceTitle": [
		"Как использовать уровни на практике?",
		"Як використовувати рівні на практиці?",
		"How can you use levels?"
	],
	"learn.levels.step1": [
		"Определи текущий тренд.",
		"Визнач поточний тренд.",
		"Identify the current trend."
	],
	"learn.levels.step2": [
		"Найди зоны, от которых цена неоднократно отскакивала.",
		"Знайди зони, від яких ціна неодноразово відскакувала.",
		"Find zones where price has bounced repeatedly."
	],
	"learn.levels.step3": [
		"Дождись реакции цены на уровень или подтверждённого пробоя.",
		"Дочекайся реакції ціни на рівень або підтвердженого пробою.",
		"Wait for a price reaction at the level or a confirmed breakout."
	],
	"learn.levels.step4": [
		"Используй дополнительные инструменты анализа.",
		"Використовуй додаткові інструменти аналізу.",
		"Use additional analysis tools."
	],
	"learn.levels.step5": [
		"Соблюдай риск-менеджмент и не входи в сделку только потому, что цена коснулась уровня.",
		"Дотримуйся ризик-менеджменту й не входь в угоду лише тому, що ціна торкнулася рівня.",
		"Manage risk, and do not enter a trade just because price touched a level."
	],
	"learn.levels.warning": [
		"Важно: уровни поддержки и сопротивления — это зоны, а не точные линии. Цена может пробить их в любой момент, поэтому они не гарантируют успешный исход сделки.",
		"Важливо: рівні підтримки та опору — це зони, а не точні лінії. Ціна може пробити їх будь-коли, тому вони не гарантують успішного результату угоди.",
		"Important: support and resistance are zones, not exact lines. Price can break through them at any time, so they do not guarantee a successful trade."
	],
	"learn.levels.remember": [
		"Запомни: поддержка помогает найти зоны возможного роста, сопротивление — зоны возможного снижения, а подтверждение движения помогает принимать более обоснованные решения.",
		"Запам’ятай: підтримка допомагає знайти зони можливого зростання, опір — зони можливого зниження, а підтвердження руху допомагає ухвалювати обґрунтованіші рішення.",
		"Remember: support can help identify potential rising zones, resistance potential falling zones, and confirmation can support more informed decisions."
	],
	"learn.patterns.title": [
		"Что такое паттерны?",
		"Що таке патерни?",
		"What are chart patterns?"
	],
	"learn.patterns.definition": [
		"Паттерны — это повторяющиеся комбинации свечей на графике, которые помогают предположить, куда цена может двигаться дальше.",
		"Патерни — це повторювані комбінації свічок на графіку, які допомагають припустити, куди ціна може рухатися далі.",
		"Patterns are recurring candle combinations on a chart that can help suggest where price may move next."
	],
	"learn.patterns.imageAlt": [
		"Инфографика о бычьих и медвежьих паттернах продолжения и паттернах разворота.",
		"Інфографіка про бичачі та ведмежі патерни продовження й патерни розвороту.",
		"Infographic showing bullish and bearish continuation patterns and reversal patterns."
	],
	"learn.patterns.risingTitle": [
		"1. Паттерны продолжения роста",
		"1. Патерни продовження зростання",
		"1. Bullish continuation patterns"
	],
	"learn.patterns.rising": [
		"Появляются во время восходящего тренда и могут указывать на то, что после небольшой коррекции цена продолжит расти.",
		"З’являються під час висхідного тренду й можуть вказувати на те, що після невеликої корекції ціна продовжить зростати.",
		"They appear during an uptrend and may suggest that price will continue rising after a small correction."
	],
	"learn.patterns.fallingTitle": [
		"2. Паттерны продолжения падения",
		"2. Патерни продовження падіння",
		"2. Bearish continuation patterns"
	],
	"learn.patterns.falling": [
		"Формируются во время нисходящего тренда и могут указывать на продолжение движения цены вниз.",
		"Формуються під час низхідного тренду й можуть вказувати на продовження руху ціни вниз.",
		"They form during a downtrend and may suggest that price will continue moving lower."
	],
	"learn.patterns.reversalTitle": [
		"3. Паттерны разворота",
		"3. Патерни розвороту",
		"3. Reversal patterns"
	],
	"learn.patterns.reversal": [
		"Могут сигнализировать о возможной смене направления движения цены. Например: «Двойная вершина», «Двойное дно» или «Голова и плечи».",
		"Можуть сигналізувати про можливу зміну напрямку руху ціни. Наприклад: «Подвійна вершина», «Подвійне дно» або «Голова та плечі».",
		"They may signal a possible change in price direction. Examples include a double top, double bottom, or head and shoulders."
	],
	"learn.patterns.practiceTitle": [
		"Как использовать паттерны на Pocket Option?",
		"Як використовувати патерни на Pocket Option?",
		"How can you use patterns on Pocket Option?"
	],
	"learn.patterns.step1": [
		"Определи текущий тренд.",
		"Визнач поточний тренд.",
		"Identify the current trend."
	],
	"learn.patterns.step2": [
		"Найди на графике формирующийся паттерн.",
		"Знайди на графіку патерн, що формується.",
		"Look for a pattern forming on the chart."
	],
	"learn.patterns.step3": [
		"Дождись подтверждения — например, пробоя уровня или закрытия свечи.",
		"Дочекайся підтвердження — наприклад, пробою рівня або закриття свічки.",
		"Wait for confirmation, such as a level breakout or candle close."
	],
	"learn.patterns.step4": [
		"Оцени уровни поддержки и сопротивления.",
		"Оціни рівні підтримки та опору.",
		"Assess support and resistance levels."
	],
	"learn.patterns.step5": [
		"Не входи в сделку только из-за появления знакомой фигуры — учитывай общую ситуацию на рынке.",
		"Не входь в угоду лише через появу знайомої фігури — враховуй загальну ситуацію на ринку.",
		"Do not enter a trade just because a familiar shape appears; consider the overall market situation."
	],
	"learn.patterns.warning": [
		"Важно: паттерны не гарантируют прибыль и могут отрабатывать неправильно. Даже если фигура выглядит идеально, цена может пойти в противоположную сторону. Соблюдай риск-менеджмент и не пытайся отыгрываться после убытков.",
		"Важливо: патерни не гарантують прибутку й можуть відпрацьовувати неправильно. Навіть якщо фігура виглядає ідеально, ціна може піти в протилежний бік. Дотримуйся ризик-менеджменту й не намагайся відігратися після збитків.",
		"Important: patterns do not guarantee profit and can fail. Even a perfect-looking pattern can be followed by a move in the opposite direction. Manage risk and do not chase losses."
	],
	"learn.patterns.remember": [
		"Запомни: паттерн — это инструмент анализа, а не гарантия результата сделки.",
		"Запам’ятай: патерн — це інструмент аналізу, а не гарантія результату угоди.",
		"Remember: a pattern is an analysis tool, not a guarantee of a trade outcome."
	],
	"signal.connected": [
		"Поток Pocket Option подключён",
		"Потік Pocket Option підключено",
		"Pocket Option feed connected"
	],
	"signal.disconnected": [
		"Нет подключения к Pocket Option",
		"Немає підключення до Pocket Option",
		"Pocket Option is disconnected"
	],
	"signal.telegramExpired": [
		"Сеанс Telegram истёк. Закройте и снова откройте Mini App из бота.",
		"Сеанс Telegram завершився. Закрийте й знову відкрийте Mini App із бота.",
		"The Telegram session expired. Close and reopen the Mini App from the bot."
	],
	"signal.streamInterrupted": [
		"Соединение с потоком котировок прервано. Переподключаемся…",
		"З’єднання з потоком котирувань перервано. Перепідключаємося…",
		"The quote stream was interrupted. Reconnecting…"
	],
	"signal.connecting": [
		"Подключаемся к Pocket Option…",
		"Підключаємося до Pocket Option…",
		"Connecting to Pocket Option…"
	],
	"signal.description": [
		"Проверяются только валютные пары с выплатой 92% и 80%. Выберите экспирацию от 30 секунд до 4 часов; ИИ напрямую анализирует свечи и выбирает направление.",
		"Перевіряються лише валютні пари з виплатою 92% і 80%. Оберіть експірацію від 30 секунд до 4 годин; ШІ безпосередньо аналізує свічки та обирає напрямок.",
		"Only currency pairs with 92% or 80% payout are checked. Choose an expiry from 30 seconds to 4 hours; AI directly analyzes the candles and selects a direction."
	],
	"signal.experimental": [
		"Самооценка уверенности ИИ субъективна: это не измеренная вероятность и не историческая проходимость. Результат не гарантирован.",
		"Самооцінка впевненості ШІ суб’єктивна: це не виміряна ймовірність і не історична прохідність. Результат не гарантовано.",
		"AI confidence is subjective, not a measured probability or historical hit rate. Outcomes are not guaranteed."
	],
	"signal.expiry": [
		"Время экспирации",
		"Час експірації",
		"Expiry time"
	],
	"batch.title": [
		"Тест точности · 20 серий",
		"Тест точності · 20 серій",
		"Accuracy test · 20 series"
	],
	"batch.description": [
		"Сигналы проверяются последовательно по реальным котировкам и сохраняются в истории этого браузера. Сделки не открываются.",
		"Сигнали перевіряються послідовно за реальними котируваннями та зберігаються в історії цього браузера. Угоди не відкриваються.",
		"Signals are checked sequentially against live quotes and saved in this browser’s history. No trades are placed."
	],
	"batch.start": [
		"Запустить тест из 20",
		"Запустити тест із 20",
		"Start 20-series test"
	],
	"batch.pause": [
		"Пауза",
		"Пауза",
		"Pause"
	],
	"batch.resume": [
		"Продолжить",
		"Продовжити",
		"Resume"
	],
	"batch.stop": [
		"Остановить",
		"Зупинити",
		"Stop"
	],
	"batch.running": [
		"Выполняется",
		"Виконується",
		"Running"
	],
	"batch.paused": [
		"На паузе",
		"На паузі",
		"Paused"
	],
	"batch.stopping": [
		"Завершает текущую серию",
		"Завершує поточну серію",
		"Finishing current series"
	],
	"batch.completed": [
		"Тест завершён",
		"Тест завершено",
		"Test completed"
	],
	"batch.stopped": [
		"Остановлен",
		"Зупинено",
		"Stopped"
	],
	"batch.progress": [
		"Серий завершено",
		"Серій завершено",
		"Series completed"
	],
	"batch.wins": [
		"Победы",
		"Перемоги",
		"Wins"
	],
	"batch.losses": [
		"Поражения",
		"Поразки",
		"Losses"
	],
	"batch.draws": [
		"Ничьи",
		"Нічиї",
		"Draws"
	],
	"batch.winRate": [
		"Проходимость",
		"Прохідність",
		"Win rate"
	],
	"batch.winRateHelp": [
		"По победам и поражениям; ничьи не учитываются",
		"За перемогами та поразками; нічиї не враховуються",
		"Based on wins and losses; draws are excluded"
	],
	"batch.retry": [
		"Следующая попытка через {seconds} с",
		"Наступна спроба через {seconds} с",
		"Next attempt in {seconds}s"
	],
	"batch.error": [
		"Пауза: {reason}",
		"Пауза: {reason}",
		"Paused: {reason}"
	],
	"batch.startFailed": [
		"Не удалось сохранить тест в локальном хранилище браузера.",
		"Не вдалося зберегти тест у локальному сховищі браузера.",
		"Could not save the test in this browser’s local storage."
	],
	"batch.series": [
		"Тестовая серия {current}/{total}",
		"Тестова серія {current}/{total}",
		"Test series {current}/{total}"
	],
	"signal.analyzed": [
		"Интервал свечи {period}; прямой анализ ИИ использует до 128 последних свечей.",
		"Інтервал свічки {period}; прямий аналіз ШІ використовує до 128 останніх свічок.",
		"Candle interval {period}; direct AI analysis uses up to the latest 128 candles."
	],
	"signal.checking": [
		"Проверяем пары…",
		"Перевіряємо пари…",
		"Checking pairs…"
	],
	"signal.searchFailed": [
		"Не удалось завершить поиск",
		"Не вдалося завершити пошук",
		"Signal search could not be completed"
	],
	"signal.tryAgain": [
		"Искать ещё раз",
		"Шукати ще раз",
		"Search again"
	],
	"signal.noSignalAtExpiry": [
		"На экспирации {expiry} ИИ не нашёл достаточно ясного сигнала. Направление не выдумываем.",
		"На експірації {expiry} ШІ не знайшов достатньо чіткого сигналу. Напрямок не вигадуємо.",
		"The AI found no clear signal for the {expiry} expiry. No direction was guessed."
	],
	"signal.reason": [
		"Почему сигнал не выдан",
		"Чому сигнал не надано",
		"Why no signal was issued"
	],
	"signal.alternativeSearchKicker": [
		"БЛИЖАЙШИЕ ЭКСПИРАЦИИ",
		"НАЙБЛИЖЧІ ЕКСПІРАЦІЇ",
		"NEARBY EXPIRIES"
	],
	"signal.alternativesChecking": [
		"Проверяем другие экспирации",
		"Перевіряємо інші експірації",
		"Checking other expiries"
	],
	"signal.alternativesCheckingBody": [
		"Проверяем ближайшие сроки. Покажем только варианты, где ИИ действительно выбрал пару и направление.",
		"Перевіряємо найближчі строки. Покажемо лише варіанти, де ШІ справді обрав пару та напрямок.",
		"Checking nearby durations. Only options where the AI actually selected a pair and direction will be shown."
	],
	"signal.alternativesFound": [
		"Сигнал найден на другой экспирации",
		"Сигнал знайдено на іншій експірації",
		"A signal was found at another expiry"
	],
	"signal.alternativesFoundBody": [
		"Выберите срок, чтобы показать пару. Перед выдачей направления ИИ проверит её ещё раз.",
		"Оберіть строк, щоб показати пару. Перед видачею напрямку ШІ перевірить її ще раз.",
		"Choose an expiry to reveal the pair. The AI will check it again before issuing a direction."
	],
	"signal.alternativePayout": [
		"Выплата {payout}%",
		"Виплата {payout}%",
		"{payout}% payout"
	],
	"signal.alternativeChoose": [
		"Выбрать срок и показать пару",
		"Обрати строк і показати пару",
		"Choose expiry and reveal pair"
	],
	"signal.alternativesNone": [
		"На проверенных сроках ясных сигналов тоже нет. Выберите другую экспирацию и запустите новый поиск.",
		"На перевірених строках чітких сигналів також немає. Оберіть іншу експірацію та запустіть новий пошук.",
		"No clear signals were found at the checked expiries either. Choose another expiry and search again."
	],
	"signal.alternativesPartial": [
		"Не все другие экспирации удалось проверить: {error}",
		"Не всі інші експірації вдалося перевірити: {error}",
		"Some alternative expiries could not be checked: {error}"
	],
	"signal.get": [
		"Получить сигнал",
		"Отримати сигнал",
		"Get a signal"
	],
	"signal.noLimit": [
		"Без лимита",
		"Без ліміту",
		"No limit"
	],
	"signal.pairReady": [
		"Пара выбрана",
		"Пару вибрано",
		"Pair selected"
	],
	"signal.pairChosen": [
		"Валютная пара выбрана",
		"Валютну пару вибрано",
		"Currency pair selected"
	],
	"signal.choosePair": [
		"Выберите эту пару у брокера. Направление появится после отсчёта.",
		"Оберіть цю пару у брокера. Напрямок з’явиться після відліку.",
		"Select this pair at your broker. The direction appears when the countdown ends."
	],
	"signal.countdownRemaining": [
		"Осталось {seconds} секунд",
		"Залишилося {seconds} секунд",
		"{seconds} seconds remaining"
	],
	"signal.countdownUnit": [
		"до сигнала",
		"до сигналу",
		"until the signal"
	],
	"signal.finalizing": [
		"Проверяем вход…",
		"Перевіряємо вхід…",
		"Checking the entry…"
	],
	"signal.analysisTimeout": [
		"Поиск сигнала не завершился за 20 секунд. Попробуйте ещё раз; сигнал не выдан.",
		"Пошук сигналу не завершився за 20 секунд. Спробуйте ще раз; сигнал не видано.",
		"Signal search did not finish within 20 seconds. Try again; no signal was issued."
	],
	"signal.pairNoLongerReady": [
		"При повторном анализе ИИ не подтвердил направление по этой паре. Получите новый сигнал.",
		"Під час повторного аналізу ШІ не підтвердив напрямок для цієї пари. Запросіть новий сигнал.",
		"The AI did not confirm a direction for this pair on reanalysis. Request a new signal."
	],
	"ai.title": [
		"ИИ выбрал направление",
		"ШІ обрав напрямок",
		"AI-selected direction"
	],
	"ai.explanation": [
		"Уверенность — самооценка ИИ, не измеренная вероятность выигрыша и не историческая статистика. Проходимость считается только по завершённым сигналам, сверенным с ценой Pocket Option.",
		"Впевненість — самооцінка ШІ, не виміряна ймовірність виграшу та не історична статистика. Прохідність обчислюється лише за завершеними сигналами, звіреними з ціною Pocket Option.",
		"Confidence is AI self-assessment, not a measured win probability or historical statistic. Hit rate uses only completed signals checked against Pocket Option prices."
	],
	"signal.today": [
		"Сегодня {used} из {cap}",
		"Сьогодні {used} із {cap}",
		"Today {used} of {cap}"
	],
	"signal.block.deposit": [
		"Депозит ещё не прочитан",
		"Депозит ще не зчитано",
		"Deposit has not been read yet"
	],
	"signal.block.minimum": [
		"Для сигналов нужен депозит от $60",
		"Для сигналів потрібен депозит від $60",
		"Signals require a deposit of at least $60"
	],
	"signal.block.limit": [
		"Лимит сигналов на сегодня закончился",
		"Ліміт сигналів на сьогодні вичерпано",
		"Today's signal limit has been reached"
	],
	"signal.none": [
		"Сейчас нет подходящего входа. Дождитесь следующей проверки.",
		"Зараз немає відповідного входу. Дочекайтеся наступної перевірки.",
		"No suitable entry right now. Wait for the next check."
	],
	"history.kicker": [
		"Журнал",
		"Журнал",
		"Journal"
	],
	"history.title": [
		"История сигналов",
		"Історія сигналів",
		"Signal history"
	],
	"history.description": [
		"Фактические исходы, сверенные с котировками Pocket Option. Старые сигналы без цены закрытия отмечаются как непроверенные.",
		"Фактичні результати, звірені з котируваннями Pocket Option. Старі сигнали без ціни закриття позначаються як неперевірені.",
		"Actual outcomes checked against Pocket Option quotes. Older signals without a recorded closing price are marked unverified."
	],
	"history.export": [
		"Экспорт CSV",
		"Експорт CSV",
		"Export CSV"
	],
	"history.breakEven": [
		"Порог безубыточности",
		"Поріг беззбитковості",
		"Break-even rate"
	],
	"history.breakEvenHelp": [
		"Расчёт по выплате записанных входов",
		"Розрахунок за виплатою записаних входів",
		"Based on recorded signal payouts"
	],
	"history.net": [
		"Условный итог",
		"Умовний підсумок",
		"Illustrative total"
	],
	"history.netHelp": [
		"Каждая запись считается ставкой 1 ед.",
		"Кожен запис рахується як ставка 1 од.",
		"Each entry is treated as a 1-unit stake"
	],
	"history.disclaimer": [
		"Это локальный журнал фактических исходов, не прогноз. Направление выбирает экспериментальная модель по свечам WebSocket и временной проверке; прошлые данные не гарантируют будущих результатов. Условный итог не учитывает суммы ставок, комиссии или перекрытия.",
		"Це локальний журнал фактичних результатів, а не прогноз. Напрямок обирає експериментальна модель за свічками WebSocket і часовою перевіркою; минулі дані не гарантують майбутніх результатів. Умовний підсумок не враховує суми ставок, комісії чи перекриття.",
		"This is a local record of actual outcomes, not a forecast. An experimental model chooses direction from WebSocket candles and time-based validation; past data does not guarantee future results. Illustrative totals exclude stake sizes, fees, and recovery trades."
	],
	"history.byPair": [
		"Разбивка по паре и сроку",
		"Розподіл за парою та строком",
		"By pair and expiry"
	],
	"history.draws": [
		"Ничьи не входят в проходимость",
		"Нічиї не входять до прохідності",
		"Draws are excluded from hit rate"
	],
	"history.hitRate": [
		"Проходимость",
		"Прохідність",
		"Hit rate"
	],
	"history.decided": [
		"решающих",
		"вирішальних",
		"decided"
	],
	"history.latest": [
		"Последние сигналы",
		"Останні сигнали",
		"Recent signals"
	],
	"history.lastOf": [
		"Последние {shown} из {total}",
		"Останні {shown} із {total}",
		"Latest {shown} of {total}"
	],
	"history.records": [
		"{total} записей",
		"{total} записів",
		"{total} records"
	],
	"history.loading": [
		"Загружаем журнал…",
		"Завантажуємо журнал…",
		"Loading history…"
	],
	"history.empty": [
		"Записей пока нет",
		"Записів поки немає",
		"No records yet"
	],
	"history.reading": [
		"Читаем сохранённые в этом браузере исходы.",
		"Читаємо збережені в цьому браузері результати.",
		"Reading outcomes saved in this browser."
	],
	"history.emptyHelp": [
		"Запись появится, когда сигнал завершится по котировке. Непроверенные сигналы не учитываются в проходимости.",
		"Запис з’явиться, коли сигнал завершиться за котируванням. Неперевірені сигнали не враховуються у прохідності.",
		"A result is recorded when a signal is settled against a quote. Unverified signals are excluded from the hit rate."
	],
	"history.goSignals": [
		"Перейти к сигналам",
		"До сигналів",
		"Go to signals"
	],
	"history.direction": [
		"Направление",
		"Напрямок",
		"Direction"
	],
	"history.up": [
		"Вверх",
		"Вгору",
		"Up"
	],
	"history.down": [
		"Вниз",
		"Вниз",
		"Down"
	],
	"history.price": [
		"Цена",
		"Ціна",
		"Price"
	],
	"history.payout": [
		"Выплата",
		"Виплата",
		"Payout"
	],
	"history.step": [
		"Попытка",
		"Спроба",
		"Attempt"
	],
	"history.attemptCount": [
		"{current} из {total}",
		"{current} із {total}",
		"{current} of {total}"
	],
	"history.batchSeries": [
		"Тестовая серия {current}/20",
		"Тестова серія {current}/20",
		"Test series {current}/20"
	],
	"history.units": [
		"ед.",
		"од.",
		"units"
	],
	"history.expiry": [
		"экспирация",
		"експірація",
		"expiry"
	],
	"history.candles": [
		"свечи",
		"свічки",
		"candles"
	],
	"outcome.pending": [
		"В ожидании",
		"Очікується",
		"Pending"
	],
	"outcome.unverified": [
		"Не проверен",
		"Не перевірено",
		"Unverified"
	],
	"outcome.overlay": [
		"Перекрытие",
		"Перекриття",
		"Recovery"
	],
	"outcome.win": [
		"Победа",
		"Перемога",
		"Win"
	],
	"outcome.loss": [
		"Поражение",
		"Поразка",
		"Loss"
	],
	"outcome.draw": [
		"Ничья",
		"Нічия",
		"Draw"
	],
	"calculator.title": [
		"Калькулятор риска",
		"Калькулятор ризику",
		"Risk calculator"
	],
	"calculator.subtitle": [
		"Сумма входа и план удвоения",
		"Сума входу та план подвоєння",
		"Stake size and doubling plan"
	],
	"calculator.balance": [
		"Баланс, $",
		"Баланс, $",
		"Balance, $"
	],
	"calculator.risk": [
		"Риск на сделку",
		"Ризик на угоду",
		"Risk per trade"
	],
	"calculator.recommended": [
		"Рекомендуемая сумма",
		"Рекомендована сума",
		"Suggested amount"
	],
	"calculator.save": [
		"Сохранить сумму",
		"Зберегти суму",
		"Save amount"
	],
	"calculator.saved": [
		"Сумма сохранена",
		"Суму збережено",
		"Amount saved"
	],
	"calculator.enterBalance": [
		"Введите баланс, чтобы посчитать вход.",
		"Введіть баланс, щоб розрахувати суму входу.",
		"Enter a balance to calculate a stake."
	],
	"calculator.plan": [
		"План удвоения",
		"План подвоєння",
		"Doubling plan"
	],
	"calculator.warning": [
		"Удвоение может перекрыть минус, но быстро съедает депозит. Дальше третьего шага лучше не идти.",
		"Подвоєння може перекрити мінус, але швидко зменшує депозит. Краще не йти далі третього кроку.",
		"Doubling may recover a loss but can quickly consume your deposit. Avoid going beyond the third step."
	],
	"common.back": [
		"Назад",
		"Назад",
		"Back"
	],
	"common.copied": [
		"Скопировано",
		"Скопійовано",
		"Copied"
	],
	"common.copy": [
		"Копировать",
		"Копіювати",
		"Copy"
	],
	"common.noSignal": [
		"Сигнала нет.",
		"Сигналу немає.",
		"No signal."
	],
	"common.categoryFx": [
		"Валюта",
		"Валюта",
		"Currency"
	],
	"common.signalChart": [
		"График свечей",
		"Графік свічок",
		"Candlestick chart"
	],
	"common.entryPrice": [
		"Цена входа",
		"Ціна входу",
		"Entry price"
	],
	"common.quoteActive": [
		"Котировки Pocket Option активны",
		"Котирування Pocket Option активні",
		"Pocket Option quotes are live"
	],
	"common.quoteUnavailable": [
		"Поток котировок недоступен",
		"Потік котирувань недоступний",
		"Quote feed unavailable"
	],
	"common.quoteWaiting": [
		"Ожидание котировки Pocket Option",
		"Очікування котирування Pocket Option",
		"Waiting for Pocket Option quote"
	],
	"common.waitQuote": [
		"ждём котировку",
		"очікуємо котирування",
		"waiting for quote"
	],
	"common.noChange": [
		"без изменения",
		"без змін",
		"unchanged"
	],
	"common.fromEntry": [
		"от входа",
		"від входу",
		"from entry"
	],
	"common.win": [
		"Победа",
		"Перемога",
		"Win"
	],
	"common.priceRose": [
		"Цена выросла",
		"Ціна зросла",
		"Price rose"
	],
	"common.priceFell": [
		"Цена упала",
		"Ціна впала",
		"Price fell"
	],
	"common.draw": [
		"Ничья",
		"Нічия",
		"Draw"
	],
	"common.refund": [
		"Возврат",
		"Повернення",
		"Refund"
	],
	"common.priceUnchanged": [
		"Цена не изменилась. Результат: ничья.",
		"Ціна не змінилася. Результат: нічия.",
		"Price was unchanged; the result is a draw."
	],
	"common.loss": [
		"Проигрыш",
		"Поразка",
		"Loss"
	],
	"common.prepareRecovery": [
		"Подготовьтесь к перекрытию",
		"Підготуйтеся до перекриття",
		"Prepare for the recovery trade"
	],
	"common.samePairAttempts": [
		"Та же пара. Осталось попыток: {count}",
		"Та сама пара. Спроб залишилося: {count}",
		"Same pair. Attempts left: {count}"
	],
	"common.recoveryStop": [
		"Все три перекрытия использованы. Проверьте журнал перед следующим запросом.",
		"Усі три перекриття використано. Перевірте журнал перед наступним запитом.",
		"All three overlays have been used. Review the journal before requesting another signal."
	],
	"common.skipEntry": [
		"Вход пропущен",
		"Вхід пропущено",
		"Entry skipped"
	],
	"common.notConfirmed": [
		"Новый сигнал не подтверждён",
		"Новий сигнал не підтверджено",
		"New signal not confirmed"
	],
	"common.skipReason": [
		"Фильтр не подтвердил повторный вход по этой паре. Новый сигнал не выдан; предыдущий результат сохранён в журнале.",
		"Фільтр не підтвердив повторний вхід за цією парою. Новий сигнал не надано; попередній результат збережено в журналі.",
		"The filter did not confirm another entry for this pair. No new signal was issued; the previous result is saved in history."
	],
	"common.openHistory": [
		"Открыть историю",
		"Відкрити історію",
		"Open history"
	],
	"common.toSignals": [
		"К сигналам",
		"До сигналів",
		"Back to signals"
	],
	"common.copyError": [
		"Не удалось скопировать название.",
		"Не вдалося скопіювати назву.",
		"Could not copy the pair name."
	],
	"common.cancel": [
		"Отмена",
		"Скасувати",
		"Cancel"
	],
	"learn.kicker": [
		"ОСНОВЫ РЫНКА",
		"ОСНОВИ РИНКУ",
		"MARKET BASICS"
	],
	"learn.title": [
		"Что такое тренд?",
		"Що таке тренд?",
		"What is a trend?"
	],
	"learn.intro": [
		"Главное, что нужно запомнить:",
		"Головне, що потрібно запам’ятати:",
		"Key points to remember:"
	],
	"profile.admin": [
		"Админ",
		"Адмін",
		"Admin"
	],
	"profile.title": [
		"Профиль",
		"Профіль",
		"Profile"
	],
	"profile.linkedTelegram": [
		"Этот Pocket ID закреплён за Telegram-аккаунтом, из которого открыт PRIME BOT. Изменить привязку с этого экрана нельзя.",
		"Цей Pocket ID закріплено за Telegram-акаунтом, з якого відкрито PRIME BOT. Змінити прив’язку на цьому екрані не можна.",
		"This Pocket ID is linked to the Telegram account used to open PRIME BOT. The link cannot be changed from this screen."
	],
	"profile.adminInfo": [
		"Админский ID. Лимита сигналов нет, депозит для входа не нужен.",
		"ID адміністратора. Ліміту сигналів немає, депозит для доступу не потрібен.",
		"Admin ID. No signal limit or minimum deposit is required."
	],
	"profile.userInfo": [
		"Тариф зависит от первого депозита. Базовый от $60 — 10 сигналов в день, Профессиональный от $200 — 40, Глубокий от $500 — без лимита.",
		"Тариф залежить від першого депозиту. Базовий від $60 — 10 сигналів на день, Професійний від $200 — 40, Глибокий від $500 — без ліміту.",
		"Your plan depends on the first deposit. Basic from $60: 10 signals/day; Professional from $200: 40; Deep from $500: unlimited."
	],
	"profile.currentLimit": [
		"Ваш персональный дневной лимит: {limit}.",
		"Ваш персональний денний ліміт: {limit}.",
		"Your personal daily limit: {limit}."
	],
	"profile.dailyCount": [
		"{count} сигналов в день",
		"{count} сигналів на день",
		"{count} signals per day"
	],
	"modal.title": [
		"Готовим сигнал",
		"Готуємо сигнал",
		"Preparing signal"
	],
	"modal.step1": [
		"Смотрим валютные пары",
		"Перевіряємо валютні пари",
		"Checking currency pairs"
	],
	"modal.step2": [
		"Сверяем последние свечи",
		"Зіставляємо останні свічки",
		"Checking recent candles"
	],
	"modal.step3": [
		"Оставляем подтверждённый вход",
		"Залишаємо підтверджений вхід",
		"Keeping a confirmed entry"
	],
	"gate.brand": [
		"PRIME BOT",
		"PRIME BOT",
		"PRIME BOT"
	],
	"gate.loadingAccess": [
		"Проверяем доступ через Telegram…",
		"Перевіряємо доступ через Telegram…",
		"Checking Telegram access…"
	],
	"gate.intro": [
		"Введите Pocket Option ID, чтобы проверить доступ к сигналам.",
		"Введіть Pocket Option ID, щоб перевірити доступ до сигналів.",
		"Enter your Pocket Option ID to check signal access."
	],
	"gate.id": [
		"Идентификатор Pocket Option",
		"Ідентифікатор Pocket Option",
		"Pocket Option identifier"
	],
	"gate.idHelp": [
		"Обычный ID из профиля Pocket Option состоит из 9 цифр; настроенные админ-ID принимаются отдельно. Партнёрская проверка не подтверждает владение счётом.",
		"Звичайний ID із профілю Pocket Option містить 9 цифр; налаштовані адмін-ID приймаються окремо. Партнерська перевірка не підтверджує володіння рахунком.",
		"Regular Pocket Option IDs have 9 digits; configured admin IDs are accepted separately. The partner API does not prove account ownership."
	],
	"gate.error": [
		"Идентификатор должен состоять ровно из 9 цифр",
		"Ідентифікатор має містити рівно 9 цифр",
		"The identifier must contain exactly 9 digits"
	],
	"gate.check": [
		"Проверить ID",
		"Перевірити ID",
		"Verify ID"
	],
	"gate.enterDigits": [
		"Введите 9 цифр",
		"Введіть 9 цифр",
		"Enter 9 digits"
	],
	"gate.checking": [
		"Проверяем…",
		"Перевіряємо…",
		"Checking…"
	],
	"gate.result.invalidId": [
		"Проверьте ID: нужны ровно 9 цифр.",
		"Перевірте ID: потрібно рівно 9 цифр.",
		"Check the ID: exactly 9 digits are required."
	],
	"gate.result.notRegistered": [
		"Регистрация по партнёрской ссылке не подтверждена. Убедитесь, что аккаунт создан по ссылке владельца PRIME BOT.",
		"Реєстрацію за партнерським посиланням не підтверджено. Переконайтеся, що акаунт створено за посиланням власника PRIME BOT.",
		"Registration through the partner link was not confirmed. Make sure the account was created through the PRIME BOT owner’s link."
	],
	"gate.result.depositRequired": [
		"Подтверждённый депозит пока не найден. Внесите депозит любого размера и повторите проверку позже.",
		"Підтверджений депозит поки не знайдено. Внесіть депозит будь-якого розміру й повторіть перевірку пізніше.",
		"No confirmed deposit was found yet. Make a deposit of any amount and try again later."
	],
	"gate.result.alreadyLinked": [
		"Этот Telegram-аккаунт или Pocket ID уже связан. Один Telegram-аккаунт — один Pocket ID, и один Pocket ID — один Telegram-аккаунт.",
		"Цей Telegram-акаунт або Pocket ID уже пов’язано. Один Telegram-акаунт — один Pocket ID, і один Pocket ID — один Telegram-акаунт.",
		"This Telegram account or Pocket ID is already linked. One Telegram account per Pocket ID, and one Pocket ID per Telegram account."
	],
	"gate.result.telegramRequired": [
		"Откройте PRIME BOT внутри Telegram, чтобы подтвердить ID.",
		"Відкрийте PRIME BOT у Telegram, щоб підтвердити ID.",
		"Open PRIME BOT inside Telegram to verify your ID."
	],
	"gate.result.rateLimited": [
		"Слишком много проверок. Попробуйте снова примерно через час.",
		"Забагато перевірок. Спробуйте ще раз приблизно за годину.",
		"Too many checks. Try again in about an hour."
	],
	"gate.result.unavailable": [
		"Не удалось проверить данные сейчас. Попробуйте позже.",
		"Не вдалося перевірити дані зараз. Спробуйте пізніше.",
		"We couldn’t verify the details right now. Please try again later."
	]
};
var LanguageContext = (0, import_react.createContext)(null);
var STORAGE_KEY$2 = "prime_bot_language";
var languageIndex = {
	ru: 0,
	uk: 1,
	en: 2
};
function isLanguage(value) {
	return value === "ru" || value === "uk" || value === "en";
}
function LanguageProvider({ children }) {
	const [language, setLanguage] = (0, import_react.useState)("ru");
	(0, import_react.useEffect)(() => {
		try {
			const saved = window.localStorage.getItem(STORAGE_KEY$2);
			if (isLanguage(saved)) setLanguage(saved);
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.lang = language;
		try {
			window.localStorage.setItem(STORAGE_KEY$2, language);
		} catch {}
	}, [language]);
	const value = (0, import_react.useMemo)(() => ({
		language,
		setLanguage,
		t: (key, values) => {
			let result = copy[key][languageIndex[language]];
			for (const [name, value] of Object.entries(values ?? {})) result = result.replaceAll(`{${name}}`, String(value));
			return result;
		}
	}), [language]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageContext.Provider, {
		value,
		children
	});
}
function useLanguage() {
	const value = (0, import_react.useContext)(LanguageContext);
	if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
	return value;
}
function formatExpiryForLanguage(seconds, language) {
	if (seconds === 30) return language === "en" ? "30 sec" : language === "uk" ? "30 с" : "30 сек";
	const totalMinutes = Math.max(1, Math.round(seconds / 60));
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	const hourUnit = language === "en" ? "h" : language === "uk" ? "год" : "ч";
	const minuteUnit = language === "en" ? "min" : language === "uk" ? "хв" : "мин";
	if (hours && minutes) return `${hours} ${hourUnit} ${minutes} ${minuteUnit}`;
	if (hours) return `${hours} ${hourUnit}`;
	return `${totalMinutes} ${minuteUnit}`;
}
function BrandName({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `font-bold tracking-tight ${className}`,
		children: ["PRIME ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-blue-soft",
			children: "BOT"
		})]
	});
}
var readInitData = (input) => typeof input?.initData === "string" && input.initData.length <= 1e4 ? input.initData : "";
var getPocketGateState = createServerFn({ method: "POST" }).validator((input) => ({ initData: readInitData(input) })).handler(createSsrRpc("b900180c993554286d82dd224bf57a5fc610cd2c0e205fb2e89f79e8fa4a3641"));
var verifyPocketAccount = createServerFn({ method: "POST" }).validator((input) => ({
	pocketId: typeof input?.pocketId === "string" ? input.pocketId.trim() : "",
	initData: readInitData(input)
})).handler(createSsrRpc("aac57122ce5b3a8923821121771eb8cb948eb3f0ce20a93ea73c801a87060f96"));
var GATE_REQUEST_TIMEOUT_MS = 12e3;
function isPocketId(value) {
	return isValidPocketOptionId(value);
}
function settleWithin(promise, fallback, timeoutMs) {
	return new Promise((resolve) => {
		let settled = false;
		const finish = (value) => {
			if (settled) return;
			settled = true;
			window.clearTimeout(timer);
			resolve(value);
		};
		const timer = window.setTimeout(() => finish(fallback), timeoutMs);
		promise.then(finish, () => finish(fallback));
	});
}
var PocketContext = (0, import_react.createContext)(null);
function PocketProvider({ children }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [id, setId] = (0, import_react.useState)(null);
	const [depositAmount, setDepositAmount] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		try {
			localStorage.removeItem("pocket_option_id");
		} catch {}
		const inTelegram = initializeTelegramWebApp();
		const initData = getTelegramInitData();
		if (!inTelegram || !initData) {
			setReady(true);
			return () => {
				cancelled = true;
			};
		}
		const loadingTimeout = window.setTimeout(() => {
			if (!cancelled) setReady(true);
		}, 1500);
		try {
			getPocketGateState({ data: { initData } }).then((state) => {
				if (!cancelled && state.status === "verified" && isPocketId(state.pocketId)) {
					setId(state.pocketId);
					setDepositAmount(state.depositAmount);
				}
			}).catch(() => {
				if (!cancelled) setId(null);
			}).finally(() => {
				window.clearTimeout(loadingTimeout);
				if (!cancelled) setReady(true);
			});
		} catch {
			window.clearTimeout(loadingTimeout);
			setReady(true);
		}
		return () => {
			cancelled = true;
			window.clearTimeout(loadingTimeout);
		};
	}, []);
	const accept = (next, nextDepositAmount) => {
		const trimmed = next.trim();
		if (!isPocketId(trimmed)) return;
		setId(trimmed);
		setDepositAmount(nextDepositAmount);
	};
	const verifyAccount = async (next) => {
		const trimmed = next.trim();
		if (!isPocketId(trimmed)) return { status: "invalid_id" };
		const initData = getTelegramInitData();
		if (!initData) return { status: "telegram_required" };
		try {
			const result = await settleWithin(verifyPocketAccount({ data: {
				pocketId: trimmed,
				initData
			} }), { status: "check_unavailable" }, GATE_REQUEST_TIMEOUT_MS);
			if (result.status === "verified") {
				setId(result.pocketId);
				setDepositAmount(result.depositAmount);
			}
			return result;
		} catch {
			return { status: "check_unavailable" };
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PocketContext.Provider, {
		value: {
			ready,
			id,
			depositAmount,
			accept,
			verifyAccount
		},
		children
	});
}
function usePocket() {
	const value = (0, import_react.useContext)(PocketContext);
	if (!value) throw new Error("Pocket session missing");
	return value;
}
var resultKeys = {
	invalid_id: "gate.result.invalidId",
	not_registered: "gate.result.notRegistered",
	deposit_required: "gate.result.depositRequired",
	already_linked: "gate.result.alreadyLinked",
	telegram_required: "gate.result.telegramRequired",
	rate_limited: "gate.result.rateLimited",
	check_unavailable: "gate.result.unavailable"
};
function Gate() {
	const { language, setLanguage, t } = useLanguage();
	const { accept, verifyAccount } = usePocket();
	const [value, setValue] = (0, import_react.useState)("");
	const [result, setResult] = (0, import_react.useState)("");
	const [checking, setChecking] = (0, import_react.useState)(false);
	const ready = isPocketId(value);
	const submit = async () => {
		if (!ready) {
			setResult("gate.error");
			return;
		}
		setChecking(true);
		setResult("");
		try {
			const verification = await verifyAccount(value);
			if (verification.status === "verified") accept(verification.pocketId, verification.depositAmount);
			else setResult(resultKeys[verification.status]);
		} catch {
			setResult("gate.result.unavailable");
		} finally {
			setChecking(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "stage flex min-h-dvh items-center justify-center px-4 py-10 pb-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						"aria-label": t("language.label"),
						title: t("language.label"),
						"data-testid": "select-gate-language",
						value: language,
						onChange: (event) => setLanguage(event.target.value),
						className: "h-9 rounded-full border border-white/10 bg-[#111723] px-3 text-xs font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-blue-soft",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "ru",
								children: "RU"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "uk",
								children: "UA"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "en",
								children: "EN"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rise text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold tracking-[0.18em] text-blue-soft",
							children: t("gate.brand")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandName, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-3 max-w-sm text-base leading-relaxed text-muted",
							children: t("gate.intro")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "panel rise rise-1 mt-6 space-y-4 p-5",
					onSubmit: (event) => {
						event.preventDefault();
						submit();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-semibold text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4 text-blue-soft" }), t("gate.id")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "pocket-help",
							className: "text-sm leading-relaxed text-dim",
							children: t("gate.idHelp")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "pocket-id",
								inputMode: "numeric",
								autoComplete: "off",
								maxLength: 9,
								"aria-describedby": result ? "pocket-help pocket-result" : "pocket-help",
								"aria-invalid": result === "gate.error" || result === "gate.result.invalidId",
								"data-testid": "input-gate-pocket-id",
								placeholder: "123456789",
								value,
								onChange: (event) => {
									setValue(event.target.value.replace(/\D/g, "").slice(0, 9));
									if (result) setResult("");
								},
								className: "field h-14 px-4 pr-14 text-center font-mono text-xl font-semibold tracking-[0.28em] placeholder:tracking-[0.28em] placeholder:text-dim/40"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-testid": "status-gate-id-length",
								className: `absolute top-1/2 right-4 -translate-y-1/2 font-mono text-xs font-semibold ${ready ? "text-blue-soft" : "text-dim"}`,
								children: [value.length, "/9"]
							})]
						}),
						result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "pocket-result",
							role: "alert",
							"aria-live": "polite",
							"data-testid": `status-gate-${result.replaceAll(".", "-")}`,
							className: "text-sm leading-relaxed text-loss",
							children: t(result)
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							className: "btn-prime w-full",
							disabled: !ready || checking,
							"data-testid": "button-gate-verify",
							children: [checking ? t("gate.checking") : ready ? t("gate.check") : t("gate.enterDigits"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						})
					]
				})
			]
		})
	});
}
var loadFeed = createServerFn({ method: "GET" }).middleware([pocketGateMiddleware]).handler(createSsrRpc("fb07d0a82ccd0e21eb307fec3024649c271630507c2eb15012c43274deadb043"));
var readClose = createServerFn({ method: "POST" }).middleware([pocketGateMiddleware]).validator((input) => {
	const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) throw new Error("Пара недоступна.");
	return { symbol };
}).handler(createSsrRpc("c3bf91de64f793a1fdff73992de93db6878fb230b41776a1663843f0dd5e02d1"));
var takeSignal = createServerFn({ method: "POST" }).middleware([pocketGateMiddleware]).validator((input) => {
	const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
	const expirySeconds = Number(input?.expirySeconds);
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol) || !isValidExpirySeconds(expirySeconds)) throw new Error("Выберите пару и срок экспирации от 30 секунд до 4 часов.");
	return {
		symbol,
		expirySeconds
	};
}).handler(createSsrRpc("e7eabc0cd6ed805a34adcafedfe18f606c2fbbb009e971fe08cadbcf71358857"));
var confirmSignalEntry = createServerFn({ method: "POST" }).middleware([pocketGateMiddleware]).validator((input) => {
	const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) throw new Error("Пара недоступна.");
	return { symbol };
}).handler(createSsrRpc("8d16ab25d49de3ba563bd027483e243a7e3dc42cde9f9a502b86bdc62ed38062"));
var chooseSignalPair = createServerFn({ method: "POST" }).middleware([pocketGateMiddleware]).validator((input) => {
	return { excludedSymbols: Array.isArray(input?.excludedSymbols) ? [...new Set(input.excludedSymbols.filter((symbol) => typeof symbol === "string" && /^[#A-Za-z0-9._-]{2,32}$/.test(symbol.trim())).map((symbol) => symbol.trim()))].slice(0, 24) : [] };
}).handler(createSsrRpc("4cc8a698b27084a764e9f2f4554eb5fdebf61fc3dead4a697775e5341ebfd84e"));
createServerFn({ method: "POST" }).middleware([pocketGateMiddleware]).validator((input) => {
	const expirySeconds = Number(input?.expirySeconds);
	if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 30 секунд до 4 часов.");
	return {
		expirySeconds,
		excludedSymbols: Array.isArray(input?.excludedSymbols) ? [...new Set(input.excludedSymbols.filter((symbol) => typeof symbol === "string" && /^[#A-Za-z0-9._-]{2,32}$/.test(symbol.trim())).map((symbol) => symbol.trim()))].slice(0, 24) : []
	};
}).handler(createSsrRpc("65a316e774e0ea4a3bef3cd70e45365d003566e62fb4f915e8f227872abf97ab"));
function signalBatchWinRate(batch) {
	const decisiveOutcomes = batch.wins + batch.losses;
	return decisiveOutcomes === 0 ? null : batch.wins / decisiveOutcomes * 100;
}
var STORAGE_KEY$1 = "prime_signal_batch_v1";
var BATCH_EVENT = "prime:signal-batch-updated";
var statuses = /* @__PURE__ */ new Set([
	"running",
	"stopping",
	"paused",
	"completed",
	"stopped"
]);
function storage$1() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function normalizeBatch(value) {
	if (typeof value !== "object" || value === null) return null;
	const batch = value;
	if (typeof batch.id !== "string" || !statuses.has(batch.status) || !Number.isFinite(batch.expirySeconds) || !isValidExpirySeconds(Number(batch.expirySeconds)) || !Number.isFinite(batch.startedAt)) return null;
	const target = 20;
	const completed = Math.max(0, Math.min(target, Math.floor(Number(batch.completed) || 0)));
	return {
		id: batch.id,
		status: batch.status,
		target,
		completed,
		expirySeconds: Number(batch.expirySeconds),
		startedAt: Number(batch.startedAt),
		...Number.isFinite(batch.finishedAt) ? { finishedAt: Number(batch.finishedAt) } : {},
		wins: Math.max(0, Math.floor(Number(batch.wins) || 0)),
		losses: Math.max(0, Math.floor(Number(batch.losses) || 0)),
		draws: Math.max(0, Math.floor(Number(batch.draws) || 0)),
		consecutiveFailures: Math.max(0, Math.floor(Number(batch.consecutiveFailures) || 0)),
		nextAttemptAt: Number.isFinite(batch.nextAttemptAt) ? Number(batch.nextAttemptAt) : Number(batch.startedAt),
		...typeof batch.lastError === "string" && batch.lastError.trim() ? { lastError: batch.lastError.trim().slice(0, 500) } : {}
	};
}
function writeSignalBatch(batch) {
	const local = storage$1();
	if (!local) return false;
	try {
		local.setItem(STORAGE_KEY$1, JSON.stringify(batch));
		window.dispatchEvent(new Event(BATCH_EVENT));
		return true;
	} catch {
		return false;
	}
}
function readSignalBatch() {
	const local = storage$1();
	if (!local) return null;
	try {
		const raw = local.getItem(STORAGE_KEY$1);
		return raw ? normalizeBatch(JSON.parse(raw)) : null;
	} catch {
		return null;
	}
}
function completeSignalBatchAttempt(id, position, outcome, now = Date.now()) {
	const batch = readSignalBatch();
	if (!batch || batch.id !== id || batch.status !== "running" && batch.status !== "stopping" && batch.status !== "paused" || position !== batch.completed + 1) return batch;
	const completed = batch.completed + 1;
	const next = {
		...batch,
		status: batch.status === "stopping" ? "stopped" : completed >= batch.target ? "completed" : batch.status === "paused" ? "paused" : "running",
		completed,
		wins: batch.wins + Number(outcome === "win"),
		losses: batch.losses + Number(outcome === "loss"),
		draws: batch.draws + Number(outcome === "draw"),
		consecutiveFailures: 0,
		nextAttemptAt: now,
		lastError: void 0,
		...completed >= batch.target || batch.status === "stopping" ? { finishedAt: now } : {}
	};
	return writeSignalBatch(next) ? next : batch;
}
function pauseSignalBatch(id, reason) {
	const batch = readSignalBatch();
	if (!batch || batch.id !== id || batch.status !== "running" && batch.status !== "stopping") return batch;
	const next = {
		...batch,
		status: "paused",
		lastError: reason.trim().slice(0, 500) || "Пакетный тест приостановлен."
	};
	return writeSignalBatch(next) ? next : batch;
}
function requestSignalBatchStop(hasActiveAttempt, now = Date.now()) {
	const batch = readSignalBatch();
	if (!batch || batch.status !== "running" && batch.status !== "paused") return batch;
	const next = {
		...batch,
		status: hasActiveAttempt ? "stopping" : "stopped",
		...hasActiveAttempt ? {} : { finishedAt: now }
	};
	return writeSignalBatch(next) ? next : batch;
}
function subscribeToSignalBatch(listener) {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(BATCH_EVENT, listener);
	window.addEventListener("storage", listener);
	return () => {
		window.removeEventListener(BATCH_EVENT, listener);
		window.removeEventListener("storage", listener);
	};
}
var STORAGE_KEY = "vprime_signal_journal_v1";
var JOURNAL_EVENT = "vprime:signal-journal-updated";
var MAX_ENTRIES = 500;
var groups$1 = /* @__PURE__ */ new Set([
	"fx",
	"crypto",
	"stock",
	"commodity"
]);
var outcomes = /* @__PURE__ */ new Set([
	"pending",
	"unverified",
	"win",
	"loss",
	"draw",
	"overlay"
]);
function classifySignalAttempt(direction, move, step) {
	if (move === 0) return "draw";
	if (direction === "call" ? move > 0 : move < 0) return "win";
	return step < 3 ? "overlay" : "loss";
}
function signalRecordId(signal) {
	return `${signal.startedAt}:${signal.step}:${signal.symbol}`;
}
function storage() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function normalizeEntry(value) {
	if (!value || typeof value !== "object") return null;
	const entry = value;
	if (typeof entry.id !== "string" || typeof entry.symbol !== "string" || typeof entry.name !== "string" || !groups$1.has(entry.group) || entry.direction !== "call" && entry.direction !== "put" || !outcomes.has(entry.outcome) || !Number.isFinite(entry.openPrice) || !Number.isFinite(entry.payout) || !Number.isFinite(entry.seconds) || !Number.isFinite(entry.startedAt) || !Number.isFinite(entry.step)) return null;
	const bars = Array.isArray(entry.bars) ? entry.bars.filter((bar) => Array.isArray(bar) && bar.length === 4 && bar.every((price) => Number.isFinite(price))).slice(-32) : [];
	const seconds = Math.max(60, Math.min(14400, Math.round(Number(entry.seconds) / 60) * 60));
	const legacyAnalysisSeconds = [
		60,
		120,
		180,
		300,
		900
	].includes(seconds) ? seconds : analysisPeriodForExpiry(seconds);
	const providedAnalysisSeconds = Number(entry.analysisSeconds);
	const analysisSeconds = ANALYSIS_PERIODS_SECONDS.includes(providedAnalysisSeconds) ? providedAnalysisSeconds : legacyAnalysisSeconds;
	return {
		id: entry.id,
		symbol: entry.symbol,
		name: entry.name,
		group: entry.group,
		direction: entry.direction,
		openPrice: Number(entry.openPrice),
		...Number.isFinite(entry.closePrice) ? { closePrice: Number(entry.closePrice) } : {},
		payout: Math.max(0, Math.min(100, Number(entry.payout))),
		seconds,
		analysisSeconds,
		step: Math.max(0, Math.min(3, Number(entry.step))),
		startedAt: Number(entry.startedAt),
		...Number.isFinite(entry.settledAt) ? { settledAt: Number(entry.settledAt) } : {},
		...typeof entry.batchRunId === "string" && entry.batchRunId.length <= 120 ? { batchRunId: entry.batchRunId } : {},
		...Number.isFinite(entry.batchPosition) ? { batchPosition: Math.max(1, Math.min(20, Math.floor(Number(entry.batchPosition)))) } : {},
		outcome: entry.outcome,
		...Number.isFinite(entry.ruleScore) ? { ruleScore: Number(entry.ruleScore) } : {},
		...Number.isFinite(entry.aiConfidence) ? { aiConfidence: Math.max(0, Math.min(100, Math.round(Number(entry.aiConfidence)))) } : {},
		...Number.isFinite(entry.aiProbability) ? { aiProbability: Math.max(0, Math.min(1, Number(entry.aiProbability))) } : {},
		...Number.isFinite(entry.aiExpectedValue) ? { aiExpectedValue: Number(entry.aiExpectedValue) } : {},
		...Number.isFinite(entry.aiBrierScore) ? { aiBrierScore: Number(entry.aiBrierScore) } : {},
		...Number.isFinite(entry.aiBaselineBrier) ? { aiBaselineBrier: Number(entry.aiBaselineBrier) } : {},
		...Number.isFinite(entry.aiSamples) ? { aiSamples: Math.max(0, Number(entry.aiSamples)) } : {},
		...Number.isFinite(entry.aiValidationTrades) ? { aiValidationTrades: Math.max(0, Number(entry.aiValidationTrades)) } : {},
		...Number.isFinite(entry.aiValidationReturn) ? { aiValidationReturn: Number(entry.aiValidationReturn) } : {},
		strategyVersion: typeof entry.strategyVersion === "string" ? entry.strategyVersion : "unknown",
		note: typeof entry.note === "string" ? entry.note.slice(0, 4e3) : "",
		bars
	};
}
function totalsFromEntries(entries) {
	return {
		fx: totalsForGroup(entries, "fx"),
		crypto: totalsForGroup(entries, "crypto"),
		stock: totalsForGroup(entries, "stock"),
		commodity: totalsForGroup(entries, "commodity")
	};
}
function totalsForGroup(entries, group) {
	const summary = summarizeSignals(entries.filter((entry) => entry.group === group));
	return {
		settled: summary.settled,
		wins: summary.wins,
		losses: summary.losses,
		draws: summary.draws,
		hitRate: summary.hitRate
	};
}
function normalizeStoredTotals(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	const count = (input) => Number.isFinite(input) && Number(input) >= 0 ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number(input))) : null;
	const normalized = {};
	for (const group of groups$1) {
		const rawGroup = candidate[group];
		if (typeof rawGroup !== "object" || rawGroup === null) return null;
		const groupTotals = rawGroup;
		const wins = count(groupTotals.wins);
		const losses = count(groupTotals.losses);
		const draws = count(groupTotals.draws);
		if (wins === null || losses === null || draws === null) return null;
		const decided = wins + losses;
		normalized[group] = {
			settled: wins + losses + draws,
			wins,
			losses,
			draws,
			hitRate: decided > 0 ? wins / decided * 100 : null
		};
	}
	return normalized;
}
function emptyStoredTotals() {
	const empty = {
		settled: 0,
		wins: 0,
		losses: 0,
		draws: 0,
		hitRate: null
	};
	return {
		fx: { ...empty },
		crypto: { ...empty },
		stock: { ...empty },
		commodity: { ...empty }
	};
}
function isCountedOutcome(outcome) {
	return outcome === "win" || outcome === "loss" || outcome === "draw";
}
function readStoredSignalJournal(local) {
	const raw = local.getItem(STORAGE_KEY);
	if (!raw) return null;
	const decoded = JSON.parse(raw);
	const envelope = typeof decoded === "object" && decoded !== null && !Array.isArray(decoded) && decoded.version === 2 ? decoded : null;
	const rawEntries = Array.isArray(decoded) ? decoded : envelope?.entries;
	if (!Array.isArray(rawEntries)) return null;
	const entries = rawEntries.map(normalizeEntry).filter((entry) => entry !== null).sort((a, b) => b.startedAt - a.startedAt).slice(0, MAX_ENTRIES);
	return {
		entries,
		totals: normalizeStoredTotals(envelope?.totals) ?? totalsFromEntries(entries)
	};
}
function readSignalJournal() {
	const local = storage();
	if (!local) return [];
	try {
		return readStoredSignalJournal(local)?.entries ?? [];
	} catch {
		return [];
	}
}
function readSignalJournalTotals(group = "fx") {
	const local = storage();
	if (!local) return emptyStoredTotals()[group];
	try {
		return readStoredSignalJournal(local)?.totals[group] ?? emptyStoredTotals()[group];
	} catch {
		return emptyStoredTotals()[group];
	}
}
function writeSignalJournal(entries) {
	const local = storage();
	if (!local) return false;
	try {
		const previous = readStoredSignalJournal(local);
		const nextEntries = entries.slice(0, MAX_ENTRIES);
		const previousById = new Map((previous?.entries ?? []).map((entry) => [entry.id, entry]));
		const nextTotals = { ...previous?.totals ?? emptyStoredTotals() };
		for (const entry of nextEntries) {
			const priorOutcome = previousById.get(entry.id)?.outcome;
			if (!isCountedOutcome(priorOutcome) && isCountedOutcome(entry.outcome)) {
				const groupTotals = nextTotals[entry.group];
				const wins = groupTotals.wins + Number(entry.outcome === "win");
				const losses = groupTotals.losses + Number(entry.outcome === "loss");
				const draws = groupTotals.draws + Number(entry.outcome === "draw");
				const decided = wins + losses;
				nextTotals[entry.group] = {
					settled: wins + losses + draws,
					wins,
					losses,
					draws,
					hitRate: decided > 0 ? wins / decided * 100 : null
				};
			}
		}
		local.setItem(STORAGE_KEY, JSON.stringify({
			version: 2,
			entries: nextEntries,
			totals: nextTotals
		}));
		if (typeof window !== "undefined") window.dispatchEvent(new Event(JOURNAL_EVENT));
		return true;
	} catch {
		return false;
	}
}
function recordSignalStarted(signal) {
	const entry = normalizeEntry({
		...signal,
		outcome: "pending"
	});
	if (!entry) return false;
	const entries = readSignalJournal();
	if (entries.some((saved) => saved.id === entry.id)) return true;
	return writeSignalJournal([entry, ...entries].sort((a, b) => b.startedAt - a.startedAt));
}
function recordSignalOutcome(id, closePrice, outcome) {
	if (!Number.isFinite(closePrice)) return false;
	const entries = readSignalJournal();
	const index = entries.findIndex((entry) => entry.id === id);
	if (index < 0) return false;
	if (entries[index].outcome !== "pending") return entries[index].outcome === outcome;
	const next = [...entries];
	next[index] = {
		...next[index],
		closePrice,
		outcome,
		settledAt: Date.now()
	};
	return writeSignalJournal(next);
}
function markExpiredPendingSignals(now = Date.now(), graceMs = 12e4) {
	const entries = readSignalJournal();
	let changed = false;
	const next = entries.map((entry) => {
		if (entry.outcome !== "pending" || now <= entry.startedAt + entry.seconds * 1e3 + graceMs) return entry;
		changed = true;
		return {
			...entry,
			outcome: "unverified"
		};
	});
	if (changed) writeSignalJournal(next);
	return changed ? next : entries;
}
function markSignalUnverified(id, settledAt = Date.now()) {
	const entries = readSignalJournal();
	const index = entries.findIndex((entry) => entry.id === id);
	if (index < 0) return false;
	if (entries[index].outcome !== "pending") return entries[index].outcome === "unverified";
	const next = [...entries];
	next[index] = {
		...next[index],
		outcome: "unverified",
		settledAt
	};
	return writeSignalJournal(next);
}
function summarizeSignals(entries) {
	let wins = 0;
	let losses = 0;
	let draws = 0;
	let pending = 0;
	let unverified = 0;
	let netUnits = 0;
	let breakEvenTotal = 0;
	let decided = 0;
	for (const entry of entries) {
		if (entry.outcome === "pending") {
			pending += 1;
			continue;
		}
		if (entry.outcome === "overlay") continue;
		if (entry.outcome === "unverified") {
			unverified += 1;
			continue;
		}
		if (entry.outcome === "draw") {
			draws += 1;
			continue;
		}
		decided += 1;
		breakEvenTotal += 100 / (100 + entry.payout);
		if (entry.outcome === "win") {
			wins += 1;
			netUnits += entry.payout / 100;
		} else {
			losses += 1;
			netUnits -= 1;
		}
	}
	const settled = wins + losses + draws;
	return {
		total: entries.length,
		settled,
		pending,
		unverified,
		wins,
		losses,
		draws,
		decided,
		hitRate: decided > 0 ? wins / decided * 100 : null,
		breakEvenRate: decided > 0 ? breakEvenTotal / decided * 100 : null,
		netUnits
	};
}
function summarizeByMarket(entries) {
	const buckets = /* @__PURE__ */ new Map();
	for (const entry of entries) {
		const key = `${entry.symbol}\u0000${entry.seconds}`;
		buckets.set(key, [...buckets.get(key) ?? [], entry]);
	}
	return [...buckets.values()].map((group) => ({
		symbol: group[0].symbol,
		name: group[0].name,
		seconds: group[0].seconds,
		summary: summarizeSignals(group)
	})).sort((a, b) => b.summary.decided - a.summary.decided || a.name.localeCompare(b.name) || a.seconds - b.seconds);
}
function recentlyUsedSignalSymbols(entries, now = Date.now(), cooldownMs = 9e5, limit = 12) {
	const recent = entries.filter((entry) => {
		if (entry.group !== "fx") return false;
		if (entry.outcome === "pending") return true;
		return (entry.settledAt ?? entry.startedAt) >= now - cooldownMs;
	}).sort((a, b) => (b.settledAt ?? b.startedAt) - (a.settledAt ?? a.startedAt) || b.startedAt - a.startedAt);
	const symbols = /* @__PURE__ */ new Set();
	for (const entry of recent) {
		symbols.add(entry.symbol);
		if (symbols.size >= Math.max(0, Math.min(24, Math.floor(limit)))) break;
	}
	return [...symbols];
}
function subscribeToSignalJournal(listener) {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(JOURNAL_EVENT, listener);
	window.addEventListener("storage", listener);
	return () => {
		window.removeEventListener(JOURNAL_EVENT, listener);
		window.removeEventListener("storage", listener);
	};
}
function signalJournalCsv(entries) {
	const columns = [
		["startedAt", (entry) => new Date(entry.startedAt).toISOString()],
		["batchRunId", (entry) => entry.batchRunId ?? ""],
		["batchPosition", (entry) => entry.batchPosition ?? ""],
		["symbol", (entry) => entry.symbol],
		["name", (entry) => entry.name],
		["direction", (entry) => entry.direction],
		["seconds", (entry) => entry.seconds],
		["analysisSeconds", (entry) => entry.analysisSeconds],
		["payout", (entry) => entry.payout],
		["openPrice", (entry) => entry.openPrice],
		["closePrice", (entry) => entry.closePrice ?? ""],
		["outcome", (entry) => entry.outcome],
		["step", (entry) => entry.step],
		["ruleScore", (entry) => entry.ruleScore ?? ""],
		["aiConfidence", (entry) => entry.aiConfidence ?? ""],
		["aiProbability", (entry) => entry.aiProbability ?? ""],
		["aiExpectedValue", (entry) => entry.aiExpectedValue ?? ""],
		["aiBrierScore", (entry) => entry.aiBrierScore ?? ""],
		["aiBaselineBrier", (entry) => entry.aiBaselineBrier ?? ""],
		["aiSamples", (entry) => entry.aiSamples ?? ""],
		["aiValidationTrades", (entry) => entry.aiValidationTrades ?? ""],
		["aiValidationReturn", (entry) => entry.aiValidationReturn ?? ""],
		["strategyVersion", (entry) => entry.strategyVersion],
		["candles", (entry) => JSON.stringify(entry.bars)]
	];
	const quote = (value) => `"${String(value).replaceAll("\"", "\"\"")}"`;
	return [columns.map(([name]) => quote(name)).join(","), ...entries.map((entry) => columns.map(([, read]) => quote(read(entry))).join(","))].join("\r\n");
}
var links = [
	{
		to: "/",
		label: "nav.signals",
		icon: LayoutDashboard
	},
	{
		to: "/history",
		label: "nav.history",
		icon: History
	},
	{
		to: "/learn",
		label: "nav.learn",
		icon: GraduationCap
	},
	{
		to: "/profile",
		label: "nav.profile",
		icon: UserRound
	}
];
function Shell({ children }) {
	const path = useRouterState({ select: (state) => state.location.pathname });
	const navigate = useNavigate();
	const { id } = usePocket();
	const { language, setLanguage, t } = useLanguage();
	const admin = isAdminId(id);
	const [levelName, setLevelName] = (0, import_react.useState)("");
	const pathRef = (0, import_react.useRef)(path);
	(0, import_react.useEffect)(() => {
		pathRef.current = path;
	}, [path]);
	(0, import_react.useEffect)(() => {
		const batch = readSignalBatch();
		if (batch?.status === "running" && batch.completed < batch.target && path !== "/" && path !== "/signal") navigate({ to: "/" });
	}, [navigate, path]);
	(0, import_react.useEffect)(() => {
		let stop = false;
		const pull = () => {
			loadFeed().then((feed) => {
				if (stop || feed.balance === null) return;
				if (admin) return;
				const level = [...levels].reverse().find((item) => feed.balance !== null && feed.balance >= item.deposit);
				setLevelName(level ? `${level.name} · $${level.deposit}` : "");
			}).catch(() => {});
		};
		pull();
		const timer = window.setInterval(pull, 8e3);
		return () => {
			stop = true;
			window.clearInterval(timer);
		};
	}, [admin]);
	(0, import_react.useEffect)(() => {
		let stopped = false;
		let busy = false;
		const lastAttempt = /* @__PURE__ */ new Map();
		const settleExpired = async () => {
			if (stopped || busy || pathRef.current === "/signal") return;
			busy = true;
			const now = Date.now();
			try {
				const previouslyPending = readSignalJournal().filter((entry) => entry.outcome === "pending");
				for (const entry of previouslyPending) if (entry.batchRunId && now > entry.startedAt + entry.seconds * 1e3 + 1e4) {
					markSignalUnverified(entry.id, now);
					pauseSignalBatch(entry.batchRunId, "Котировку не удалось сверить в срок экспирации.");
				}
				markExpiredPendingSignals(now, 12e4);
				const afterExpiry = new Map(readSignalJournal().map((entry) => [entry.id, entry]));
				for (const entry of previouslyPending) if (entry.batchRunId && afterExpiry.get(entry.id)?.outcome === "unverified") pauseSignalBatch(entry.batchRunId, "Исход сигнала не удалось подтвердить котировкой.");
				const due = readSignalJournal().filter((entry) => entry.outcome === "pending" && now >= entry.startedAt + entry.seconds * 1e3 + 1500 && now <= entry.startedAt + entry.seconds * 1e3 + 12e4);
				for (const entry of due) {
					if (now - (lastAttempt.get(entry.id) ?? 0) < 8e3) continue;
					lastAttempt.set(entry.id, now);
					try {
						const quote = await readClose({ data: { symbol: entry.symbol } });
						const digits = Math.max(entry.openPrice >= 100 ? 2 : entry.openPrice >= 10 ? 3 : 5, quote.close >= 100 ? 2 : quote.close >= 10 ? 3 : 5);
						const start = Number(entry.openPrice.toFixed(digits));
						const finish = Number(quote.close.toFixed(digits));
						const move = finish === start ? 0 : finish > start ? 1 : -1;
						const outcome = classifySignalAttempt(entry.direction, move, entry.step);
						const saved = recordSignalOutcome(entry.id, quote.close, outcome);
						if (entry.batchRunId && entry.batchPosition) {
							if (outcome === "overlay") {
								if (!saved) pauseSignalBatch(entry.batchRunId, "Не удалось сохранить исход сигнала в истории.");
							} else if (saved) {
								const completed = completeSignalBatchAttempt(entry.batchRunId, entry.batchPosition, outcome);
								if (!completed || completed.completed < entry.batchPosition) pauseSignalBatch(entry.batchRunId, "Не удалось сохранить завершение серии.");
							} else pauseSignalBatch(entry.batchRunId, "Не удалось сохранить исход сигнала в истории.");
						}
					} catch {}
				}
			} finally {
				busy = false;
			}
		};
		settleExpired();
		const timer = window.setInterval(() => void settleExpired(), 5e3);
		return () => {
			stopped = true;
			window.clearInterval(timer);
		};
	}, []);
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
					className: "mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandName, { className: "shrink-0 text-[15px] sm:text-lg" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "ml-auto hidden min-w-0 items-center justify-end lg:flex",
							children: links.map((item) => {
								const on = item.to === "/" ? path === "/" : path.startsWith(item.to);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: item.to,
									className: `nav-link ${on ? "on" : ""}`,
									children: t(item.label)
								}, item.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": t("language.label"),
							title: t("language.label"),
							value: language,
							onChange: (event) => setLanguage(event.target.value),
							className: "h-9 shrink-0 rounded-full border border-white/10 bg-[#111723] px-2 text-xs font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-blue-soft",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "ru",
									children: "RU"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "uk",
									children: "UA"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "en",
									children: "EN"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/profile",
							className: "chip on max-w-[6.5rem] shrink-0 truncate text-[11px] sm:max-w-[11rem] sm:text-xs",
							children: admin ? t("nav.admin") : levelName || t("nav.noLevel")
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4" }), t(item.label)]
						}, item.to);
					})
				})
			})
		]
	});
}
var styles_default = "/assets/styles-A4eBwswR.css";
var Route$7 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: "PRIME BOT" },
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
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { src: "https://telegram.org/js/telegram-web-app.js" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PocketProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Frame, {}) }) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
function Frame() {
	const { ready, id } = usePocket();
	const { t } = useLanguage();
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "stage grid min-h-dvh place-items-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "text-sm font-medium text-muted",
			children: t("gate.loadingAccess")
		})
	});
	if (!id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gate, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
var $$splitComponentImporter$4 = () => import("./routes-BQ9GrBIj.mjs");
var Route$6 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./history-BzHTMu48.mjs");
var Route$5 = createFileRoute("/history")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./learn-BXfPEdYv.mjs");
var Route$4 = createFileRoute("/learn")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./profile-DlVSyg6d.mjs");
var Route$3 = createFileRoute("/profile")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./signal-BjnpKdup.mjs");
var groups = /* @__PURE__ */ new Set(["fx"]);
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
var Route$2 = createFileRoute("/signal")({
	validateSearch: (search) => {
		const validGroup = groups.has(search.group);
		const group = "fx";
		const direction = search.direction === "put" ? "put" : "call";
		const parsedSeconds = Number(search.seconds);
		const parsedConfidence = Number(search.aiConfidence);
		const seconds = isValidExpirySeconds(parsedSeconds) ? parsedSeconds : 120;
		return {
			symbol: validGroup && typeof search.symbol === "string" ? search.symbol : "",
			name: validGroup && typeof search.name === "string" ? search.name : "",
			group,
			direction,
			open: Number(search.open) || 0,
			payout: Number(search.payout) || 0,
			seconds,
			analysisSeconds: analysisPeriodForExpiry(seconds),
			note: typeof search.note === "string" ? search.note : "",
			bars: readBars(search.bars),
			aiConfidence: Number.isFinite(parsedConfidence) ? Math.min(100, Math.max(0, Math.round(parsedConfidence))) : null,
			step: Math.min(3, Math.max(0, Number(search.step) || 0)),
			started: Number(search.started) || Date.now(),
			...typeof search.batchRunId === "string" && search.batchRunId.length <= 120 ? { batchRunId: search.batchRunId } : {},
			...Number.isInteger(Number(search.batchPosition)) && Number(search.batchPosition) >= 1 && Number(search.batchPosition) <= 20 ? { batchPosition: Number(search.batchPosition) } : {}
		};
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route$1 = createFileRoute("/api/ticks")({ server: { handlers: { GET: async ({ request }) => {
	const initData = request.headers.get("x-telegram-init-data");
	try {
		const { requireVerifiedPocketAccess } = await import("./pocket-gate.server-By8mD9Rm.mjs");
		await requireVerifiedPocketAccess(initData);
	} catch {
		return new Response("unauthorized", { status: 401 });
	}
	const symbol = new URL(request.url).searchParams.get("symbol")?.trim() ?? "";
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) return new Response("bad symbol", { status: 400 });
	const { followQuote, quoteStatus } = await import("./pocket-live.server-B3gwMeMi.mjs");
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
var Route = createFileRoute("/telegram/webhook")({ server: { handlers: { POST: async ({ request }) => {
	const { handleTelegramWebhook } = await import("./telegram-bot.server-LZMZAEzk.mjs");
	return handleTelegramWebhook(request);
} } } });
var rootRouteChildren = {
	IndexRoute: Route$6.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$7
	}),
	HistoryRoute: Route$5.update({
		id: "/history",
		path: "/history",
		getParentRoute: () => Route$7
	}),
	LearnRoute: Route$4.update({
		id: "/learn",
		path: "/learn",
		getParentRoute: () => Route$7
	}),
	ProfileRoute: Route$3.update({
		id: "/profile",
		path: "/profile",
		getParentRoute: () => Route$7
	}),
	SignalRoute: Route$2.update({
		id: "/signal",
		path: "/signal",
		getParentRoute: () => Route$7
	}),
	ApiTicksRoute: Route$1.update({
		id: "/api/ticks",
		path: "/api/ticks",
		getParentRoute: () => Route$7
	}),
	TelegramWebhookRoute: Route.update({
		id: "/telegram/webhook",
		path: "/telegram/webhook",
		getParentRoute: () => Route$7
	})
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { levelForBalance as A, confirmSignalEntry as C, usePocket as D, takeSignal as E, markSignalUsed as M, signalsUsedToday as N, formatExpiryForLanguage as O, chooseSignalPair as S, readClose as T, pauseSignalBatch as _, markSignalUnverified as a, signalBatchWinRate as b, recentlyUsedSignalSymbols as c, signalJournalCsv as d, signalRecordId as f, completeSignalBatchAttempt as g, summarizeSignals as h, markExpiredPendingSignals as i, levels as j, useLanguage as k, recordSignalOutcome as l, summarizeByMarket as m, Route$2 as n, readSignalJournal as o, subscribeToSignalJournal as p, classifySignalAttempt as r, readSignalJournalTotals as s, router_exports as t, recordSignalStarted as u, readSignalBatch as v, loadFeed as w, subscribeToSignalBatch as x, requestSignalBatchStop as y };
