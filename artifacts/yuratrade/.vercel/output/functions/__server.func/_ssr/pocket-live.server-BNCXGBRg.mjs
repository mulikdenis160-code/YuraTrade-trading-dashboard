import { i as isValidExpirySeconds, n as analysisPeriodForExpiry, r as formatExpiry } from "./expiry-BxofkO8c.mjs";
import { a as object, i as number, n as discriminatedUnion, o as string, r as literal, t as _enum } from "../_libs/zod.mjs";
import { t as wrapper_default } from "../_libs/ws.mjs";
import { t as OpenAI } from "../_libs/openai.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pocket-live.server-BNCXGBRg.js
var FEATURE_WINDOW = 24;
var MIN_VALIDATION_TRADES = 30;
var MIN_LIVE_EDGE = .02;
var MIN_LIVE_WIN_PROBABILITY = .65;
var MIN_VALIDATION_WIN_RATE = .65;
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function featureAt(candles, end) {
	const window = candles.slice(end - FEATURE_WINDOW, end);
	if (window.length < FEATURE_WINDOW) return null;
	const closes = window.map((candle) => candle.close);
	const ranges = window.map((candle) => Math.max(0, candle.high - candle.low));
	const averageRange = ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
	const latest = closes[closes.length - 1];
	const rangeFloor = Math.max(averageRange, Math.abs(latest) * 1e-10, 1e-12);
	const momentum = (bars) => {
		const begin = window.length - bars;
		const slice = window.slice(begin);
		const denominator = slice.reduce((sum, candle) => sum + Math.max(0, candle.high - candle.low), 0);
		return denominator > 0 ? (slice[slice.length - 1].close - slice[0].open) / denominator : 0;
	};
	const candleAgreement = (bars) => {
		const slice = window.slice(-bars);
		return slice.filter((candle) => candle.close > candle.open).length / slice.length;
	};
	const bodyRatio = (bars) => {
		const slice = window.slice(-bars);
		return slice.reduce((sum, candle) => {
			const range = Math.max(candle.high - candle.low, Math.abs(candle.close) * 1e-10, 1e-12);
			return sum + Math.abs(candle.close - candle.open) / range;
		}, 0) / slice.length;
	};
	let sumX = 0;
	let sumY = 0;
	let sumXY = 0;
	let sumXX = 0;
	for (let index = 0; index < closes.length; index += 1) {
		sumX += index;
		sumY += closes[index];
		sumXY += index * closes[index];
		sumXX += index * index;
	}
	const slope = (closes.length * sumXY - sumX * sumY) / (closes.length * sumXX - sumX * sumX || 1);
	const high = Math.max(...window.map((candle) => candle.high));
	const low = Math.min(...window.map((candle) => candle.low));
	const range = Math.max(high - low, rangeFloor);
	const changes = closes.slice(1).map((close, index) => close - closes[index]);
	const gains = changes.reduce((sum, value) => sum + Math.max(0, value), 0);
	const losses = changes.reduce((sum, value) => sum + Math.max(0, -value), 0);
	const rsi = losses === 0 ? 1 : gains === 0 ? 0 : 1 - 1 / (1 + gains / losses);
	const recentVolatility = ranges.slice(-6).reduce((sum, value) => sum + value, 0) / 6;
	const baseVolatility = ranges.slice(-18, -6).reduce((sum, value) => sum + value, 0) / 12;
	return [
		clamp(momentum(4), -2, 2),
		clamp(momentum(12), -2, 2),
		clamp(momentum(24), -2, 2),
		candleAgreement(5),
		candleAgreement(12),
		bodyRatio(12),
		clamp(averageRange / Math.max(Math.abs(latest), 1e-12) * 1e3, 0, 2),
		clamp((latest - low) / range, 0, 1),
		clamp(slope * FEATURE_WINDOW / range, -2, 2),
		rsi,
		clamp(recentVolatility / Math.max(baseVolatility, rangeFloor), 0, 4)
	];
}
function sigmoid(value) {
	const safe = clamp(value, -30, 30);
	return 1 / (1 + Math.exp(-safe));
}
function standardized(features, means, scales) {
	return features.map((value, index) => (value - means[index]) / scales[index]);
}
function fitLogistic(samples) {
	const featureCount = samples[0].features.length;
	const means = Array.from({ length: featureCount }, (_, index) => samples.reduce((sum, sample) => sum + sample.features[index], 0) / samples.length);
	const scales = Array.from({ length: featureCount }, (_, index) => {
		const variance = samples.reduce((sum, sample) => sum + (sample.features[index] - means[index]) ** 2, 0) / samples.length;
		return Math.sqrt(variance) || 1;
	});
	const rows = samples.map((sample) => standardized(sample.features, means, scales));
	const wins = samples.filter((sample) => sample.up === 1).length;
	const losses = samples.length - wins;
	const weights = Array(featureCount).fill(0);
	let bias = Math.log((wins + 1) / (losses + 1));
	for (let epoch = 0; epoch < 800; epoch += 1) {
		const gradients = Array(featureCount).fill(0);
		let biasGradient = 0;
		for (let row = 0; row < rows.length; row += 1) {
			const error = sigmoid(rows[row].reduce((sum, feature, index) => sum + feature * weights[index], bias)) - samples[row].up;
			biasGradient += error;
			for (let index = 0; index < featureCount; index += 1) gradients[index] += error * rows[row][index];
		}
		const rate = .06 / samples.length;
		bias -= rate * biasGradient;
		for (let index = 0; index < featureCount; index += 1) weights[index] -= rate * (gradients[index] + .03 * weights[index]);
	}
	return {
		means,
		scales,
		weights,
		bias
	};
}
function score(model, features) {
	return standardized(features, model.means, model.scales).reduce((sum, value, index) => sum + value * model.weights[index], model.bias);
}
function calibrate(logits, labels) {
	let slope = 1;
	let intercept = 0;
	for (let epoch = 0; epoch < 600; epoch += 1) {
		let slopeGradient = 0;
		let interceptGradient = 0;
		for (let index = 0; index < logits.length; index += 1) {
			const error = sigmoid(slope * logits[index] + intercept) - labels[index];
			slopeGradient += error * logits[index];
			interceptGradient += error;
		}
		const rate = .025 / logits.length;
		slope -= rate * (slopeGradient + .02 * (slope - 1));
		intercept -= rate * interceptGradient;
	}
	return {
		slope,
		intercept
	};
}
function expectedValue(probabilityUp, payout, direction) {
	const winProbability = direction === "call" ? probabilityUp : 1 - probabilityUp;
	return winProbability * (payout / 100) - (1 - winProbability);
}
function bestSide(probabilityUp, payout) {
	const callValue = expectedValue(probabilityUp, payout, "call");
	const putValue = expectedValue(probabilityUp, payout, "put");
	return callValue >= putValue ? {
		direction: "call",
		probability: probabilityUp,
		expectedValue: callValue
	} : {
		direction: "put",
		probability: 1 - probabilityUp,
		expectedValue: putValue
	};
}
function analyzeCandleHistory(candles, expirySeconds, candleSeconds, payout) {
	const exactHorizon = expirySeconds / candleSeconds;
	const horizon = Math.max(1, Math.ceil(exactHorizon));
	const samples = [];
	for (let end = FEATURE_WINDOW; end + horizon - 1 < candles.length; end += 1) {
		const features = featureAt(candles, end);
		if (!features) continue;
		const entry = candles[end - 1].close;
		const targetIndex = end - 1 + exactHorizon;
		const lowerIndex = Math.floor(targetIndex);
		const upperIndex = Math.ceil(targetIndex);
		const fraction = targetIndex - lowerIndex;
		const future = candles[lowerIndex].close + (candles[upperIndex].close - candles[lowerIndex].close) * fraction;
		if (future === entry) continue;
		samples.push({
			features,
			up: future > entry ? 1 : 0
		});
	}
	const sampleCount = samples.length;
	if (sampleCount < 160) return {
		status: "not-ready",
		reason: "insufficient-history",
		sampleCount
	};
	const trainEnd = Math.floor(sampleCount * .7);
	const calibrationEnd = Math.floor(sampleCount * .85);
	const embargo = horizon;
	const training = samples.slice(0, Math.max(0, trainEnd - embargo));
	const calibrationSamples = samples.slice(trainEnd + embargo, Math.max(trainEnd + embargo, calibrationEnd - embargo));
	const validation = samples.slice(calibrationEnd + embargo);
	const trainingUps = training.filter((sample) => sample.up === 1).length;
	const calibrationUps = calibrationSamples.filter((sample) => sample.up === 1).length;
	const validationUps = validation.filter((sample) => sample.up === 1).length;
	if (trainingUps < 25 || training.length - trainingUps < 25 || calibrationUps < 8 || calibrationSamples.length - calibrationUps < 8 || validationUps < 8 || validation.length - validationUps < 8) return {
		status: "not-ready",
		reason: "class-balance",
		sampleCount
	};
	const model = fitLogistic(training);
	const calibration = calibrate(calibrationSamples.map((sample) => score(model, sample.features)), calibrationSamples.map((sample) => sample.up));
	const probabilities = validation.map((sample) => sigmoid(calibration.slope * score(model, sample.features) + calibration.intercept));
	const baselineRate = calibrationUps / calibrationSamples.length;
	const brierScore = probabilities.reduce((sum, probability, index) => sum + (probability - validation[index].up) ** 2, 0) / validation.length;
	const baselineBrier = validation.reduce((sum, sample) => sum + (baselineRate - sample.up) ** 2, 0) / validation.length;
	let validationTrades = 0;
	let validationWins = 0;
	let validationReturn = 0;
	for (let index = 0; index < validation.length; index += 1) {
		const choice = bestSide(probabilities[index], payout);
		if (choice.probability < .65 || choice.expectedValue < MIN_LIVE_EDGE) continue;
		validationTrades += 1;
		const won = choice.direction === "call" ? validation[index].up === 1 : validation[index].up === 0;
		if (won) validationWins += 1;
		validationReturn += won ? payout / 100 : -1;
	}
	const averageValidationReturn = validationTrades ? validationReturn / validationTrades : 0;
	const validationWinRate = validationTrades ? validationWins / validationTrades : 0;
	if (brierScore >= baselineBrier || validationTrades < MIN_VALIDATION_TRADES || validationWinRate < MIN_VALIDATION_WIN_RATE || averageValidationReturn <= 0) return {
		status: "not-ready",
		reason: "failed-validation",
		sampleCount
	};
	const currentFeatures = featureAt(candles, candles.length);
	if (!currentFeatures) return {
		status: "not-ready",
		reason: "insufficient-history",
		sampleCount
	};
	const choice = bestSide(sigmoid(calibration.slope * score(model, currentFeatures) + calibration.intercept), payout);
	if (choice.probability < .65 || choice.expectedValue < MIN_LIVE_EDGE) return {
		status: "no-edge",
		sampleCount
	};
	return {
		status: "ready",
		direction: choice.direction,
		probability: choice.probability,
		expectedValue: choice.expectedValue,
		brierScore,
		baselineBrier,
		sampleCount,
		validationTrades,
		validationWinRate,
		validationReturn: averageValidationReturn
	};
}
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
function acceptsMarketAiReview(review, candidate) {
	return review?.decision === "signal" && review.symbol === candidate.symbol && review.direction === candidate.direction && review.confidence >= 80;
}
async function analyzeMarketCandidates(expirySeconds, candleSeconds, candidates) {
	if (candidates.length === 0) return {
		decision: "pass",
		reason: "Нет свечных кандидатов для анализа."
	};
	const input = {
		expirySeconds,
		candleSeconds,
		candleFormat: "Последовательность OHLC, oldest-to-newest; значения в basis points относительно close предыдущей свечи.",
		candidates: candidates.map((candidate) => ({
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
				content: "Ты анализируешь направление ближайшего движения по свечам OHLC для сигнала CALL/PUT. Используй только переданные данные, сравни доступные пары по вероятности верного направления и пропускай сомнительные ситуации. Не учитывай размер выплаты как причину повысить уверенность. Самооценка confidence не является статистически калиброванной вероятностью. Не обещай результат и не открывай сделки. Не выдумывай индикаторы, уровни цены, новости или сведения, которых нет во входных данных. Все пять текстов explanation должны быть написаны тобой по-русски: pairSelection — почему выбрана эта пара; если пара одна, прямо скажи, что сравнения не было; candleEvidence — конкретные видимые свойства OHLC; directionRationale — почему эти свечи поддерживают CALL или PUT; riskFactors — что может привести к ошибке; invalidation — какое наблюдаемое движение ослабит сценарий без указания выдуманной цены. Кратко, но содержательно. Верни только JSON: либо {\"decision\":\"signal\",\"symbol\":\"точный symbol из списка\",\"direction\":\"call\"|\"put\",\"confidence\":0..100 целое,\"explanation\":{\"pairSelection\":\"...\",\"candleEvidence\":\"...\",\"directionRationale\":\"...\",\"riskFactors\":\"...\",\"invalidation\":\"...\"}}, либо {\"decision\":\"pass\",\"reason\":\"кратко по-русски\"}."
			}, {
				role: "user",
				content: JSON.stringify(input)
			}]
		})).choices[0]?.message?.content;
	} catch {
		throw new Error("OpenAI не смог завершить анализ. Сигнал не выдан.");
	}
	const review = content ? parseMarketAiReview(content, candidates.map((candidate) => candidate.symbol)) : null;
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
function buildAiSignal(candles, expirySeconds, analysisSeconds, name, payout) {
	const decision = analyzeCandleHistory(candles, expirySeconds, analysisSeconds, payout);
	if (decision.status !== "ready") return decision;
	const pack = candles.slice(-28);
	const price = candles[candles.length - 1]?.close ?? 0;
	const sample = pack[pack.length - 1]?.close ?? price;
	const digits = sample >= 100 ? 2 : sample >= 10 ? 3 : 5;
	const cut = (value) => Number(value.toFixed(digits));
	const directionLabel = decision.direction === "call" ? "вверх" : "вниз";
	const signedValue = `${decision.expectedValue >= 0 ? "+" : ""}${decision.expectedValue.toFixed(3)}`;
	return {
		name,
		payout,
		direction: decision.direction,
		openPrice: price,
		analysisSeconds,
		ruleScore: decision.probability,
		aiProbability: decision.probability,
		aiExpectedValue: decision.expectedValue,
		aiBrierScore: decision.brierScore,
		aiBaselineBrier: decision.baselineBrier,
		aiSamples: decision.sampleCount,
		aiValidationTrades: decision.validationTrades,
		aiValidationReturn: decision.validationReturn,
		note: [
			`Статистическая проверка подтвердила направление ${directionLabel} по свечам Pocket Option WebSocket.`,
			`Калиброванная вероятность выигрыша направления: ${(decision.probability * 100).toFixed(1)}%.`,
			`Ожидаемое значение на ставку 1 ед.: ${signedValue} ед.`,
			`Проверочный процент побед: ${(decision.validationWinRate * 100).toFixed(1)}% на ${decision.validationTrades} входах.`,
			`Проверка калибровки на более поздних свечах: Brier ${decision.brierScore.toFixed(3)} против базовых ${decision.baselineBrier.toFixed(3)}.`,
			`Экспирация ${formatExpiry(expirySeconds)}; интервал свечи ${formatExpiry(analysisSeconds)}.`
		].join("\n"),
		bars: pack.map((candle) => [
			cut(candle.open),
			cut(candle.high),
			cut(candle.low),
			cut(candle.close)
		])
	};
}
function appendDirectAiReview(signal, review) {
	const directionLabel = review.direction === "call" ? "CALL (вверх)" : "PUT (вниз)";
	signal.note = [
		signal.note,
		`Прямой анализ OpenAI ${DIRECT_AI_MODEL}: ${directionLabel}; самооценка уверенности ${review.confidence}/100.`,
		`ИИ — выбор пары: ${review.explanation.pairSelection}`,
		`ИИ — разбор свечей: ${review.explanation.candleEvidence}`,
		`ИИ — аргумент направления: ${review.explanation.directionRationale}`,
		`ИИ — риски сценария: ${review.explanation.riskFactors}`,
		`ИИ — что ослабит сценарий: ${review.explanation.invalidation}`,
		"Самооценка OpenAI не является калиброванной исторической точностью; сигнал выдан только при совпадении со статистической проверкой."
	].join("\n");
}
function aiNotReadyMessage(decision) {
	if (!decision || decision.status === "ready") return "ИИ не нашёл направление с положительным ожидаемым значением.";
	if (decision.status === "no-edge") return `Нет сигнала с вероятностью победы не ниже ${(MIN_LIVE_WIN_PROBABILITY * 100).toFixed(0)}% и положительным ожидаемым значением.`;
	if (decision.reason === "insufficient-history") return `ИИ не получил достаточно исторических свечей для обучения и проверки (найдено ${decision.sampleCount} примеров, нужно не менее 160).`;
	if (decision.reason === "class-balance") return "ИИ не может надёжно проверить модель: в исторических свечах недостаточно примеров обоих направлений.";
	return "ИИ-модель не прошла проверку на более поздних свечах. Сигнал не выдан.";
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
	const maxPages = Math.ceil(512 / HISTORY_PAGE_CANDLES) + 1;
	for (let page = 0; page < maxPages && collected.size < 512; page += 1) {
		const candles = await loadHistoryPage(symbol, seconds, cursor);
		if (candles.length === 0) break;
		const previousSize = collected.size;
		for (const candle of candles) collected.set(candle.time, candle);
		const oldestTime = candles[0].time;
		if (collected.size === previousSize || oldestTime <= 0 || oldestTime >= cursor) break;
		cursor = oldestTime - 1;
	}
	return [...collected.values()].sort((a, b) => a.time - b.time).slice(-512);
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
	const evaluated = buildAiSignal(candles, expirySeconds, analysisSeconds, pair.name, pair.payout);
	if ("status" in evaluated) {
		if (evaluated.status === "no-edge") return null;
		throw new Error(aiNotReadyMessage(evaluated));
	}
	const review = await analyzeMarketCandidates(expirySeconds, analysisSeconds, [{
		symbol,
		name: pair.name,
		candles
	}]);
	if (review.decision !== "signal") return null;
	if (!acceptsMarketAiReview(review, {
		symbol,
		direction: evaluated.direction
	})) return null;
	appendDirectAiReview(evaluated, review);
	evaluated.openPrice = await waitQuote(symbol);
	return evaluated;
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
	let validatedModels = 0;
	let largestSampleCount = 0;
	let latestDecision = null;
	for (const pair of pool) try {
		const candles = await loadCandles(pair.symbol, analysisSeconds);
		const evaluated = buildAiSignal(candles, expirySeconds, analysisSeconds, pair.name, pair.payout);
		if ("status" in evaluated) {
			largestSampleCount = Math.max(largestSampleCount, evaluated.sampleCount);
			latestDecision = evaluated;
			if (evaluated.status === "no-edge") validatedModels += 1;
			continue;
		}
		validatedModels += 1;
		candidates.push({
			signal: evaluated,
			symbol: pair.symbol,
			group: pair.group,
			candles
		});
	} catch {}
	if (candidates.length === 0 && validatedModels === 0) {
		if (latestDecision) throw new Error(aiNotReadyMessage({
			...latestDecision,
			sampleCount: largestSampleCount
		}));
		throw new Error("Не удалось получить исторические свечи Pocket Option по WebSocket.");
	}
	if (candidates.length === 0) return null;
	const review = await analyzeMarketCandidates(expirySeconds, analysisSeconds, candidates.map((candidate) => ({
		symbol: candidate.symbol,
		name: candidate.signal.name,
		candles: candidate.candles
	})));
	if (review.decision !== "signal") return null;
	const best = candidates.find((candidate) => candidate.symbol === review.symbol);
	if (!best || !acceptsMarketAiReview(review, {
		symbol: best.symbol,
		direction: best.signal.direction
	})) return null;
	appendDirectAiReview(best.signal, review);
	best.signal.openPrice = await waitQuote(best.symbol);
	return {
		...best.signal,
		symbol: best.symbol,
		group: best.group,
		seconds: expirySeconds,
		analysisSeconds
	};
}
//#endregion
export { feedBest, feedClose, feedSignal, feedSnapshot, followQuote, quoteStatus };
