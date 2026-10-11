import { a as SIGNAL_HISTORY_PAGE_TIMEOUT_MS, l as formatExpiry, o as SIGNAL_PREPARATION_TIMEOUT_MS, r as SIGNAL_ANALYSIS_TIMEOUT_MS, s as SIGNAL_QUOTE_WAIT_MS } from "./pocket-gate.middleware-DUmnshuu.mjs";
import { a as object, i as number, n as discriminatedUnion, o as string, r as literal, t as _enum } from "../_libs/zod.mjs";
import { a as waitForSignalRequest, n as settleSignalRequest, r as signalReleaseAt, t as nextCandleEntryWindow } from "./signal-release-time-BwXoMN_N.mjs";
import { n as wrapper_default, t as GoogleGenAI } from "../_libs/@google/genai.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pocket-live.server-f__fhBF9.js
function higherTimeframeForAnalysis(candleSeconds) {
	switch (candleSeconds) {
		case 60: return 300;
		case 180:
		case 300: return 900;
		case 900: return 3600;
		default: return null;
	}
}
function isValidCandle(candle) {
	return Number.isFinite(candle.time) && Number.isFinite(candle.open) && Number.isFinite(candle.high) && Number.isFinite(candle.low) && Number.isFinite(candle.close) && candle.time > 0 && candle.open > 0 && candle.high > 0 && candle.low > 0 && candle.close > 0 && candle.high >= candle.low && candle.high >= Math.max(candle.open, candle.close) && candle.low <= Math.min(candle.open, candle.close);
}
function round(value) {
	return Number.isFinite(value) ? Number(value.toFixed(3)) : null;
}
function basisPoints(value, base) {
	return base > 0 ? round((value / base - 1) * 1e4) : null;
}
function signedMagnitudeBps(value, base) {
	return base > 0 ? round(value / base * 1e4) : null;
}
function average(values) {
	if (values.length === 0) return null;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function emaSeries(values, period) {
	const result = Array.from({ length: values.length }, () => null);
	if (values.length < period) return result;
	const seed = average(values.slice(0, period));
	if (seed === null) return result;
	let current = seed;
	result[period - 1] = current;
	const smoothing = 2 / (period + 1);
	for (let index = period; index < values.length; index += 1) {
		const value = values[index];
		if (value === void 0) continue;
		current = (value - current) * smoothing + current;
		result[index] = current;
	}
	return result;
}
function rsi(closes, period = 14) {
	if (closes.length <= period) return null;
	let averageGain = 0;
	let averageLoss = 0;
	for (let index = 1; index <= period; index += 1) {
		const current = closes[index];
		const previous = closes[index - 1];
		if (current === void 0 || previous === void 0) return null;
		const change = current - previous;
		averageGain += Math.max(0, change);
		averageLoss += Math.max(0, -change);
	}
	averageGain /= period;
	averageLoss /= period;
	for (let index = period + 1; index < closes.length; index += 1) {
		const current = closes[index];
		const previous = closes[index - 1];
		if (current === void 0 || previous === void 0) return null;
		const change = current - previous;
		averageGain = (averageGain * (period - 1) + Math.max(0, change)) / period;
		averageLoss = (averageLoss * (period - 1) + Math.max(0, -change)) / period;
	}
	if (averageLoss === 0) return averageGain === 0 ? 50 : 100;
	return round(100 - 100 / (1 + averageGain / averageLoss));
}
function averageTrueRange(candles, period) {
	if (candles.length < period) return null;
	return average(candles.map((candle, index) => {
		const previousClose = candles[index - 1]?.close ?? candle.open;
		return Math.max(candle.high - candle.low, Math.abs(candle.high - previousClose), Math.abs(candle.low - previousClose));
	}).slice(-period));
}
function directionalMovement(candles, period = 14) {
	const unavailable = {
		adx14: null,
		plusDi14: null,
		minusDi14: null
	};
	if (candles.length < period * 2) return unavailable;
	const trueRanges = [];
	const plusMoves = [];
	const minusMoves = [];
	for (let index = 1; index < candles.length; index += 1) {
		const current = candles[index];
		const previous = candles[index - 1];
		if (!current || !previous) return unavailable;
		const upMove = current.high - previous.high;
		const downMove = previous.low - current.low;
		trueRanges.push(Math.max(current.high - current.low, Math.abs(current.high - previous.close), Math.abs(current.low - previous.close)));
		plusMoves.push(upMove > downMove && upMove > 0 ? upMove : 0);
		minusMoves.push(downMove > upMove && downMove > 0 ? downMove : 0);
	}
	if (trueRanges.length < period * 2 - 1) return unavailable;
	let smoothedTrueRange = trueRanges.slice(0, period).reduce((sum, value) => sum + value, 0);
	let smoothedPlus = plusMoves.slice(0, period).reduce((sum, value) => sum + value, 0);
	let smoothedMinus = minusMoves.slice(0, period).reduce((sum, value) => sum + value, 0);
	const dxValues = [];
	const appendDx = () => {
		if (smoothedTrueRange <= 0) {
			dxValues.push(0);
			return;
		}
		const plusDi = smoothedPlus / smoothedTrueRange * 100;
		const minusDi = smoothedMinus / smoothedTrueRange * 100;
		const sum = plusDi + minusDi;
		dxValues.push(sum === 0 ? 0 : Math.abs(plusDi - minusDi) / sum * 100);
	};
	appendDx();
	for (let index = period; index < trueRanges.length; index += 1) {
		const trueRange = trueRanges[index];
		const plusMove = plusMoves[index];
		const minusMove = minusMoves[index];
		if (trueRange === void 0 || plusMove === void 0 || minusMove === void 0) continue;
		smoothedTrueRange = smoothedTrueRange - smoothedTrueRange / period + trueRange;
		smoothedPlus = smoothedPlus - smoothedPlus / period + plusMove;
		smoothedMinus = smoothedMinus - smoothedMinus / period + minusMove;
		appendDx();
	}
	if (dxValues.length < period || smoothedTrueRange <= 0) return unavailable;
	let adx = average(dxValues.slice(0, period));
	if (adx === null) return unavailable;
	for (let index = period; index < dxValues.length; index += 1) {
		const dx = dxValues[index];
		if (dx !== void 0) adx = (adx * (period - 1) + dx) / period;
	}
	return {
		adx14: round(adx),
		plusDi14: round(smoothedPlus / smoothedTrueRange * 100),
		minusDi14: round(smoothedMinus / smoothedTrueRange * 100)
	};
}
function macdHistogram(closes) {
	const fast = emaSeries(closes, 12);
	const slow = emaSeries(closes, 26);
	const macd = [];
	for (let index = 0; index < closes.length; index += 1) {
		const fastValue = fast[index];
		const slowValue = slow[index];
		if (fastValue !== null && fastValue !== void 0 && slowValue !== null && slowValue !== void 0) macd.push(fastValue - slowValue);
	}
	const signal = emaSeries(macd, 9);
	const macdValue = macd.at(-1);
	const signalValue = signal.at(-1);
	const lastClose = closes.at(-1);
	if (macdValue === void 0 || signalValue === null || signalValue === void 0 || lastClose === void 0) return null;
	return signedMagnitudeBps(macdValue - signalValue, lastClose);
}
function bollingerZScore(closes, period = 20) {
	const sample = closes.slice(-period);
	if (sample.length < period) return null;
	const mean = average(sample);
	if (mean === null) return null;
	const variance = sample.reduce((sum, value) => sum + (value - mean) ** 2, 0) / period;
	const standardDeviation = Math.sqrt(variance);
	const lastClose = sample.at(-1);
	if (lastClose === void 0) return null;
	if (standardDeviation === 0) return 0;
	return round((lastClose - mean) / standardDeviation);
}
function returnOverBars(closes, bars) {
	const latest = closes.at(-1);
	const earlier = closes.at(-(bars + 1));
	if (latest === void 0 || earlier === void 0) return null;
	return basisPoints(latest, earlier);
}
function emaSlope(ema, bars) {
	const latest = ema.at(-1);
	const earlier = ema.at(-(bars + 1));
	if (latest === null || latest === void 0 || earlier === null || earlier === void 0) return null;
	return basisPoints(latest, earlier);
}
function technicalIndicators(candles) {
	const closes = candles.map((candle) => candle.close);
	const lastClose = closes.at(-1);
	const ema9 = emaSeries(closes, 9);
	const ema21 = emaSeries(closes, 21);
	const ema50 = emaSeries(closes, 50);
	const currentEma9 = ema9.at(-1);
	const currentEma21 = ema21.at(-1);
	const priorCandles = candles.slice(-21, -1);
	const priorHigh = priorCandles.length === 20 ? Math.max(...priorCandles.map((candle) => candle.high)) : null;
	const priorLow = priorCandles.length === 20 ? Math.min(...priorCandles.map((candle) => candle.low)) : null;
	const atr5 = averageTrueRange(candles, 5);
	const atr14 = averageTrueRange(candles, 14);
	const directional = directionalMovement(candles);
	return {
		recentReturnBps: {
			bars5: returnOverBars(closes, 5),
			bars14: returnOverBars(closes, 14),
			bars30: returnOverBars(closes, 30)
		},
		ema: {
			ema9Vs21Bps: currentEma9 !== null && currentEma9 !== void 0 && currentEma21 !== null && currentEma21 !== void 0 ? basisPoints(currentEma9, currentEma21) : null,
			ema21Slope5Bps: emaSlope(ema21, 5),
			ema50Slope5Bps: emaSlope(ema50, 5)
		},
		rsi14: rsi(closes),
		macdHistogramBps: macdHistogram(closes),
		bollingerZ20: bollingerZScore(closes),
		atr14Bps: atr14 !== null && lastClose !== void 0 ? signedMagnitudeBps(atr14, lastClose) : null,
		atr5To14Ratio: atr5 !== null && atr14 !== null && atr14 > 0 ? round(atr5 / atr14) : null,
		prior20HighDistanceBps: priorHigh !== null && lastClose !== void 0 ? basisPoints(priorHigh, lastClose) : null,
		prior20LowDistanceBps: priorLow !== null && lastClose !== void 0 ? basisPoints(lastClose, priorLow) : null,
		directionalMovement: directional
	};
}
function aggregateHigherTimeframe(candles, candleSeconds, higherSeconds) {
	const ratio = higherSeconds / candleSeconds;
	if (!Number.isInteger(ratio) || ratio < 2) return [];
	const buckets = /* @__PURE__ */ new Map();
	for (const candle of candles) {
		const start = Math.floor(candle.time / higherSeconds) * higherSeconds;
		const slot = Math.round((candle.time - start) / candleSeconds);
		const expectedTime = start + slot * candleSeconds;
		if (slot < 0 || slot >= ratio || Math.abs(candle.time - expectedTime) > Math.max(1, candleSeconds * .01)) continue;
		const bucket = buckets.get(start) ?? /* @__PURE__ */ new Map();
		bucket.set(slot, candle);
		buckets.set(start, bucket);
	}
	const aggregated = [];
	for (const [time, bucket] of [...buckets.entries()].sort(([a], [b]) => a - b)) {
		if (bucket.size !== ratio) continue;
		const bars = Array.from({ length: ratio }, (_, slot) => bucket.get(slot));
		if (bars.some((bar) => bar === void 0)) continue;
		const completeBars = bars;
		const first = completeBars[0];
		const last = completeBars.at(-1);
		if (!first || !last) continue;
		aggregated.push({
			time,
			open: first.open,
			high: Math.max(...completeBars.map((bar) => bar.high)),
			low: Math.min(...completeBars.map((bar) => bar.low)),
			close: last.close
		});
	}
	return aggregated.slice(-32);
}
function countMissingIntervals(candles, candleSeconds) {
	let missing = 0;
	for (let index = 1; index < candles.length; index += 1) {
		const previous = candles[index - 1];
		const current = candles[index];
		if (!previous || !current) continue;
		const elapsed = current.time - previous.time;
		if (elapsed > candleSeconds * 1.5) missing += Math.max(1, Math.round(elapsed / candleSeconds) - 1);
	}
	return missing;
}
function buildMarketAnalysisContext(inputCandles, candleSeconds, nowSeconds = Math.floor(Date.now() / 1e3)) {
	if (!Number.isInteger(candleSeconds) || candleSeconds <= 0) throw new Error("Интервал свечей должен быть положительным числом секунд.");
	const uniqueByTime = /* @__PURE__ */ new Map();
	for (const candle of inputCandles) if (isValidCandle(candle)) uniqueByTime.set(candle.time, candle);
	const normalized = [...uniqueByTime.values()].sort((a, b) => a.time - b.time);
	const closedCandles = normalized.filter((candle) => candle.time + candleSeconds <= nowSeconds);
	const candles = closedCandles.slice(-128);
	const latest = candles.at(-1);
	const latestClosedAgeSeconds = latest ? Math.max(0, Math.round(nowSeconds - (latest.time + candleSeconds))) : null;
	const higherSeconds = higherTimeframeForAnalysis(candleSeconds);
	const higherCandles = higherSeconds ? aggregateHigherTimeframe(candles, candleSeconds, higherSeconds) : [];
	return {
		candles,
		dataQuality: {
			closedCandleCount: candles.length,
			droppedOpenCandles: normalized.length - closedCandles.length,
			missingIntervals: countMissingIntervals(candles, candleSeconds),
			latestClosedCandleTime: latest?.time ?? null,
			latestClosedAgeSeconds,
			isFresh: latestClosedAgeSeconds !== null && latestClosedAgeSeconds <= candleSeconds * 3
		},
		technicalIndicators: technicalIndicators(candles),
		higherTimeframe: higherSeconds ? {
			candleSeconds: higherSeconds,
			candles: higherCandles,
			technicalIndicators: technicalIndicators(higherCandles)
		} : null
	};
}
var DIRECT_AI_MODEL = "gemini-3.6-flash";
var DIRECT_AI_MODEL_LABEL = "Gemini 3.6 Flash";
var PROXY_AI_MODEL = "gemini-2.5-flash";
var PROXY_AI_MODEL_LABEL = "Gemini 2.5 Flash";
var GEMINI_MAX_OUTPUT_TOKENS = 8192;
var GEMINI_THINKING_BUDGET = 2048;
function geminiGenerationConfig(systemInstruction, model) {
	return {
		systemInstruction,
		responseMimeType: "application/json",
		maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
		...model === "gemini-2.5-flash" ? { thinkingConfig: { thinkingBudget: GEMINI_THINKING_BUDGET } } : {}
	};
}
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
var DIRECT_AI_SYSTEM_PROMPT = [
	"Ты анализируешь одну OTC-валютную пару. В данных есть свежая цена, до 30 последних закрытых минутных OHLC-свечей и краткая серия close.",
	"Используй dataQuality для оценки полноты и свежести. Времена свечей заданы в Unix-секундах; null означает, что показатель недоступен, а не ноль. Значения с суффиксом Bps заданы в базисных пунктах.",
	"Учитывай EMA 9/21/50 и наклоны, RSI 14, MACD-гистограмму, Bollinger z-score, ATR и его отношение, недавние доходности, расстояния до прошлых максимумов/минимумов, а также ADX 14 и +DI/-DI. ADX оценивает силу, а не направление тренда; сравнивай +DI с -DI и проверяй согласованность с EMA, старшим таймфреймом и реальными OHLC-свечами.",
	"Не называй движение выраженным трендом, если ADX слабый или индикаторы и старший таймфрейм противоречат друг другу. Не выдумывай OHLC, индикаторы, новости или цены. Учитывай срок экспирации из входных данных; по умолчанию это 120 секунд.",
	"Поле trend сравнивает последнее закрытие с закрытием четырьмя свечами ранее; используй его вместе с индикаторами, а не как единственное основание.",
	"При корректных входных данных обязательно выбери направление вверх или вниз. Не используй вторую модель-классификатор. Не добавляй к заданному формату дополнительные поля или метки.",
	"Верни только один компактный JSON-объект: {\"direction\":\"up\"|\"down\",\"explanation\":\"одно короткое предложение на русском, не более 160 символов\",\"confidence\":0..100}. Уверенность — субъективная оценка, а не вероятность выигрыша и не подтверждённая статистика. Не обещай результат и не открывай сделки."
].join(" ");
function activeGeminiModel(env = process.env) {
	const hasProxyBase = Boolean(env.AI_INTEGRATIONS_GEMINI_BASE_URL);
	const hasProxyKey = Boolean(env.AI_INTEGRATIONS_GEMINI_API_KEY);
	if (hasProxyBase || hasProxyKey) {
		if (!hasProxyBase || !hasProxyKey) throw new Error("Настройки Gemini proxy неполные. Сигнал не выдан.");
		return {
			model: PROXY_AI_MODEL,
			label: PROXY_AI_MODEL_LABEL,
			proxyBaseUrl: env.AI_INTEGRATIONS_GEMINI_BASE_URL
		};
	}
	return {
		model: DIRECT_AI_MODEL,
		label: DIRECT_AI_MODEL_LABEL
	};
}
var client = null;
var clientIdentity = "";
function getGeminiClient() {
	const hasProxy = Boolean(process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || process.env.AI_INTEGRATIONS_GEMINI_API_KEY);
	const apiKey = hasProxy ? process.env.AI_INTEGRATIONS_GEMINI_API_KEY : process.env.GEMINI_API_KEY;
	if (!apiKey) throw new Error(hasProxy ? "Настройки Gemini proxy неполные. Сигнал не выдан." : "Gemini не настроен. Добавьте GEMINI_API_KEY в Replit Secrets или настройте Replit Gemini proxy.");
	const model = activeGeminiModel();
	const identity = `${model.model}\u0000${apiKey}\u0000${model.proxyBaseUrl ?? ""}`;
	if (!client || clientIdentity !== identity) {
		client = new GoogleGenAI({
			apiKey,
			httpOptions: {
				...model.proxyBaseUrl ? {
					apiVersion: "",
					baseUrl: model.proxyBaseUrl
				} : {},
				timeout: SIGNAL_ANALYSIS_TIMEOUT_MS,
				retryOptions: { attempts: 1 }
			}
		});
		clientIdentity = identity;
	}
	return {
		client,
		model
	};
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function errorStatusCode(error) {
	const status = isRecord(error) ? Number(error.status ?? error.statusCode) : NaN;
	return Number.isFinite(status) ? status : null;
}
function isMarketAiTimeout(error) {
	const status = errorStatusCode(error);
	const name = error instanceof Error ? error.name.toLowerCase() : "";
	return status === 408 || status === 504 || name.includes("timeout") || name.includes("abort");
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
	if (typeof value === "string") return value.trim().slice(0, 1200) || null;
	const source = isRecord(value) ? value : root;
	const parts = [
		firstString(source, [
			"explanation",
			"summary",
			"analysis",
			"reasoning",
			"rationale",
			"reason"
		]),
		firstString(source, [
			"candleEvidence",
			"candle_evidence",
			"evidence",
			"candleAnalysis",
			"candle_analysis"
		]),
		firstString(source, [
			"directionRationale",
			"direction_rationale",
			"directionReason",
			"direction_reason"
		]),
		firstString(source, [
			"riskFactors",
			"risk_factors",
			"risks",
			"risk"
		]),
		firstString(source, [
			"invalidation",
			"invalidationCondition",
			"invalidation_condition",
			"invalidationSignal"
		])
	];
	return [...new Set(parts.map((part) => part.trim()).filter(Boolean))].join(" ").slice(0, 1200) || null;
}
function standardDeviation(values) {
	if (values.length === 0) return null;
	const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
	const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
	return Number.isFinite(variance) ? Math.sqrt(variance) : null;
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
function marketAiApiErrorMessage(error) {
	if (error instanceof Error && (error.message.includes("Gemini не настроен") || error.message.includes("Настройки Gemini proxy"))) return error.message;
	const status = errorStatusCode(error) ?? NaN;
	const name = error instanceof Error ? error.name.toLowerCase() : "";
	if (status === 401 || status === 403) return "Gemini отклонил подключение. Проверьте API key или настройки proxy; сигнал не выдан.";
	if (status === 429) return "Gemini временно ограничил запросы. Подождите немного и попробуйте ещё раз.";
	if (isMarketAiTimeout(error)) return "Анализ Gemini занял слишком много времени. Попробуйте ещё раз; сигнал не выдан.";
	if (status === 400) return "Gemini отклонил формат запроса. Проверьте настройку модели и повторите попытку.";
	if (status === 404) return "Выбранная модель Gemini сейчас недоступна. Проверьте имя модели и повторите попытку.";
	if (status >= 500 || name.includes("connection")) return "Сервис Gemini временно недоступен. Попробуйте ещё раз через минуту.";
	return "Не удалось завершить анализ Gemini. Попробуйте ещё раз; сигнал не выдан.";
}
function requestMarketAiCompletion(messages) {
	const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
	const userPrompt = messages.filter((message) => message.role === "user").map((message) => message.content).join("\n\n");
	const { client: gemini, model } = getGeminiClient();
	return gemini.models.generateContent({
		model: model.model,
		contents: [{
			role: "user",
			parts: [{ text: userPrompt }]
		}],
		config: geminiGenerationConfig(system, model.model)
	}).then((response) => ({ choices: [{
		message: { content: response.text || null },
		finish_reason: String(response.candidates?.[0]?.finishReason ?? "STOP")
	}] }));
}
function withTimeout(request, timeoutMs) {
	let timer;
	const timeout = new Promise((_, reject) => {
		timer = setTimeout(() => {
			const error = /* @__PURE__ */ new Error(`Gemini request exceeded ${timeoutMs} ms.`);
			error.name = "TimeoutError";
			reject(error);
		}, timeoutMs);
	});
	return Promise.race([request, timeout]).finally(() => {
		if (timer) clearTimeout(timer);
	});
}
async function requestMarketAiReviewOnce(request, baseMessages, allowedSymbols, timeoutMs = SIGNAL_ANALYSIS_TIMEOUT_MS) {
	let choice;
	const startedAt = performance.now();
	let timedOut = false;
	let errorStatus = null;
	let errorName = null;
	try {
		choice = (await withTimeout(request(baseMessages), timeoutMs)).choices[0];
	} catch (error) {
		timedOut = isMarketAiTimeout(error);
		errorStatus = errorStatusCode(error);
		errorName = error instanceof Error ? error.name : null;
		throw new Error(marketAiApiErrorMessage(error));
	} finally {
		console.info("[signal-ai-duration]", JSON.stringify({
			durationMs: Math.round(performance.now() - startedAt),
			timeoutMs,
			timedOut,
			errorStatus,
			errorName
		}));
	}
	const content = choice?.message.content;
	const review = typeof content === "string" ? parseMarketAiReview(content, allowedSymbols) : null;
	if (review) return review;
	if (choice?.message.refusal) throw new Error("Gemini отказался выполнить анализ. Сигнал не выдан.");
	if (choice?.finish_reason?.toLowerCase().includes("max_tokens")) throw new Error("Gemini оборвал ответ по лимиту длины. Сигнал не выдан.");
	throw new Error("Gemini вернул ответ, который не удалось проверить. Сигнал не выдан.");
}
async function analyzeMarketCandidates(expirySeconds, candleSeconds, candidates, options = {}) {
	const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1e3);
	const preparedCandidates = candidates.slice(0, 1).map((candidate) => ({
		...candidate,
		context: buildMarketAnalysisContext(candidate.candles, candleSeconds, nowSeconds)
	}));
	const eligibleCandidates = preparedCandidates.filter((candidate) => candidate.context.candles.length >= 15 && candidate.context.dataQuality.isFresh && Number.isFinite(candidate.currentPrice) && candidate.currentPrice > 0 && Number.isFinite(candidate.quoteAgeMs) && candidate.quoteAgeMs >= 0 && candidate.quoteAgeMs <= 2e4);
	if (eligibleCandidates.length === 0) return {
		decision: "pass",
		reason: preparedCandidates.some((candidate) => candidate.context.candles.length >= 15 && !candidate.context.dataQuality.isFresh) ? "Последняя закрытая свеча слишком старая для надёжного анализа. Сигнал не выдан." : preparedCandidates.some((candidate) => !Number.isFinite(candidate.currentPrice) || !Number.isFinite(candidate.quoteAgeMs) || candidate.quoteAgeMs < 0 || candidate.quoteAgeMs > 2e4) ? "Живая котировка старше 20 секунд или недоступна. Сигнал не выдан." : `После проверки данных нужно не менее 15 закрытых корректных свечей на пару.`
	};
	const candidate = eligibleCandidates[0];
	if (!candidate) return {
		decision: "pass",
		reason: "Не удалось подготовить данные выбранной пары. Сигнал не выдан."
	};
	const closes = candidate.context.candles.slice(-30).map((candle) => candle.close);
	const recentCandles = candidate.context.candles.slice(-30).map((candle) => ({
		time: candle.time,
		open: candle.open,
		high: candle.high,
		low: candle.low,
		close: candle.close
	}));
	const latestClose = closes.at(-1);
	const closeFourCandlesEarlier = closes.at(-5);
	const volatility = standardDeviation(closes.slice(-12));
	if (latestClose === void 0 || closeFourCandlesEarlier === void 0 || volatility === null) return {
		decision: "pass",
		reason: `Для анализа нужны минимум 15 закрытых корректных свечей.`
	};
	const trendChange = latestClose - closeFourCandlesEarlier;
	const trend = latestClose > closeFourCandlesEarlier ? "up" : latestClose < closeFourCandlesEarlier ? "down" : "flat";
	const input = {
		symbol: candidate.symbol,
		pair: candidate.name,
		expirySeconds,
		candleSeconds,
		currentPrice: candidate.currentPrice,
		quoteAgeMs: Math.round(candidate.quoteAgeMs),
		quoteVsLastCloseBps: Number(((candidate.currentPrice / latestClose - 1) * 1e4).toFixed(3)),
		dataQuality: {
			...candidate.context.dataQuality,
			expectedCandleSeconds: candleSeconds
		},
		technicalIndicators: candidate.context.technicalIndicators,
		higherTimeframe: candidate.context.higherTimeframe ? {
			candleSeconds: candidate.context.higherTimeframe.candleSeconds,
			candles: candidate.context.higherTimeframe.candles.slice(-24).map((candle) => ({
				time: candle.time,
				open: candle.open,
				high: candle.high,
				low: candle.low,
				close: candle.close
			})),
			technicalIndicators: candidate.context.higherTimeframe.technicalIndicators
		} : null,
		trend: {
			comparison: "последний закрытый close против close четыре минутные свечи назад",
			direction: trend,
			latestClose,
			closeFourCandlesEarlier,
			change: Number(trendChange.toPrecision(8)),
			changePercent: Number((trendChange / closeFourCandlesEarlier * 100).toPrecision(8))
		},
		volatility: {
			periodCandles: 12,
			standardDeviation: Number(volatility.toPrecision(8))
		},
		closes,
		candles: recentCandles
	};
	const userPrompt = JSON.stringify(input);
	console.info("[signal-ai-input]", JSON.stringify({
		symbol: input.symbol,
		expirySeconds: input.expirySeconds,
		candleSeconds: input.candleSeconds,
		currentPrice: input.currentPrice,
		quoteAgeMs: input.quoteAgeMs,
		quoteVsLastCloseBps: input.quoteVsLastCloseBps,
		dataQuality: input.dataQuality,
		technicalIndicators: input.technicalIndicators,
		higherTimeframe: input.higherTimeframe ? {
			candleSeconds: input.higherTimeframe.candleSeconds,
			candleCount: input.higherTimeframe.candles.length,
			technicalIndicators: input.higherTimeframe.technicalIndicators
		} : null,
		aiVisibleCandleCount: input.candles.length,
		latestClosedCandles: input.candles.slice(-3),
		payloadBytes: Buffer.byteLength(userPrompt, "utf8")
	}));
	const baseMessages = [{
		role: "system",
		content: DIRECT_AI_SYSTEM_PROMPT
	}, {
		role: "user",
		content: userPrompt
	}];
	return requestMarketAiReviewOnce(options.request ?? requestMarketAiCompletion, baseMessages, [candidate.symbol], options.timeoutMs);
}
function createKeyedAsyncQueue() {
	const tails = /* @__PURE__ */ new Map();
	return async function run(key, operation) {
		const previous = tails.get(key) ?? Promise.resolve();
		let releaseTurn = () => {};
		const turn = new Promise((resolve) => {
			releaseTurn = resolve;
		});
		const tail = previous.then(() => turn);
		tails.set(key, tail);
		await previous;
		try {
			return await operation();
		} finally {
			releaseTurn();
			if (tails.get(key) === tail) tails.delete(key);
		}
	};
}
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
function loadCandidatesInParallel(items, load) {
	return Promise.all(items.map(async (item) => {
		try {
			return {
				ok: true,
				item,
				value: await load(item)
			};
		} catch (error) {
			return {
				ok: false,
				item,
				error
			};
		}
	}));
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
var FEED_AUTH = (process.env.POCKET_OPTION_FEED_AUTH ?? "").trim();
var AUTH_MISSING_MESSAGE = "Не настроена свежая авторизация Pocket Option. Добавьте её в Replit Secrets как POCKET_OPTION_FEED_AUTH.";
var AUTH_REJECTED_MESSAGE = "Pocket Option отклонил авторизацию. Проверьте актуальность секрета POCKET_OPTION_FEED_AUTH.";
var HISTORY_PAGE_CANDLES = 150;
var SIGNAL_CANDIDATES_PER_SEARCH = 1;
var MAX_ELIGIBLE_PAIRS = 20;
var MIN_SIGNAL_PAYOUT = 92;
var CANDIDATE_HISTORY_PAGE_TIMEOUT_MS = 8e3;
var SIGNAL_PREPARATION_TIMEOUT_MESSAGE = "Поиск сигнала не завершился за 20 секунд. Сигнал не выдан.";
var runHistoryRequest = createKeyedAsyncQueue();
function waitForSignalPreparation(request, deadlineAtMs) {
	return waitForSignalRequest(settleSignalRequest(request), Math.max(0, deadlineAtMs - Date.now()), SIGNAL_PREPARATION_TIMEOUT_MESSAGE);
}
var pairs = /* @__PURE__ */ new Map();
var pairMarketData = /* @__PURE__ */ new Map();
var balance = null;
var socket = null;
var ready = null;
var connectionError = "";
var retryAfter = 0;
var expectAssets = false;
var expectBalance = false;
var lastPocketMessageAt = 0;
var pocketServerClockOffsetSeconds = null;
var selectSignalCandidates = createRotatingCandidateSelector(SIGNAL_CANDIDATES_PER_SEARCH);
var expectStream = false;
var pendingHistory = /* @__PURE__ */ new Map();
var lastStreamDiagnosticAt = 0;
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
function buildDirectAiSignal(candles, expirySeconds, analysisSeconds, name, payout, review) {
	const pack = candles.slice(-28);
	const price = candles[candles.length - 1]?.close ?? 0;
	const model = activeGeminiModel();
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
			`Анализ ${model.label} (${model.model}) выбрал ${directionLabel}.`,
			`Самооценка ИИ: ${review.confidence}/100; это субъективная оценка, а не измеренная вероятность или историческая точность.`,
			`ИИ — объяснение: ${review.explanation}`,
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
		if (offsetSeconds !== null && pocketServerClockOffsetSeconds === null) {
			pocketServerClockOffsetSeconds = offsetSeconds;
			console.info("[pocket-feed-clock-synced]", JSON.stringify({
				offsetSeconds,
				source: "updateStream"
			}));
		}
		const price = Number(row[2]);
		const clockOffsetSeconds = pocketServerClockOffsetSeconds ?? offsetSeconds;
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
		pairMarketData.set(symbol, state);
		quoteRows += 1;
	}
	logStreamDiagnostic("info", {
		frameFormat,
		receivedRows: rows.length,
		quoteRows,
		epochLikeTimestamps,
		clockSynced: pocketServerClockOffsetSeconds !== null
	});
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
			clockSynced: pocketServerClockOffsetSeconds !== null
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
	if (now - (subscribedAt.get(key) ?? 0) < 2e3) return;
	if (!socket || socket.readyState !== wrapper_default.OPEN) return;
	subscribedAt.set(key, now);
	sendPocketSubscription(socket, symbol, periodSeconds);
}
function waitQuote(symbol, timeoutMs = 12e3) {
	const current = latestPairQuote(symbol);
	if (current && Date.now() - current.at <= 2e3) return Promise.resolve(current.price);
	const started = Date.now();
	subscribe(symbol);
	return new Promise((resolve, reject) => {
		let settled = false;
		let quoteTimer;
		let retryTimer;
		let stopTimer;
		const clearTimers = () => {
			clearInterval(quoteTimer);
			clearInterval(retryTimer);
			clearTimeout(stopTimer);
		};
		const accept = (price) => {
			if (settled) return;
			settled = true;
			clearTimers();
			resolve(price);
		};
		quoteTimer = setInterval(() => {
			const quote = latestPairQuote(symbol);
			if (quote && quote.at >= started - 250) accept(quote.price);
		}, 200);
		retryTimer = setInterval(() => {
			const quote = latestPairQuote(symbol);
			if (!quote || Date.now() - quote.at > 2e3) subscribe(symbol);
		}, 500);
		stopTimer = setTimeout(() => {
			if (settled) return;
			settled = true;
			clearTimers();
			const quote = latestPairQuote(symbol);
			if (quote && Date.now() - quote.at <= 2e3) resolve(quote.price);
			else reject(/* @__PURE__ */ new Error(`Цена по паре ${symbol} не пришла за ${Math.ceil(timeoutMs / 1e3)} секунд. Попробуйте ещё раз.`));
		}, timeoutMs);
	});
}
function freshQuoteFromCache(symbol) {
	const quote = latestPairQuote(symbol);
	if (!quote || !Number.isFinite(quote.price) || quote.price <= 0) throw new Error(`Не удалось получить живую котировку по паре ${symbol}.`);
	const ageMs = Date.now() - quote.at;
	if (ageMs < 0 || ageMs > 2e4) throw new Error(`Котировка по паре ${symbol} старше 20 секунд. Сигнал не выдан.`);
	return {
		price: quote.price,
		ageMs
	};
}
async function waitFreshQuote(symbol, timeoutMs = 12e3) {
	await waitQuote(symbol, timeoutMs);
	return freshQuoteFromCache(symbol);
}
function entryWindowFailure(candles, nowMs = Date.now()) {
	const window = nextCandleEntryWindow(candles, nowMs);
	if (!window) return {
		decision: "pass",
		reason: "Не удалось подтвердить закрытие минутной свечи и начало следующей. Сигнал не выдан."
	};
	if (!window.canEnter) return {
		decision: "pass",
		reason: window.remainingMs < 15e3 ? "До закрытия текущей минутной свечи осталось меньше 15 секунд. Запросите сигнал в начале следующей минуты." : "Следующая минутная свеча ещё не открылась. Сигнал не выдан."
	};
	return null;
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
		current.send(FEED_AUTH);
		return;
	}
	if (message.includes("NotAuthorized")) {
		connectionError = AUTH_REJECTED_MESSAGE;
		console.warn("[pocket-feed-auth-rejected]", JSON.stringify({ socketReadyState: current.readyState }));
		failPending(new Error(connectionError));
		try {
			current.close();
		} catch {}
		return;
	}
	const socketEvent = parsePocketSocketIoEvent(message);
	if (socketEvent?.name === "updateAssets") {
		const rows = findPocketRows(socketEvent.payload, (row) => row.length >= 15 && row[14] === true && row[9] === 1);
		if (rows) {
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
				clockSynced: pocketServerClockOffsetSeconds !== null
			});
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
	if (message.startsWith("{")) {
		try {
			const parsed = JSON.parse(message);
			if (typeof parsed.asset === "string" && Array.isArray(parsed.data)) {
				const request = pendingHistory.get(parsed.asset);
				if (request) {
					clearTimeout(request.timer);
					pendingHistory.delete(parsed.asset);
					const serverClockOffsetSeconds = pocketServerClockOffsetSeconds;
					if (serverClockOffsetSeconds === null) {
						request.reject(/* @__PURE__ */ new Error("Время потока Pocket Option не синхронизировано."));
						return;
					}
					const parsedHistory = parsePocketOptionHistory(parsed.data);
					const history = {
						...parsedHistory,
						candles: parsedHistory.candles.map((candle) => ({
							...candle,
							time: pocketHistoryCandleLocalTime(candle.time, serverClockOffsetSeconds)
						}))
					};
					const state = pairMarketData.get(parsed.asset) ?? {
						ticks: [],
						history: [],
						historyPeriodSeconds: null
					};
					state.history = history.candles.slice(-30);
					state.historyPeriodSeconds = request.periodSeconds;
					pairMarketData.set(parsed.asset, state);
					console.info("[pocket-history-response]", JSON.stringify({
						symbol: parsed.asset,
						receivedRows: parsed.data.length,
						validCandles: history.candles.length,
						rejectedRows: history.rejectedRows
					}));
					request.resolve(history);
					return;
				}
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
	pocketServerClockOffsetSeconds = null;
	subscribedAt.clear();
	console.info("[pocket-feed-region-selected]", JSON.stringify({
		account: feedUrl.includes("demo-api-") ? "demo" : "real",
		region: "eu"
	}));
	const next = new wrapper_default(feedUrl, {
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
			socketReadyState: next.readyState
		}));
		socket = null;
		retryAfter = Date.now() + 2e3;
		connectionError = "Не удалось подключиться к потоку Pocket Option. Повторяем подключение.";
		failPending(new Error(connectionError));
	});
	socket = next;
	next.on("message", (data) => handleMessage(next, textOf(data)));
	next.on("close", (code, reason) => {
		if (socket !== next) return;
		console.warn("[pocket-feed-closed]", JSON.stringify({
			socketReadyState: next.readyState,
			closeCode: code,
			closeReasonLength: reason.length
		}));
		socket = null;
		retryAfter = Date.now() + 2e3;
		if (!connectionError) connectionError = "Соединение с Pocket Option прервано. Повторяем подключение.";
		failPending(new Error(connectionError));
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
function rankedSignalPairs() {
	return [...pairs.values()].filter((pair) => pair.group === "fx" && pair.symbol.toLowerCase().includes("otc") && pair.payout >= MIN_SIGNAL_PAYOUT).sort((a, b) => b.payout - a.payout || a.name.localeCompare(b.name)).slice(0, MAX_ELIGIBLE_PAIRS);
}
function selectRotatingSignalPair(ranked, excludedSymbols = []) {
	const excluded = new Set(excludedSymbols.map((symbol) => symbol.toLowerCase()));
	for (let index = 0; index < ranked.length; index += 1) {
		const next = selectSignalCandidates(ranked)[0];
		if (next && !excluded.has(next.symbol.toLowerCase())) return next;
	}
	return selectSignalCandidates(ranked)[0] ?? null;
}
async function feedNextPair(excludedSymbols = []) {
	await ensureFeed();
	const ranked = rankedSignalPairs();
	if (ranked.length === 0) throw new Error("Нет активных OTC-валютных пар с выплатой не ниже 92%.");
	const pair = selectRotatingSignalPair(ranked, excludedSymbols.slice(0, 24));
	if (!pair) throw new Error("Не удалось выбрать валютную пару.");
	return {
		symbol: pair.symbol,
		name: pair.name,
		payout: pair.payout,
		group: "fx"
	};
}
async function loadHistoryPage(symbol, seconds, time, timeoutMs = 12e3) {
	return runHistoryRequest(symbol, async () => {
		await ensureFeed();
		if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
		if (!socket || socket.readyState !== wrapper_default.OPEN) throw new Error("Котировки сейчас недоступны.");
		const clockDeadline = Date.now() + Math.min(timeoutMs, 2e3);
		while (pocketServerClockOffsetSeconds === null && Date.now() < clockDeadline) {
			subscribe(symbol, seconds);
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		const clockOffsetSeconds = pocketServerClockOffsetSeconds;
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
			const timer = setTimeout(() => {
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
				reject(/* @__PURE__ */ new Error(`История свечей не пришла за ${Math.ceil(timeoutMs / 1e3)} секунд. Попробуйте ещё раз.`));
			}, timeoutMs);
			request = {
				asset: symbol,
				periodSeconds: seconds,
				resolve,
				reject,
				timer
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
				sendPocketSubscription(current, symbol, seconds);
				current.send("42" + JSON.stringify(["loadHistoryPeriod", {
					asset: symbol,
					index: 7e3 + Math.floor(Math.random() * 2e3),
					time: requestTime,
					offset: seconds * HISTORY_PAGE_CANDLES,
					period: seconds
				}]));
			} catch {
				clearTimeout(timer);
				if (pendingHistory.get(symbol) === request) pendingHistory.delete(symbol);
				reject(/* @__PURE__ */ new Error("Не удалось запросить историю свечей Pocket Option."));
			}
		});
	});
}
async function loadCandles(symbol, seconds, pageTimeoutMs = 12e3, pageLimit) {
	await ensureFeed();
	const collected = /* @__PURE__ */ new Map();
	let rejectedRows = 0;
	let cursor = Math.floor(Date.now() / 1e3);
	const maxPages = pageLimit ?? Math.ceil(30 / HISTORY_PAGE_CANDLES) + 1;
	for (let page = 0; page < maxPages && collected.size < 30; page += 1) {
		const history = await loadHistoryPage(symbol, seconds, cursor, pageTimeoutMs);
		rejectedRows += history.rejectedRows;
		const candles = history.candles;
		if (candles.length === 0) break;
		const previousSize = collected.size;
		for (const candle of candles) collected.set(candle.time, candle);
		const oldestTime = candles[0].time;
		if (collected.size === previousSize || oldestTime <= 0 || oldestTime >= cursor) break;
		cursor = oldestTime - 1;
	}
	const candles = [...collected.values()].sort((a, b) => a.time - b.time).slice(-30);
	const state = pairMarketData.get(symbol) ?? {
		ticks: [],
		history: [],
		historyPeriodSeconds: null
	};
	state.history = candles;
	state.historyPeriodSeconds = seconds;
	pairMarketData.set(symbol, state);
	return {
		candles: state.history,
		rejectedRows
	};
}
function followQuote(symbol) {
	if ((!socket || socket.readyState === 3) && Date.now() >= retryAfter) feedSnapshot().catch(() => {});
	const current = latestPairQuote(symbol);
	if (!current || Date.now() - current.at > 2e3) subscribe(symbol);
	return latestPairQuote(symbol);
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
	const quote = latestPairQuote(symbol);
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
	const quote = latestPairQuote(symbol);
	if (quote && Date.now() - quote.at < 800) return quote.price;
	return waitQuote(symbol);
}
function summarizeCandleCadence(series, expectedSeconds) {
	const intervalCounts = /* @__PURE__ */ new Map();
	let intervalCount = 0;
	let irregularIntervals = 0;
	let estimatedMissingIntervals = 0;
	for (const candles of series) for (let index = 1; index < candles.length; index += 1) {
		const previous = candles[index - 1];
		const current = candles[index];
		if (!previous || !current) continue;
		const interval = current.time - previous.time;
		if (!Number.isFinite(interval) || interval <= 0) {
			irregularIntervals += 1;
			continue;
		}
		intervalCount += 1;
		intervalCounts.set(interval, (intervalCounts.get(interval) ?? 0) + 1);
		const expectedSteps = Math.round(interval / expectedSeconds);
		const tolerance = Math.max(1, expectedSeconds * .01);
		if (expectedSteps < 1 || Math.abs(interval - expectedSteps * expectedSeconds) > tolerance) irregularIntervals += 1;
		if (interval > expectedSeconds * 1.5) estimatedMissingIntervals += Math.max(1, Math.round(interval / expectedSeconds) - 1);
	}
	return {
		observedIntervalSeconds: [...intervalCounts.entries()].sort(([intervalA, countA], [intervalB, countB]) => countB - countA || intervalA - intervalB)[0]?.[0] ?? null,
		intervalCount,
		irregularIntervals,
		estimatedMissingIntervals
	};
}
async function feedSignal(symbol, expirySeconds) {
	if (expirySeconds !== 120) throw new Error("Для сигналов PRIME BOT используется экспирация 120 секунд.");
	const pipelineStartedAt = performance.now();
	const preparationDeadlineAtMs = Date.now() + SIGNAL_PREPARATION_TIMEOUT_MS;
	await waitForSignalPreparation(ensureFeed(), preparationDeadlineAtMs);
	const pair = pairs.get(symbol);
	if (!pair || pair.group !== "fx" || !pair.symbol.toLowerCase().includes("otc") || pair.payout < MIN_SIGNAL_PAYOUT) throw new Error("Для сигнала нужна активная OTC-валютная пара с выплатой не ниже 92%.");
	subscribe(symbol);
	const analysisSeconds = 60;
	const historyStartedAt = performance.now();
	const inputQuoteStartedAt = historyStartedAt;
	const [history, inputQuote] = await waitForSignalPreparation(Promise.all([loadCandles(symbol, analysisSeconds, SIGNAL_HISTORY_PAGE_TIMEOUT_MS, 1), waitFreshQuote(symbol, SIGNAL_QUOTE_WAIT_MS)]), preparationDeadlineAtMs);
	const historyMs = Math.round(performance.now() - historyStartedAt);
	const inputQuoteMs = Math.round(performance.now() - inputQuoteStartedAt);
	const candles = history.candles;
	console.info("[signal-history]", JSON.stringify({
		symbol,
		candleCount: candles.length,
		rejectedRows: history.rejectedRows,
		expectedCandleSeconds: analysisSeconds,
		firstCandle: candles[0] ?? null,
		lastReceivedCandle: candles.at(-1) ?? null,
		...summarizeCandleCadence([candles], analysisSeconds)
	}));
	const entryHistoryRequest = settleSignalRequest(loadCandles(symbol, 60, SIGNAL_HISTORY_PAGE_TIMEOUT_MS, 1));
	const remainingAnalysisMs = Math.min(SIGNAL_ANALYSIS_TIMEOUT_MS, preparationDeadlineAtMs - Date.now() - 100);
	if (remainingAnalysisMs <= 0) throw new Error(SIGNAL_PREPARATION_TIMEOUT_MESSAGE);
	const analysisStartedAt = performance.now();
	const review = await waitForSignalPreparation(analyzeMarketCandidates(expirySeconds, analysisSeconds, [{
		symbol,
		name: pair.name,
		candles,
		currentPrice: inputQuote.price,
		quoteAgeMs: inputQuote.ageMs
	}], { timeoutMs: remainingAnalysisMs }), preparationDeadlineAtMs);
	const analysisMs = Math.round(performance.now() - analysisStartedAt);
	console.info("[signal-pipeline]", JSON.stringify({
		symbol,
		historyMs,
		inputQuoteMs,
		analysisMs,
		elapsedMs: Math.round(performance.now() - pipelineStartedAt),
		decision: review.decision
	}));
	if (review.decision === "pass") return review;
	if (!acceptsMarketAiReview(review, [symbol])) return {
		decision: "pass",
		reason: "Ответ ИИ не прошёл проверку пары и направления; сигнал не выдан."
	};
	const entryHistory = await waitForSignalRequest(entryHistoryRequest, Math.max(0, preparationDeadlineAtMs - Date.now()), SIGNAL_PREPARATION_TIMEOUT_MESSAGE);
	const releaseAtMs = signalReleaseAt(entryHistory.candles, Date.now());
	if (releaseAtMs === null) return {
		decision: "pass",
		reason: "Не удалось подготовить безопасное окно входа. Сигнал не выдан."
	};
	const signal = buildDirectAiSignal(candles, expirySeconds, analysisSeconds, pair.name, pair.payout, review);
	signal.openPrice = inputQuote.price;
	console.info("[signal-pipeline]", JSON.stringify({
		symbol,
		historyMs,
		inputQuoteMs,
		analysisMs,
		elapsedMs: Math.round(performance.now() - pipelineStartedAt),
		releaseDelayMs: Math.max(0, releaseAtMs - Date.now()),
		decision: "signal"
	}));
	return {
		decision: "signal",
		...signal,
		releaseAtMs
	};
}
async function feedConfirmSignalEntry(symbol) {
	await ensureFeed();
	const pair = pairs.get(symbol);
	if (!pair || pair.group !== "fx" || !pair.symbol.toLowerCase().includes("otc") || pair.payout < MIN_SIGNAL_PAYOUT) throw new Error("Для сигнала нужна активная OTC-валютная пара с выплатой не ниже 92%.");
	const history = await loadCandles(symbol, 60, CANDIDATE_HISTORY_PAGE_TIMEOUT_MS, 1);
	const initialWindowFailure = entryWindowFailure(history.candles);
	if (initialWindowFailure) throw new Error(initialWindowFailure.reason);
	const quote = await waitFreshQuote(symbol, SIGNAL_QUOTE_WAIT_MS);
	const finalWindowFailure = entryWindowFailure(history.candles);
	if (finalWindowFailure) throw new Error(finalWindowFailure.reason);
	return { openPrice: quote.price };
}
async function feedBest(expirySeconds, excludedSymbols = []) {
	const startedAt = performance.now();
	let stage = "validation";
	let feedMs = 0;
	let historyMs = 0;
	let analysisMs = 0;
	let quoteMs = 0;
	let poolSize = 0;
	let historyResponses = 0;
	let candidateCount = 0;
	let rejectedHistoryRows = 0;
	let expectedCandleSeconds = 0;
	let observedIntervalSeconds = null;
	let intervalCount = 0;
	let irregularIntervals = 0;
	let estimatedMissingIntervals = 0;
	const logTiming = (decision, error) => {
		console.info("[signal-search]", JSON.stringify({
			decision,
			stage,
			totalMs: Math.round(performance.now() - startedAt),
			feedMs: Math.round(feedMs),
			historyMs: Math.round(historyMs),
			analysisMs: Math.round(analysisMs),
			quoteMs: Math.round(quoteMs),
			poolSize,
			historyResponses,
			candidateCount,
			rejectedHistoryRows,
			expectedCandleSeconds,
			observedIntervalSeconds,
			intervalCount,
			irregularIntervals,
			estimatedMissingIntervals,
			...error ? { errorType: error instanceof Error ? error.name : typeof error } : {}
		}));
	};
	try {
		if (expirySeconds !== 120) throw new Error("Для сигналов PRIME BOT используется экспирация 120 секунд.");
		stage = "feed";
		const feedStartedAt = performance.now();
		await ensureFeed();
		feedMs = performance.now() - feedStartedAt;
		const analysisSeconds = 60;
		expectedCandleSeconds = analysisSeconds;
		const ranked = rankedSignalPairs();
		if (ranked.length === 0) throw new Error("Нет активных OTC-валютных пар с выплатой не ниже 92%.");
		const nextPair = selectRotatingSignalPair(ranked, excludedSymbols.slice(0, 24));
		const pool = nextPair ? [nextPair] : [];
		poolSize = pool.length;
		if (pool.length === 0) throw new Error("Нет активных OTC-валютных пар с выплатой не ниже 92%.");
		const candidates = [];
		let historyFailure = "";
		stage = "history";
		const historyStartedAt = performance.now();
		let historyResults;
		try {
			historyResults = await loadCandidatesInParallel(pool, (pair) => loadCandles(pair.symbol, analysisSeconds, CANDIDATE_HISTORY_PAGE_TIMEOUT_MS));
		} finally {
			historyMs = performance.now() - historyStartedAt;
		}
		for (const result of historyResults) {
			if (!result.ok) {
				if (!historyFailure && result.error instanceof Error) historyFailure = result.error.message;
				continue;
			}
			historyResponses += 1;
			rejectedHistoryRows += result.value.rejectedRows;
			if (result.value.candles.length < 15) continue;
			candidates.push({
				pair: result.item,
				candles: result.value.candles
			});
		}
		candidateCount = candidates.length;
		const cadence = summarizeCandleCadence(candidates.map((candidate) => candidate.candles), analysisSeconds);
		observedIntervalSeconds = cadence.observedIntervalSeconds;
		intervalCount = cadence.intervalCount;
		irregularIntervals = cadence.irregularIntervals;
		estimatedMissingIntervals = cadence.estimatedMissingIntervals;
		if (candidates.length === 0) {
			if (historyResponses === 0 && historyFailure) throw new Error(`Не удалось получить историю свечей Pocket Option: ${historyFailure}`);
			throw new Error(`Не удалось получить по Pocket Option минимум 15 исторических свечей ни для одной пары.`);
		}
		const candidate = candidates[0];
		if (!candidate) throw new Error("Не удалось подготовить данные выбранной пары.");
		const initialWindowFailure = entryWindowFailure((await loadCandles(candidate.pair.symbol, 60, CANDIDATE_HISTORY_PAGE_TIMEOUT_MS, 1)).candles);
		if (initialWindowFailure) {
			stage = "entry-window";
			logTiming("pass");
			return initialWindowFailure;
		}
		stage = "fresh-quote";
		const inputQuoteStartedAt = performance.now();
		const inputQuote = await waitFreshQuote(candidate.pair.symbol);
		quoteMs += performance.now() - inputQuoteStartedAt;
		stage = "analysis";
		const analysisStartedAt = performance.now();
		let review;
		try {
			review = await analyzeMarketCandidates(expirySeconds, analysisSeconds, candidates.map((candidate) => ({
				symbol: candidate.pair.symbol,
				name: candidate.pair.name,
				candles: candidate.candles,
				currentPrice: inputQuote.price,
				quoteAgeMs: inputQuote.ageMs
			})));
		} finally {
			analysisMs = performance.now() - analysisStartedAt;
		}
		if (review.decision === "pass") {
			stage = "complete";
			logTiming("pass");
			return review;
		}
		const best = candidates.find((candidate) => candidate.pair.symbol === review.symbol);
		if (!best || !acceptsMarketAiReview(review, candidates.map((candidate) => candidate.pair.symbol))) {
			stage = "complete";
			logTiming("pass");
			return {
				decision: "pass",
				reason: "Ответ ИИ указал пару вне доступного списка; сигнал не выдан."
			};
		}
		const finalEntryHistory = await loadCandles(best.pair.symbol, 60, CANDIDATE_HISTORY_PAGE_TIMEOUT_MS, 1);
		const analysisWindowFailure = entryWindowFailure(finalEntryHistory.candles);
		if (analysisWindowFailure) {
			stage = "entry-window";
			logTiming("pass");
			return analysisWindowFailure;
		}
		stage = "fresh-quote";
		const quoteStartedAt = performance.now();
		const entryQuote = await waitFreshQuote(best.pair.symbol);
		quoteMs += performance.now() - quoteStartedAt;
		const finalWindowFailure = entryWindowFailure(finalEntryHistory.candles);
		if (finalWindowFailure) {
			stage = "entry-window";
			logTiming("pass");
			return finalWindowFailure;
		}
		const signal = buildDirectAiSignal(best.candles, expirySeconds, analysisSeconds, best.pair.name, best.pair.payout, review);
		signal.openPrice = entryQuote.price;
		stage = "complete";
		logTiming("signal");
		return {
			decision: "signal",
			...signal,
			symbol: best.pair.symbol,
			group: best.pair.group,
			seconds: expirySeconds,
			analysisSeconds
		};
	} catch (error) {
		logTiming("error", error);
		throw error;
	}
}
//#endregion
export { feedBest, feedClose, feedConfirmSignalEntry, feedNextPair, feedSignal, feedSnapshot, followQuote, quoteStatus };
