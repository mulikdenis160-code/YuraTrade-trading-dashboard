import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, a as HeadContent, c as createRouter, d as createFileRoute, f as createRootRoute, g as require_jsx_runtime, h as useRouter, i as Scripts, l as Outlet, o as useRouterState, p as Link, u as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { i as isValidExpirySeconds, n as analysisPeriodForExpiry, t as ANALYSIS_PERIODS_SECONDS } from "./expiry-BxofkO8c.mjs";
import { a as object, i as number, o as string, r as literal, s as union } from "../_libs/zod.mjs";
import { a as KeyRound, i as LayoutDashboard, n as TriangleAlert, o as History, r as ShieldCheck, s as GraduationCap, t as UserRound, u as ArrowRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CikUson1.js
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
		"Расчёт по сохранённым результатам в этом браузере. Прошлые результаты не гарантируют будущих.",
		"Розрахунок за збереженими результатами в цьому браузері. Минулі результати не гарантують майбутніх.",
		"Calculated from results saved in this browser. Past results do not guarantee future outcomes."
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
	"stats.rate": [
		"Проходимость",
		"Прохідність",
		"Hit rate"
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
	"signal.connecting": [
		"Подключаемся к Pocket Option…",
		"Підключаємося до Pocket Option…",
		"Connecting to Pocket Option…"
	],
	"signal.description": [
		"Проверяются только валютные пары с выплатой 92% и 80%. Выберите экспирацию от 1 минуты до 4 часов; ИИ напрямую анализирует свечи и выбирает направление.",
		"Перевіряються лише валютні пари з виплатою 92% і 80%. Оберіть експірацію від 1 хвилини до 4 годин; ШІ безпосередньо аналізує свічки та обирає напрямок.",
		"Only currency pairs with 92% or 80% payout are checked. Choose an expiry from 1 minute to 4 hours; AI directly analyzes the candles and selects a direction."
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
		"Все три попытки перекрытия использованы. Проверьте журнал перед следующим запросом.",
		"Усі три спроби перекриття використано. Перевірте журнал перед наступним запитом.",
		"All three recovery attempts have been used. Review the journal before requesting another signal."
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
		"Курс",
		"Курс",
		"Guide"
	],
	"learn.title": [
		"Обучение",
		"Навчання",
		"Learning"
	],
	"learn.intro": [
		"Как устроен PRIME BOT: пара, срок, карточка, таймер, ничья и перекрытие. Это не обещание дохода. Прочитано {done} из {total}.",
		"Як працює PRIME BOT: пара, строк, картка, таймер, нічия та перекриття. Це не обіцянка доходу. Прочитано {done} з {total}.",
		"How PRIME BOT works: pair, expiry, signal card, timer, draw, and recovery trades. This is not a promise of income. Read {done} of {total}."
	],
	"learn.minutes": [
		"{minutes} минут",
		"{minutes} хвилин",
		"{minutes} minutes"
	],
	"learn.read": [
		" · прочитано",
		" · прочитано",
		" · read"
	],
	"learn.done": [
		"Уже отмечено",
		"Вже позначено",
		"Completed"
	],
	"learn.next": [
		"Дальше",
		"Далі",
		"Next"
	],
	"learn.quiz": [
		"Проверка",
		"Перевірка",
		"Knowledge check"
	],
	"learn.quizEmpty": [
		"Шесть вопросов по темам выше.",
		"Шість запитань за темами вище.",
		"Six questions about the topics above."
	],
	"learn.correct": [
		"Верно {score} из {total}.",
		"Правильно {score} із {total}.",
		"{score} of {total} correct."
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
	"profile.signOut": [
		"Выйти",
		"Вийти",
		"Sign out"
	],
	"profile.adminInfo": [
		"Админский ID. Лимита сигналов нет, депозит для входа не нужен.",
		"ID адміністратора. Ліміту сигналів немає, депозит для доступу не потрібен.",
		"Admin ID. No signal limit or minimum deposit is required."
	],
	"profile.userInfo": [
		"Уровень зависит от депозита. Искра от $60 — 5 сигналов в день, Вектор от $200 — 20, Апекс от $500 — без лимита.",
		"Рівень залежить від депозиту. Іскра від $60 — 5 сигналів на день, Вектор від $200 — 20, Апекс від $500 — без ліміту.",
		"Your level depends on your deposit. Spark from $60: 5 signals/day; Vector from $200: 20; Apex from $500: unlimited."
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
	"gate.intro": [
		"Проверка идентификатора. Регистрация не нужна — пароль не запрашиваем.",
		"Перевірка ідентифікатора. Реєстрація не потрібна — пароль не запитуємо.",
		"Verify your identifier. No registration or password is required."
	],
	"gate.id": [
		"Идентификатор Pocket Option",
		"Ідентифікатор Pocket Option",
		"Pocket Option identifier"
	],
	"gate.idHelp": [
		"Девять цифр из профиля. Это проверка ID, не создание аккаунта.",
		"Дев’ять цифр із профілю. Це перевірка ID, а не створення облікового запису.",
		"The nine-digit ID from your profile. This verifies your ID; it does not create an account."
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
	"gate.privacy": [
		"ID остаётся только в этом браузере. На сервер он не отправляется.",
		"ID залишається лише в цьому браузері. На сервер його не надсилають.",
		"Your ID stays in this browser and is not sent to the server."
	],
	"gate.note1": [
		"Только 9 цифр из профиля Pocket Option",
		"Лише 9 цифр із профілю Pocket Option",
		"Only the 9-digit ID from your Pocket Option profile"
	],
	"gate.note2": [
		"Пароль от кабинета не нужен",
		"Пароль від кабінету не потрібен",
		"No account password needed"
	],
	"gate.note3": [
		"Сделки сами не открываются",
		"Угоди самі не відкриваються",
		"Trades are never placed automatically"
	],
	"gate.note4": [
		"Сумму считает калькулятор риска",
		"Суму рахує калькулятор ризику",
		"Use the risk calculator to size trades"
	]
};
var LanguageContext = (0, import_react.createContext)(null);
var STORAGE_KEY$1 = "prime_bot_language";
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
			const saved = window.localStorage.getItem(STORAGE_KEY$1);
			if (isLanguage(saved)) setLanguage(saved);
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.lang = language;
		try {
			window.localStorage.setItem(STORAGE_KEY$1, language);
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
var noteKeys = [
	"gate.note1",
	"gate.note2",
	"gate.note3",
	"gate.note4"
];
function Gate() {
	const { language, setLanguage, t } = useLanguage();
	const { accept } = usePocket();
	const [value, setValue] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const ready = isPocketId(value);
	const submit = () => {
		if (!ready) {
			setError(t("gate.error"));
			return;
		}
		accept(value);
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
					className: "panel rise rise-2 mt-8 space-y-4 p-5",
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
							children: [ready ? t("gate.check") : t("gate.enterDigits"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2 rounded-xl bg-blue/10 px-3 py-3 text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0 text-blue-soft" }), t("gate.privacy")]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid grid-cols-2 gap-2",
					children: noteKeys.map((note, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: `panel rise rise-${index + 1} p-3 text-sm leading-snug text-muted`,
						children: t(note)
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
			"Только валютные пары, включая OTC.",
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
			"Контекст валютной пары, включая OTC.",
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
	return {
		expirySeconds,
		excludedSymbols: Array.isArray(input?.excludedSymbols) ? [...new Set(input.excludedSymbols.filter((symbol) => typeof symbol === "string" && /^[#A-Za-z0-9._-]{2,32}$/.test(symbol.trim())).map((symbol) => symbol.trim()))].slice(0, 24) : []
	};
}).handler(createSsrRpc("65a316e774e0ea4a3bef3cd70e45365d003566e62fb4f915e8f227872abf97ab"));
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
	"draw"
]);
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
function readSignalJournal() {
	const local = storage();
	if (!local) return [];
	try {
		const raw = local.getItem(STORAGE_KEY);
		if (!raw) return [];
		const decoded = JSON.parse(raw);
		if (!Array.isArray(decoded)) return [];
		return decoded.map(normalizeEntry).filter((entry) => entry !== null).sort((a, b) => b.startedAt - a.startedAt).slice(0, MAX_ENTRIES);
	} catch {
		return [];
	}
}
function writeSignalJournal(entries) {
	const local = storage();
	if (!local) return false;
	try {
		local.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
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
	if (index < 0 || entries[index].outcome !== "pending") return false;
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
	const { id } = usePocket();
	const { language, setLanguage, t } = useLanguage();
	const admin = isAdminId(id);
	const [levelName, setLevelName] = (0, import_react.useState)("");
	const pathRef = (0, import_react.useRef)(path);
	(0, import_react.useEffect)(() => {
		pathRef.current = path;
	}, [path]);
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
				markExpiredPendingSignals(now, 12e4);
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
						const won = entry.direction === "call" ? move > 0 : move < 0;
						recordSignalOutcome(entry.id, quote.close, move === 0 ? "draw" : won ? "win" : "loss");
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
var styles_default = "/assets/styles-BQZCRaKL.css";
var Route$6 = createRootRoute({
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
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PocketProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Frame, {}) }) }) }),
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
var $$splitComponentImporter$4 = () => import("./routes-wRsxFMDQ.mjs");
var Route$5 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./history-BHV1gFEl.mjs");
var Route$4 = createFileRoute("/history")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./learn-D0giXRTh.mjs");
var Route$3 = createFileRoute("/learn")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./profile-DhG02R5P.mjs");
var Route$2 = createFileRoute("/profile")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./signal-BmfThqYs.mjs");
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
var Route$1 = createFileRoute("/signal")({
	validateSearch: (search) => {
		const validGroup = groups.has(search.group);
		const group = "fx";
		const direction = search.direction === "put" ? "put" : "call";
		const parsedSeconds = Number(search.seconds);
		const parsedConfidence = Number(search.aiConfidence);
		const seconds = isValidExpirySeconds(parsedSeconds) ? parsedSeconds : 60;
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
			started: Number(search.started) || Date.now()
		};
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route = createFileRoute("/api/ticks")({ server: { handlers: { GET: async ({ request }) => {
	const symbol = new URL(request.url).searchParams.get("symbol")?.trim() ?? "";
	if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) return new Response("bad symbol", { status: 400 });
	const { followQuote, quoteStatus } = await import("./pocket-live.server-3irK7T5S.mjs");
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
export { formatExpiryForLanguage as C, usePocket as S, levelForBalance as _, recentlyUsedSignalSymbols as a, signalsUsedToday as b, signalJournalCsv as c, summarizeByMarket as d, summarizeSignals as f, takeSignal as g, takeBest as h, readSignalJournal as i, signalRecordId as l, readClose as m, Route$1 as n, recordSignalOutcome as o, loadFeed as p, markExpiredPendingSignals as r, recordSignalStarted as s, router_exports as t, subscribeToSignalJournal as u, levels as v, useLanguage as w, isAdminId as x, markSignalUsed as y };
