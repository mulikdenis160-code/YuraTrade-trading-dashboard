import { i as isValidExpirySeconds, n as analysisPeriodForExpiry, r as formatExpiry } from "./expiry-BxofkO8c.mjs";
import { a as object, i as number, n as discriminatedUnion, o as string, r as literal, t as _enum } from "../_libs/zod.mjs";
import { t as wrapper_default } from "../_libs/ws.mjs";
import { t as Anthropic } from "../_libs/@anthropic-ai/sdk+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pocket-live.server-DlLNwTY8.js
var DIRECT_AI_MODEL = "claude-opus-5";
var DIRECT_AI_MODEL_LABEL = "Claude Opus 5";
var signalReviewSchema = object({
	decision: literal("signal"),
	symbol: string().min(1).max(80),
	direction: _enum(["call", "put"]),
	confidence: number().int().min(0).max(100),
	explanation: object({
		pairSelection: string().trim().min(1).max(1200),
		candleEvidence: string().trim().min(1).max(1200),
		directionRationale: string().trim().min(1).max(1200),
		riskFactors: string().trim().min(1).max(1200),
		invalidation: string().trim().min(1).max(1200)
	})
});
var passReviewSchema = object({
	decision: literal("pass"),
	reason: string().trim().min(1).max(1200)
});
discriminatedUnion("decision", [signalReviewSchema, passReviewSchema]);
var DIRECT_AI_SYSTEM_PROMPT = [
	"Ты непосредственно анализируешь переданные свечи OHLC и выбираешь направление CALL или PUT.",
	"Не используй отдельный классификатор, числовой порог уверенности, исторический порог точности или проверку на отложенной выборке как дополнительный фильтр.",
	"Минимум 30 корректных свечей — только условие достаточности входных данных, а не причина обязательно выдать сигнал.",
	"Не вынуждай себя выбирать направление: возвращай pass, если нет ясного преимущества, свечи боковые или хаотичные, недавнее движение противоречит общей структуре, направление держится только на одной свече или коротком всплеске, либо CALL и PUT одинаково правдоподобны.",
	"Оцени ожидаемое движение к концу указанной экспирации, а не только цвет последних свечей. Учитывай, что candleSeconds — интервал свечи, а не гарантированный период прогноза.",
	"Сравнивай доступные пары и выбирай сигнал только если одна пара и направление обоснованы лучше альтернатив; если данные не дают такого преимущества, возвращай pass.",
	"Используй только переданные данные, не учитывай размер выплаты как причину повысить уверенность, не выдумывай индикаторы, уровни цены, новости или сведения, которых нет во входных данных.",
	"Самооценка confidence субъективна и не является статистически калиброванной вероятностью или исторической точностью. Не обещай результат и не открывай сделки.",
	"Все пять текстов explanation напиши по-русски: pairSelection — почему выбрана эта пара; если пара одна, прямо скажи, что сравнения не было; candleEvidence — конкретные видимые свойства OHLC; directionRationale — почему эти свечи поддерживают CALL или PUT; riskFactors — что может привести к ошибке; invalidation — какое наблюдаемое движение ослабит сценарий без выдуманной цены.",
	"Кратко, но содержательно. Верни только JSON: либо {\"decision\":\"signal\",\"symbol\":\"точный symbol из списка\",\"direction\":\"call\"|\"put\",\"confidence\":0..100 целое,\"explanation\":{\"pairSelection\":\"...\",\"candleEvidence\":\"...\",\"directionRationale\":\"...\",\"riskFactors\":\"...\",\"invalidation\":\"...\"}}, либо {\"decision\":\"pass\",\"reason\":\"кратко по-русски\"}."
].join(" ");
var client = null;
function getAnthropicClient() {
	const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
	const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
	if (!apiKey || !baseURL) throw new Error("Подключение Anthropic через Replit AI Integrations не настроено. Сигнал не выдан.");
	if (!client) client = new Anthropic({
		apiKey,
		baseURL,
		timeout: 45e3,
		maxRetries: 1
	});
	return client;
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function firstString(source, keys) {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
	return "";
}
function firstValue(source, keys) {
	for (const key of keys) {
		const value = source[key];
		if (value !== void 0 && value !== null) return value;
	}
}
function decodeJsonContent(content) {
	const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
	try {
		return JSON.parse(cleaned);
	} catch {
		const start = cleaned.indexOf("{");
		const end = cleaned.lastIndexOf("}");
		if (start < 0 || end <= start) return null;
		try {
			return JSON.parse(cleaned.slice(start, end + 1));
		} catch {
			return null;
		}
	}
}
function normalizeDirection(value) {
	if (typeof value !== "string") return null;
	const token = value.trim().toLowerCase().split(/[\s(/_-]+/u)[0];
	if ([
		"call",
		"up",
		"buy",
		"higher",
		"bullish",
		"long",
		"вверх",
		"покупка"
	].includes(token)) return "call";
	if ([
		"put",
		"down",
		"sell",
		"lower",
		"bearish",
		"short",
		"вниз",
		"продажа"
	].includes(token)) return "put";
	return null;
}
function normalizeConfidence(value) {
	const raw = typeof value === "string" ? Number(value.trim().replace(/%$/, "")) : value;
	if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0 || raw > 100) return null;
	const score = raw > 0 && raw <= 1 ? raw * 100 : raw;
	return Math.round(score);
}
function matchAllowedSymbol(value, allowedSymbols) {
	if (typeof value !== "string" || !value.trim()) return null;
	const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
	const matches = allowedSymbols.filter((symbol) => symbol.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized);
	return matches.length === 1 ? matches[0] : null;
}
function normalizeExplanation(value, root) {
	const source = isRecord(value) ? value : {};
	const general = typeof value === "string" ? value.trim() : firstString(root, [
		"analysis",
		"reasoning",
		"rationale",
		"summary",
		"reason"
	]);
	const missing = "ИИ не предоставил отдельное пояснение для этого пункта.";
	const pairSelection = firstString(source, [
		"pairSelection",
		"pair_selection",
		"pairReason",
		"pair_reason"
	]).slice(0, 1200);
	const candleEvidence = firstString(source, [
		"candleEvidence",
		"candle_evidence",
		"evidence",
		"candleAnalysis",
		"candle_analysis"
	]).slice(0, 1200);
	const directionRationale = firstString(source, [
		"directionRationale",
		"direction_rationale",
		"rationale",
		"directionReason",
		"direction_reason"
	]).slice(0, 1200) || general.slice(0, 1200);
	const riskFactors = firstString(source, [
		"riskFactors",
		"risk_factors",
		"risks",
		"risk"
	]).slice(0, 1200);
	const invalidation = firstString(source, [
		"invalidation",
		"invalidationCondition",
		"invalidation_condition",
		"invalidationSignal"
	]).slice(0, 1200);
	return Boolean(pairSelection || candleEvidence || directionRationale || riskFactors || invalidation) ? {
		pairSelection: pairSelection || missing,
		candleEvidence: candleEvidence || missing,
		directionRationale: directionRationale || missing,
		riskFactors: riskFactors || missing,
		invalidation: invalidation || missing
	} : null;
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
	const decoded = decodeJsonContent(content);
	if (!isRecord(decoded)) return null;
	const root = isRecord(decoded.result) ? decoded.result : isRecord(decoded.data) ? decoded.data : decoded;
	const decision = firstString(root, [
		"decision",
		"status",
		"type"
	]).toLowerCase();
	if ([
		"pass",
		"abstain",
		"no_signal",
		"no-signal",
		"none"
	].includes(decision)) {
		const parsedPass = passReviewSchema.safeParse({
			decision: "pass",
			reason: (firstString(root, [
				"reason",
				"message",
				"explanation"
			]) || "ИИ не выбрал направление.").slice(0, 1200)
		});
		return parsedPass.success ? parsedPass.data : null;
	}
	const direction = normalizeDirection(firstValue(root, [
		"direction",
		"side",
		"action",
		"signal"
	]) ?? decision);
	if (!direction) return null;
	if (decision && ![
		"signal",
		"trade",
		"call",
		"put",
		"buy",
		"sell",
		"up",
		"down",
		"long",
		"short",
		"вверх",
		"вниз"
	].includes(decision)) return null;
	const rawSymbol = firstValue(root, [
		"symbol",
		"pair",
		"asset",
		"ticker"
	]);
	const symbol = rawSymbol === void 0 && allowedSymbols.length === 1 ? allowedSymbols[0] : matchAllowedSymbol(rawSymbol, allowedSymbols);
	const confidence = normalizeConfidence(firstValue(root, [
		"confidence",
		"confidenceScore",
		"confidence_score",
		"certainty"
	]));
	if (!symbol || confidence === null) return null;
	const explanation = normalizeExplanation(firstValue(root, [
		"explanation",
		"analysis",
		"reasoning"
	]), root);
	if (!explanation) return null;
	const parsed = signalReviewSchema.safeParse({
		decision: "signal",
		symbol,
		direction,
		confidence,
		explanation
	});
	return parsed.success ? parsed.data : null;
}
function acceptsMarketAiReview(review, allowedSymbols) {
	return review?.decision === "signal" && allowedSymbols.includes(review.symbol);
}
function isValidCandle(candle) {
	return Number.isFinite(candle.time) && Number.isFinite(candle.open) && Number.isFinite(candle.high) && Number.isFinite(candle.low) && Number.isFinite(candle.close) && candle.time > 0 && candle.open > 0 && candle.high > 0 && candle.low > 0 && candle.close > 0 && candle.high >= candle.low && candle.high >= Math.max(candle.open, candle.close) && candle.low <= Math.min(candle.open, candle.close);
}
function marketAiApiErrorMessage(error) {
	if (error instanceof Error && error.message.includes("Подключение Anthropic через Replit AI Integrations не настроено")) return error.message;
	const status = isRecord(error) ? Number(error.status ?? error.statusCode) : NaN;
	const name = error instanceof Error ? error.name.toLowerCase() : "";
	if (status === 401 || status === 403) return "Anthropic отклонил подключение. Проверьте настройки интеграции; сигнал не выдан.";
	if (status === 429) return "Anthropic временно ограничил запросы. Подождите немного и попробуйте ещё раз.";
	if (status === 408 || status === 504 || name.includes("timeout")) return "Анализ Claude занял слишком много времени. Попробуйте ещё раз; сигнал не выдан.";
	if (status === 400) return "Anthropic отклонил формат запроса. Попробуйте ещё раз; если ошибка повторится, проверьте настройку модели.";
	if (status === 404) return "Модель Claude Opus 5 сейчас недоступна. Попробуйте ещё раз позже.";
	if (status >= 500 || name.includes("connection")) return "Сервис Anthropic временно недоступен. Попробуйте ещё раз через минуту.";
	return "Не удалось завершить анализ Claude. Попробуйте ещё раз; сигнал не выдан.";
}
function requestMarketAiCompletion(messages) {
	const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
	const requestMessages = messages.flatMap((message) => {
		if (message.role === "system") return [];
		return [{
			role: message.role,
			content: message.content
		}];
	});
	return getAnthropicClient().messages.create({
		model: DIRECT_AI_MODEL,
		max_tokens: 8192,
		system,
		messages: requestMessages
	}).then((response) => {
		const content = response.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
		const refusal = response.stop_reason === "refusal" ? content || "Anthropic отказался выполнить анализ." : null;
		return { choices: [{
			message: {
				content: content || null,
				refusal
			},
			finish_reason: response.stop_reason === "max_tokens" ? "length" : response.stop_reason
		}] };
	});
}
async function requestMarketAiReviewWithRepair(request, baseMessages, allowedSymbols) {
	let firstChoice;
	try {
		firstChoice = (await request(baseMessages)).choices[0];
	} catch (error) {
		throw new Error(marketAiApiErrorMessage(error));
	}
	const firstContent = firstChoice?.message.content;
	const firstReview = typeof firstContent === "string" ? parseMarketAiReview(firstContent, allowedSymbols) : null;
	if (firstReview) return firstReview;
	if (firstChoice?.message.refusal) throw new Error("Claude отказался выполнить анализ. Сигнал не выдан.");
	const repairMessages = [
		...baseMessages,
		...typeof firstContent === "string" && firstContent ? [{
			role: "assistant",
			content: firstContent.slice(0, 16e3)
		}] : [],
		{
			role: "user",
			content: "Предыдущий ответ нельзя проверить. Повтори анализ по исходным правилам и верни один корректный JSON-объект. Если ясного преимущества нет, верни pass с краткой причиной и не вынуждай себя выбирать направление. Если выдаёшь signal, используй точный symbol из списка, направление call или put, числовую confidence от 0 до 100 и все пять полей explanation. Не добавляй факты, которых нет в свечах."
		}
	];
	let retryChoice;
	try {
		retryChoice = (await request(repairMessages)).choices[0];
	} catch (error) {
		throw new Error(marketAiApiErrorMessage(error));
	}
	const retryContent = retryChoice?.message.content;
	const retryReview = typeof retryContent === "string" ? parseMarketAiReview(retryContent, allowedSymbols) : null;
	if (retryReview) return retryReview;
	if (retryChoice?.message.refusal) throw new Error("Claude отказался выполнить анализ повторно. Сигнал не выдан.");
	if (firstChoice?.finish_reason === "length" || retryChoice?.finish_reason === "length") throw new Error("Claude оборвал ответ по лимиту длины. Повторите запрос; сигнал не выдан.");
	if (typeof firstContent !== "string" && typeof retryContent !== "string") throw new Error("Claude не вернул текст анализа после повторного запроса. Сигнал не выдан.");
	throw new Error("Claude дважды вернул ответ, который не удалось проверить. Повторите запрос; сигнал не выдан.");
}
async function analyzeMarketCandidates(expirySeconds, candleSeconds, candidates) {
	const eligibleCandidates = candidates.map((candidate) => {
		const candlesByTime = /* @__PURE__ */ new Map();
		for (const candle of candidate.candles) if (isValidCandle(candle)) candlesByTime.set(candle.time, candle);
		return {
			...candidate,
			candles: [...candlesByTime.values()].sort((a, b) => a.time - b.time)
		};
	}).filter((candidate) => candidate.candles.length >= 30);
	if (eligibleCandidates.length === 0) return {
		decision: "pass",
		reason: `После проверки данных нужно не менее 30 корректных свечей на пару.`
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
	const userPrompt = JSON.stringify(input);
	return requestMarketAiReviewWithRepair(requestMarketAiCompletion, [{
		role: "system",
		content: DIRECT_AI_SYSTEM_PROMPT
	}, {
		role: "user",
		content: userPrompt
	}], eligibleCandidates.map((candidate) => candidate.symbol));
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
			`Прямой анализ ${DIRECT_AI_MODEL_LABEL} (${DIRECT_AI_MODEL}) выбрал ${directionLabel}.`,
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
	if (review.decision === "pass") return review;
	if (!acceptsMarketAiReview(review, [symbol])) return {
		decision: "pass",
		reason: "Ответ ИИ не прошёл проверку пары и направления; сигнал не выдан."
	};
	const signal = buildDirectAiSignal(candles, expirySeconds, analysisSeconds, pair.name, pair.payout, review);
	signal.openPrice = await waitQuote(symbol);
	return {
		decision: "signal",
		...signal
	};
}
async function feedBest(expirySeconds, excludedSymbols = []) {
	if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
	await ensureFeed();
	const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
	const ranked = [...pairs.values()].filter((pair) => pair.payout === 92 || pair.payout === 80).sort((a, b) => b.payout - a.payout);
	if (ranked.length === 0) throw new Error("Нет активных пар с выплатой 92% или 80%.");
	const excluded = new Set(excludedSymbols.slice(0, 24).map((symbol) => symbol.toLowerCase()));
	const available = ranked.filter((pair) => !excluded.has(pair.symbol.toLowerCase()));
	if (available.length === 0) throw new Error("Все подходящие пары недавно выдавались. Повтор по той же паре временно остановлен.");
	const live = available.filter((pair) => quotes.has(pair.symbol));
	const pool = (live.length >= 4 ? live : available).slice(0, 4);
	if (pool.length === 0) throw new Error("Нет активных пар с выплатой 92% или 80%.");
	const candidates = [];
	let historyResponses = 0;
	let historyFailure = "";
	for (const pair of pool) try {
		const candles = await loadCandles(pair.symbol, analysisSeconds);
		historyResponses += 1;
		if (candles.length < 30) continue;
		candidates.push({
			pair,
			candles
		});
	} catch (cause) {
		if (cause instanceof Error) historyFailure = cause.message;
	}
	if (candidates.length === 0) {
		if (historyResponses === 0 && historyFailure) throw new Error(`Не удалось получить историю свечей Pocket Option: ${historyFailure}`);
		throw new Error(`Не удалось получить по Pocket Option минимум 30 исторических свечей ни для одной пары.`);
	}
	const review = await analyzeMarketCandidates(expirySeconds, analysisSeconds, candidates.map((candidate) => ({
		symbol: candidate.pair.symbol,
		name: candidate.pair.name,
		candles: candidate.candles
	})));
	if (review.decision === "pass") return review;
	const best = candidates.find((candidate) => candidate.pair.symbol === review.symbol);
	if (!best || !acceptsMarketAiReview(review, candidates.map((candidate) => candidate.pair.symbol))) return {
		decision: "pass",
		reason: "Ответ ИИ указал пару вне доступного списка; сигнал не выдан."
	};
	const signal = buildDirectAiSignal(best.candles, expirySeconds, analysisSeconds, best.pair.name, best.pair.payout, review);
	signal.openPrice = await waitQuote(best.pair.symbol);
	return {
		decision: "signal",
		...signal,
		symbol: best.pair.symbol,
		group: best.pair.group,
		seconds: expirySeconds,
		analysisSeconds
	};
}
//#endregion
export { feedBest, feedClose, feedSignal, feedSnapshot, followQuote, quoteStatus };
