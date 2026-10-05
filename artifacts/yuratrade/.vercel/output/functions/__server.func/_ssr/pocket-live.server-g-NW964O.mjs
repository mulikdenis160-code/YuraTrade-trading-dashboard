import { a as lookbackForExpiry, i as isValidExpirySeconds, n as analysisPeriodForExpiry, r as formatExpiry } from "./expiry-B3tUilyb.mjs";
import { t as wrapper_default } from "../_libs/ws.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pocket-live.server-g-NW964O.js
function assessSignalQuality(score, slopeScore, bodyScore) {
	const qualityScore = Number.isFinite(score) ? Math.abs(score) : 0;
	const trendDirection = Math.sign(slopeScore);
	const agrees = trendDirection !== 0 && trendDirection === Math.sign(bodyScore);
	return {
		qualityScore,
		agrees,
		eligible: agrees && qualityScore >= .22
	};
}
var FEED_URL = "wss://api-msk.po.market/socket.io/?EIO=4&transport=websocket";
var FEED_AUTH = process.env.POCKET_OPTION_FEED_AUTH ?? "";
var AUTH_MISSING_MESSAGE = "Не настроена свежая авторизация Pocket Option. Добавьте её в Replit Secrets как POCKET_OPTION_FEED_AUTH.";
var AUTH_REJECTED_MESSAGE = "Pocket Option отклонил авторизацию. Проверьте актуальность секрета POCKET_OPTION_FEED_AUTH.";
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
function rsiOf(closes) {
	if (closes.length < 15) return null;
	const window = closes.slice(-15);
	let gain = 0;
	let loss = 0;
	for (let index = 1; index < window.length; index += 1) {
		const diff = window[index] - window[index - 1];
		if (diff >= 0) gain += diff;
		else loss -= diff;
	}
	if (loss === 0) return 100;
	return 100 - 100 / (1 + gain / loss);
}
function describe(input) {
	const side = input.direction === "call" ? "вверх" : "вниз";
	const rsiLine = input.rsi === null ? "RSI 14: мало свечей для расчёта" : `RSI 14: ${input.rsi.toFixed(1)} — ${input.rsi >= 70 ? "перекуплен, импульс выдыхается" : input.rsi <= 30 ? "перепродан, импульс вниз выдыхается" : input.rsi >= 50 ? "импульс вверх, перекупленности нет" : "импульс вниз, перепроданности нет"}`;
	const slopeWord = input.slope > .05 ? "восходящий" : input.slope < -.05 ? "нисходящий" : "плоский";
	const bandWord = input.band >= .66 ? "верхней" : input.band <= .33 ? "нижней" : "средней";
	return [
		rsiLine,
		`SMA 12: цена ${input.smaDelta >= 0 ? "выше" : "ниже"} средней на ${Math.abs(input.smaDelta).toFixed(3)}%`,
		`Диапазон: цена в ${bandWord} трети окна`,
		`Свечи: ${input.greens} бычьих и ${5 - input.greens} медвежьих из последних пяти`,
		`Наклон: ${slopeWord}${input.agree ? ", совпадает со свечами" : ", свечи спорят с наклоном"}`,
		`Экспирация ${formatExpiry(input.expirySeconds)}. Анализ: свечи ${formatExpiry(input.analysisSeconds)}, окно ${input.lookbackBars} свечей.`,
		`Вход ${side}: этот сценарий сильнее обратного.`
	].join("\n");
}
function judge(candles, expirySeconds, analysisSeconds, name, payout) {
	const lookbackBars = lookbackForExpiry(expirySeconds, analysisSeconds);
	const last = candles.slice(-lookbackBars);
	const closes = last.map((candle) => candle.close);
	const count = closes.length;
	let sumX = 0;
	let sumY = 0;
	let sumXY = 0;
	let sumXX = 0;
	for (let index = 0; index < count; index += 1) {
		sumX += index;
		sumY += closes[index];
		sumXY += index * closes[index];
		sumXX += index * index;
	}
	const slope = (count * sumXY - sumX * sumY) / (count * sumXX - sumX * sumX || 1);
	const high = Math.max(...last.map((candle) => candle.high));
	const low = Math.min(...last.map((candle) => candle.low));
	const range = high - low || Math.abs(closes[count - 1]) * 1e-4;
	const slopeScore = Math.max(-1, Math.min(1, slope * count / range));
	const bodies = last.slice(-5);
	const greens = bodies.filter((candle) => candle.close >= candle.open).length;
	const bodyScore = bodies.reduce((sum, candle) => sum + Math.sign(candle.close - candle.open), 0) / bodies.length;
	const earlier = closes.slice(0, -1);
	const average = earlier.reduce((sum, price) => sum + price, 0) / Math.max(1, earlier.length);
	const levelScore = Math.max(-1, Math.min(1, (closes[count - 1] - average) / range * 2));
	const score = slopeScore * .5 + bodyScore * .3 + levelScore * .2;
	const quality = assessSignalQuality(score, slopeScore, bodyScore);
	const direction = score >= 0 ? "call" : "put";
	const agree = quality.agrees;
	const full = candles.map((candle) => candle.close);
	const price = full[full.length - 1];
	const smaWindow = full.slice(-12);
	const sma = smaWindow.reduce((sum, value) => sum + value, 0) / smaWindow.length;
	const rsi = rsiOf(full);
	const pack = candles.slice(-28);
	const sample = pack[pack.length - 1]?.close ?? price;
	const digits = sample >= 100 ? 2 : sample >= 10 ? 3 : 5;
	const cut = (value) => Number(value.toFixed(digits));
	return {
		name,
		payout,
		direction,
		openPrice: price,
		analysisSeconds,
		ruleScore: quality.qualityScore,
		note: describe({
			direction,
			agree,
			expirySeconds,
			analysisSeconds,
			lookbackBars,
			greens,
			rsi,
			smaDelta: (price - sma) / (sma || 1) * 100,
			band: (price - low) / range,
			slope: slopeScore
		}),
		bars: pack.map((candle) => [
			cut(candle.open),
			cut(candle.high),
			cut(candle.low),
			cut(candle.close)
		]),
		strength: quality.qualityScore,
		approved: quality.eligible
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
async function loadCandles(symbol, seconds) {
	await ensureFeed();
	if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
	if (!socket || socket.readyState !== wrapper_default.OPEN) throw new Error("Котировки сейчас недоступны.");
	if (pending) failPending(/* @__PURE__ */ new Error("Запрос сменён."));
	const current = socket;
	return new Promise((resolve, reject) => {
		pending = {
			asset: symbol,
			resolve,
			reject,
			timer: setTimeout(() => {
				if (pending?.asset === symbol) pending = null;
				reject(/* @__PURE__ */ new Error("Цена не пришла. Попробуйте ещё раз."));
			}, 12e3)
		};
		const now = Math.floor(Date.now() / 1e3);
		current.send("42" + JSON.stringify(["changeSymbol", {
			asset: symbol,
			period: seconds
		}]));
		current.send("42" + JSON.stringify(["loadHistoryPeriod", {
			asset: symbol,
			index: 7e3 + Math.floor(Math.random() * 2e3),
			time: now,
			offset: Math.max(seconds * 40, 2400),
			period: seconds
		}]));
	});
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
	const lookbackBars = lookbackForExpiry(expirySeconds, analysisSeconds);
	const candles = await loadCandles(symbol, analysisSeconds);
	const pair = pairs.get(symbol);
	if (!pair) throw new Error("Эта пара сейчас недоступна.");
	if (candles.length < lookbackBars) throw new Error("Не удалось получить достаточно свечей для выбранной экспирации.");
	const judged = judge(candles, expirySeconds, analysisSeconds, pair.name, pair.payout);
	if (!judged.approved) return null;
	judged.openPrice = await waitQuote(symbol);
	const { strength: _strength, approved: _approved, ...signal } = judged;
	return signal;
}
async function feedBest(expirySeconds) {
	if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
	await ensureFeed();
	const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
	const lookbackBars = lookbackForExpiry(expirySeconds, analysisSeconds);
	const ranked = [...pairs.values()].filter((pair) => pair.payout === 92 || pair.payout === 80).sort((a, b) => b.payout - a.payout);
	const live = ranked.filter((pair) => quotes.has(pair.symbol));
	const pool = (live.length >= 4 ? live : ranked).slice(0, 4);
	if (pool.length === 0) throw new Error("Нет активных пар с выплатой 92% или 80%.");
	let best = null;
	let usableHistories = 0;
	for (const pair of pool) try {
		const candles = await loadCandles(pair.symbol, analysisSeconds);
		if (candles.length < lookbackBars) continue;
		usableHistories += 1;
		const judged = judge(candles, expirySeconds, analysisSeconds, pair.name, pair.payout);
		if (!judged.approved) continue;
		if (!best || judged.strength > best.strength) {
			const { strength, approved: _approved, ...signal } = judged;
			best = {
				signal,
				symbol: pair.symbol,
				group: pair.group,
				strength
			};
		}
	} catch {}
	if (!best && usableHistories === 0) throw new Error("Не удалось загрузить достаточно свечей для этой экспирации. Попробуйте ещё раз.");
	if (!best) return null;
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
