import { i as isValidExpirySeconds, n as analysisPeriodForExpiry, r as formatExpiry } from "./expiry-BxofkO8c.mjs";
import { a as object, i as number, n as discriminatedUnion, o as string, r as literal, t as _enum } from "../_libs/zod.mjs";
import { t as wrapper_default } from "../_libs/ws.mjs";
import { t as OpenAI } from "../_libs/openai.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pocket-live.server-CB4zwfCI.js
var DIRECT_AI_MODEL = "gpt-6-astra";
var signalReviewSchema = object({
	decision: literal("signal"),
	symbol: string().min(1).max(80),
	direction: _enum(["call", "put"]),
	confidence: number().int().min(0).max(100),
	explanation: object({
		pairSelection: string().trim().min(1).max(240),
		candleEvidence: string().trim().min(1).max(300),
		directionRationale: string().trim().min(1).max(240),
		riskFactors: string().trim().min(1).max(240),
		invalidation: string().trim().min(1).max(240)
	}).strict()
}).strict();
var passReviewSchema = object({
	decision: literal("pass"),
	reason: string().trim().min(1).max(220)
}).strict();
var reviewSchema = discriminatedUnion("decision", [signalReviewSchema, passReviewSchema]);
var client = null;
function getOpenAiClient() {
	const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
	const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
	if (!apiKey || !baseURL) throw new Error("Подключение OpenAI не настроено. Сигнал не выдан.");
	if (!client) client = new OpenAI({
		apiKey,
		baseURL
	});
	return client;
}
function candlesInBasisPoints(candles) {
	const start = Math.max(0, candles.length - 128);
	let previousClose = candles[start - 1]?.close ?? candles[start]?.open ?? 1;
	const result = [];
	for (let index = start; index < candles.length; index += 1) {
		const candle = candles[index];
		const base = previousClose || candle.open || 1;
		const toBasisPoints = (price) => Number(((price / base - 1) * 1e4).toFixed(2));
		result.push([
			toBasisPoints(candle.open),
			toBasisPoints(candle.high),
			toBasisPoints(candle.low),
			toBasisPoints(candle.close)
		]);
		previousClose = candle.close;
	}
	return result;
}
function parseMarketAiReview(content, allowedSymbols) {
	let decoded;
	try {
		decoded = JSON.parse(content);
	} catch {
		return null;
	}
	const parsed = reviewSchema.safeParse(decoded);
	if (!parsed.success) return null;
	if (parsed.data.decision === "signal" && !allowedSymbols.includes(parsed.data.symbol)) return null;
	return parsed.data;
}
function acceptsMarketAiReview(review, allowedSymbols) {
	return review?.decision === "signal" && allowedSymbols.includes(review.symbol);
}
async function analyzeMarketCandidates(expirySeconds, candleSeconds, candidates) {
	const eligibleCandidates = candidates.filter((candidate) => candidate.candles.length >= 30);
	if (eligibleCandidates.length === 0) return {
		decision: "pass",
		reason: `Нужно не менее 30 свечей на пару.`
	};
	const input = {
		expirySeconds,
		candleSeconds,
		candleFormat: "Последовательность OHLC, oldest-to-newest; значения в basis points относительно close предыдущей свечи.",
		candidates: eligibleCandidates.map((candidate) => ({
			symbol: candidate.symbol,
			name: candidate.name,
			candles: candlesInBasisPoints(candidate.candles)
		}))
	};
	let content;
	try {
		content = (await getOpenAiClient().chat.completions.create({
			model: DIRECT_AI_MODEL,
			max_completion_tokens: 8192,
			response_format: { type: "json_object" },
			messages: [{
				role: "system",
				content: "Ты непосредственно анализируешь переданные свечи OHLC и выбираешь направление CALL или PUT. Не используй отдельный классификатор, исторический порог точности или проверку на отложенной выборке как дополнительный фильтр. Если есть не менее 30 корректных свечей, сравни доступные пары и выбери наиболее обоснованную пару и направление; возвращай pass только если данные некорректны или недостаточны для анализа. Используй только переданные данные, не учитывай размер выплаты как причину повысить уверенность, не выдумывай индикаторы, уровни цены, новости или сведения, которых нет во входных данных. Самооценка confidence субъективна и не является статистически калиброванной вероятностью или исторической точностью. Не обещай результат и не открывай сделки. Все пять текстов explanation напиши по-русски: pairSelection — почему выбрана эта пара; если пара одна, прямо скажи, что сравнения не было; candleEvidence — конкретные видимые свойства OHLC; directionRationale — почему эти свечи поддерживают CALL или PUT; riskFactors — что может привести к ошибке; invalidation — какое наблюдаемое движение ослабит сценарий без выдуманной цены. Кратко, но содержательно. Верни только JSON: либо {\"decision\":\"signal\",\"symbol\":\"точный symbol из списка\",\"direction\":\"call\"|\"put\",\"confidence\":0..100 целое,\"explanation\":{\"pairSelection\":\"...\",\"candleEvidence\":\"...\",\"directionRationale\":\"...\",\"riskFactors\":\"...\",\"invalidation\":\"...\"}}, либо {\"decision\":\"pass\",\"reason\":\"кратко по-русски\"}."
			}, {
				role: "user",
				content: JSON.stringify(input)
			}]
		})).choices[0]?.message?.content;
	} catch {
		throw new Error("OpenAI не смог завершить анализ. Сигнал не выдан.");
	}
	const review = content ? parseMarketAiReview(content, eligibleCandidates.map((candidate) => candidate.symbol)) : null;
	if (!review) throw new Error("OpenAI вернул некорректный анализ. Сигнал не выдан.");
	return review;
}
var FEED_URL = "wss://api-msk.po.market/socket.io/?EIO=4&transport=websocket";
var FEED_AUTH = process.env.POCKET_OPTION_FEED_AUTH ?? "";
var AUTH_MISSING_MESSAGE = "Не настроена свежая авторизация Pocket Option. Добавьте её в Replit Secrets как POCKET_OPTION_FEED_AUTH.";
var AUTH_REJECTED_MESSAGE = "Pocket Option отклонил авторизацию. Проверьте актуальность секрета POCKET_OPTION_FEED_AUTH.";
var HISTORY_PAGE_CANDLES = 150;
var pairs = /* @__PURE__ */ new Map();
var balance = null;
var socket = null;
var ready = null;
var connectionError = "";
var retryAfter = 0;
var expectAssets = false;
var expectHistory = false;
var expectBalance = false;
var quotes = /* @__PURE__ */ new Map();
var expectStream = false;
var pending = null;
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
function asCandles(data) {
	const candles = [];
	for (const row of data) {
		if (!row || typeof row !== "object") continue;
		const candle = row;
		const close = Number(candle.close);
		const open = Number(candle.open);
		if (!Number.isFinite(close) || !Number.isFinite(open)) continue;
		candles.push({
			time: Number(candle.time) || 0,
			open,
			close,
			high: Number.isFinite(Number(candle.high)) ? Number(candle.high) : Math.max(open, close),
			low: Number.isFinite(Number(candle.low)) ? Number(candle.low) : Math.min(open, close)
		});
	}
	candles.sort((a, b) => a.time - b.time);
	return candles;
}
function buildDirectAiSignal(candles, expirySeconds, analysisSeconds, name, payout, review) {
	const pack = candles.slice(-28);
	const price = candles[candles.length - 1]?.close ?? 0;
	const sample = pack[pack.length - 1]?.close ?? price;
	const digits = sample >= 100 ? 2 : sample >= 10 ? 3 : 5;
	const cut = (value) => Number(value.toFixed(digits));
	const directionLabel = review.direction === "call" ? "CALL (вверх)" : "PUT (вниз)";
	return {
		name,
		payout,
		direction: review.direction,
		openPrice: price,
		analysisSeconds,
		aiConfidence: review.confidence,
		note: [
			`Прямой анализ OpenAI ${DIRECT_AI_MODEL} выбрал ${directionLabel}.`,
			`Самооценка ИИ: ${review.confidence}/100; это субъективная оценка, а не измеренная вероятность или историческая точность.`,
			`ИИ — выбор пары: ${review.explanation.pairSelection}`,
			`ИИ — разбор свечей: ${review.explanation.candleEvidence}`,
			`ИИ — аргумент направления: ${review.explanation.directionRationale}`,
			`ИИ — риски сценария: ${review.explanation.riskFactors}`,
			`ИИ — что ослабит сценарий: ${review.explanation.invalidation}`,
			`Экспирация ${formatExpiry(expirySeconds)}; интервал свечи ${formatExpiry(analysisSeconds)}.`,
			"Направление выбрано прямым анализом ИИ без независимой проверки другой модели; результат не гарантирован."
		].join("\n"),
		bars: pack.map((candle) => [
			cut(candle.open),
			cut(candle.high),
			cut(candle.low),
			cut(candle.close)
		])
	};
}
function rememberTicks(message) {
	try {
		const rows = JSON.parse(message);
		if (!Array.isArray(rows)) return;
		for (const row of rows) {
			if (!Array.isArray(row) || row.length < 3) continue;
			const price = Number(row[2]);
			if (!Number.isFinite(price)) continue;
			quotes.set(String(row[0]), {
				price,
				at: Date.now()
			});
		}
	} catch {}
}
var subscribedAt = /* @__PURE__ */ new Map();
function subscribe(symbol) {
	const now = Date.now();
	if (now - (subscribedAt.get(symbol) ?? 0) < 2e3) return;
	if (!socket || socket.readyState !== wrapper_default.OPEN) return;
	subscribedAt.set(symbol, now);
	socket.send("42" + JSON.stringify(["changeSymbol", {
		asset: symbol,
		period: 1
	}]));
}
function waitQuote(symbol) {
	subscribe(symbol);
	const started = Date.now();
	return new Promise((resolve, reject) => {
		const timer = setInterval(() => {
			const quote = quotes.get(symbol);
			if (quote && quote.at >= started - 250) {
				clearInterval(timer);
				clearTimeout(stop);
				resolve(quote.price);
			}
		}, 200);
		const stop = setTimeout(() => {
			clearInterval(timer);
			const quote = quotes.get(symbol);
			if (quote && Date.now() - quote.at <= 2e3) resolve(quote.price);
			else reject(/* @__PURE__ */ new Error("Цена не пришла. Попробуйте ещё раз."));
		}, 5e3);
	});
}
function failPending(error) {
	if (!pending) return;
	clearTimeout(pending.timer);
	pending.reject(error);
	pending = null;
}
function handleMessage(current, message) {
	if (message.startsWith("0") && message.includes("sid")) {
		current.send("40");
		return;
	}
	if (message === "2") {
		current.send("3");
		return;
	}
	if (message.startsWith("40") && message.includes("sid")) {
		current.send(FEED_AUTH);
		return;
	}
	if (message.includes("NotAuthorized")) {
		connectionError = AUTH_REJECTED_MESSAGE;
		failPending(new Error(connectionError));
		try {
			current.close();
		} catch {}
		return;
	}
	if (message.includes("updateAssets")) {
		expectAssets = true;
		return;
	}
	if (message.includes("loadHistoryPeriod")) {
		expectHistory = true;
		return;
	}
	if (expectAssets && message.startsWith("[")) {
		expectAssets = false;
		try {
			storeAssets(JSON.parse(message));
		} catch {}
		return;
	}
	if (expectHistory && message.startsWith("{")) {
		expectHistory = false;
		try {
			const parsed = JSON.parse(message);
			if (pending && parsed.asset === pending.asset && Array.isArray(parsed.data)) {
				const candles = asCandles(parsed.data);
				clearTimeout(pending.timer);
				const resolve = pending.resolve;
				pending = null;
				resolve(candles);
			}
		} catch {}
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
	const nextBalance = readNumber(message, "balance");
	if (nextBalance === null) return;
	balance = nextBalance;
	expectBalance = false;
}
function connect() {
	if (!FEED_AUTH.trim()) {
		connectionError = AUTH_MISSING_MESSAGE;
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
	const next = new wrapper_default(FEED_URL, {
		headers: {
			Origin: "https://pocketoption.com",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0"
		},
		handshakeTimeout: 8e3
	});
	next.on("error", () => {
		if (socket !== next) return;
		socket = null;
		retryAfter = Date.now() + 2e3;
		connectionError = "Не удалось подключиться к потоку Pocket Option. Повторяем подключение.";
	});
	socket = next;
	next.on("message", (data) => handleMessage(next, textOf(data)));
	next.on("close", () => {
		if (socket !== next) return;
		socket = null;
		retryAfter = Date.now() + 2e3;
		if (!connectionError) connectionError = "Соединение с Pocket Option прервано. Повторяем подключение.";
	});
}
function ensureFeed() {
	if (pairs.size > 0 && socket && socket.readyState === wrapper_default.OPEN) return Promise.resolve();
	if (ready) return ready;
	connect();
	ready = new Promise((resolve, reject) => {
		const started = Date.now();
		const timer = setInterval(() => {
			if (pairs.size > 0 && socket && socket.readyState === wrapper_default.OPEN) {
				clearInterval(timer);
				ready = null;
				resolve();
				return;
			}
			if ((!socket || socket.readyState === 3) && Date.now() >= retryAfter) connect();
			if (Date.now() - started > 12e3) {
				clearInterval(timer);
				ready = null;
				if (!connectionError) connectionError = "Котировки Pocket Option не получены за 12 секунд.";
				reject(new Error(connectionError));
			}
		}, 200);
	});
	return ready;
}
async function feedSnapshot() {
	await ensureFeed();
	return {
		balance,
		pairs: [...pairs.values()].sort((a, b) => b.payout - a.payout || a.name.localeCompare(b.name))
	};
}
async function loadHistoryPage(symbol, seconds, time) {
	await ensureFeed();
	if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
	if (!socket || socket.readyState !== wrapper_default.OPEN) throw new Error("Котировки сейчас недоступны.");
	if (pending) failPending(/* @__PURE__ */ new Error("Запрос сменён."));
	const current = socket;
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			if (pending?.asset === symbol) {
				pending = null;
				expectHistory = false;
			}
			reject(/* @__PURE__ */ new Error("История свечей не пришла. Попробуйте ещё раз."));
		}, 12e3);
		pending = {
			asset: symbol,
			resolve,
			reject,
			timer
		};
		try {
			current.send("42" + JSON.stringify(["changeSymbol", {
				asset: symbol,
				period: seconds
			}]));
			current.send("42" + JSON.stringify(["loadHistoryPeriod", {
				asset: symbol,
				index: 7e3 + Math.floor(Math.random() * 2e3),
				time,
				offset: seconds * HISTORY_PAGE_CANDLES,
				period: seconds
			}]));
		} catch {
			clearTimeout(timer);
			if (pending?.asset === symbol) pending = null;
			expectHistory = false;
			reject(/* @__PURE__ */ new Error("Не удалось запросить историю свечей Pocket Option."));
		}
	});
}
async function loadCandles(symbol, seconds) {
	await ensureFeed();
	const collected = /* @__PURE__ */ new Map();
	let cursor = Math.floor(Date.now() / 1e3);
	const maxPages = Math.ceil(128 / HISTORY_PAGE_CANDLES) + 1;
	for (let page = 0; page < maxPages && collected.size < 128; page += 1) {
		const candles = await loadHistoryPage(symbol, seconds, cursor);
		if (candles.length === 0) break;
		const previousSize = collected.size;
		for (const candle of candles) collected.set(candle.time, candle);
		const oldestTime = candles[0].time;
		if (collected.size === previousSize || oldestTime <= 0 || oldestTime >= cursor) break;
		cursor = oldestTime - 1;
	}
	return [...collected.values()].sort((a, b) => a.time - b.time).slice(-128);
}
function followQuote(symbol) {
	if ((!socket || socket.readyState === 3) && Date.now() >= retryAfter) feedSnapshot().catch(() => {});
	const current = quotes.get(symbol);
	if (!current || Date.now() - current.at > 2e3) subscribe(symbol);
	return quotes.get(symbol) ?? null;
}
function quoteStatus(symbol) {
	if (!FEED_AUTH.trim()) return {
		status: "error",
		message: AUTH_MISSING_MESSAGE
	};
	if (connectionError) return {
		status: "error",
		message: connectionError
	};
	if (!socket || socket.readyState !== wrapper_default.OPEN) return {
		status: "connecting",
		message: "Подключаемся к потоку Pocket Option."
	};
	const quote = quotes.get(symbol);
	if (quote && Date.now() - quote.at <= 5e3) return {
		status: "connected",
		message: ""
	};
	return {
		status: "connecting",
		message: "Ожидаем свежую котировку Pocket Option."
	};
}
async function feedClose(symbol) {
	await ensureFeed();
	if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
	const quote = quotes.get(symbol);
	if (quote && Date.now() - quote.at < 800) return quote.price;
	return waitQuote(symbol);
}
async function feedSignal(symbol, expirySeconds) {
	if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
	await ensureFeed();
	subscribe(symbol);
	const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
	const candles = await loadCandles(symbol, analysisSeconds);
	const pair = pairs.get(symbol);
	if (!pair) throw new Error("Эта пара сейчас недоступна.");
	const review = await analyzeMarketCandidates(expirySeconds, analysisSeconds, [{
		symbol,
		name: pair.name,
		candles
	}]);
	if (review.decision !== "signal") return null;
	if (!acceptsMarketAiReview(review, [symbol])) return null;
	const signal = buildDirectAiSignal(candles, expirySeconds, analysisSeconds, pair.name, pair.payout, review);
	signal.openPrice = await waitQuote(symbol);
	return signal;
}
async function feedBest(expirySeconds) {
	if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
	await ensureFeed();
	const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
	const ranked = [...pairs.values()].filter((pair) => pair.payout === 92 || pair.payout === 80).sort((a, b) => b.payout - a.payout);
	const live = ranked.filter((pair) => quotes.has(pair.symbol));
	const pool = (live.length >= 4 ? live : ranked).slice(0, 4);
	if (pool.length === 0) throw new Error("Нет активных пар с выплатой 92% или 80%.");
	const candidates = [];
	for (const pair of pool) try {
		const candles = await loadCandles(pair.symbol, analysisSeconds);
		if (candles.length < 30) continue;
		candidates.push({
			pair,
			candles
		});
	} catch {}
	if (candidates.length === 0) throw new Error(`Не удалось получить по Pocket Option минимум 30 исторических свечей ни для одной пары.`);
	const review = await analyzeMarketCandidates(expirySeconds, analysisSeconds, candidates.map((candidate) => ({
		symbol: candidate.pair.symbol,
		name: candidate.pair.name,
		candles: candidate.candles
	})));
	if (review.decision !== "signal") return null;
	const best = candidates.find((candidate) => candidate.pair.symbol === review.symbol);
	if (!best || !acceptsMarketAiReview(review, candidates.map((candidate) => candidate.pair.symbol))) return null;
	const signal = buildDirectAiSignal(best.candles, expirySeconds, analysisSeconds, best.pair.name, best.pair.payout, review);
	signal.openPrice = await waitQuote(best.pair.symbol);
	return {
		...signal,
		symbol: best.pair.symbol,
		group: best.pair.group,
		seconds: expirySeconds,
		analysisSeconds
	};
}
//#endregion
export { feedBest, feedClose, feedSignal, feedSnapshot, followQuote, quoteStatus };
