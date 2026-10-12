import { i as MIN_ENTRY_BUFFER_MS, l as SIGNAL_QUOTE_WAIT_MS, o as SIGNAL_COPY_DELAY_MS, r as MAX_SIGNAL_COUNTDOWN_MS } from "./pocket-gate.middleware-BndXO9TO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signal-release-time-DmZPP6vk.js
function nextCandleEntryWindow(candles, nowMs) {
	const candleMs = 6e4;
	if (!candles.reduce((latest, candle) => {
		if (!Number.isFinite(candle.time) || candle.time * 1e3 + candleMs > nowMs) return latest;
		return !latest || candle.time > latest.time ? candle : latest;
	}, null)) return null;
	const opensAtMs = Math.floor(nowMs / candleMs) * candleMs;
	const closesAtMs = opensAtMs + candleMs;
	const remainingMs = closesAtMs - nowMs;
	return {
		opensAtMs,
		closesAtMs,
		remainingMs,
		canEnter: nowMs >= opensAtMs && remainingMs >= 15e3
	};
}
function settleSignalRequest(request) {
	return request.then((value) => ({
		ok: true,
		value
	}), (error) => ({
		ok: false,
		error
	}));
}
function waitForSignalRequest(request, timeoutMs, timeoutMessage) {
	let timer;
	const completed = request.then((outcome) => {
		if (outcome.ok) return outcome.value;
		throw outcome.error;
	});
	const timedOut = new Promise((_, reject) => {
		timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
	});
	return Promise.race([completed, timedOut]).finally(() => {
		if (timer) clearTimeout(timer);
	});
}
function signalReleaseAt(candles, nowMs) {
	const window = nextCandleEntryWindow(candles, nowMs);
	if (!window) return null;
	const minimumRemaining = SIGNAL_COPY_DELAY_MS + MIN_ENTRY_BUFFER_MS + SIGNAL_QUOTE_WAIT_MS + 1e3;
	let countdownStartsAt;
	if (nowMs < window.opensAtMs) countdownStartsAt = window.opensAtMs;
	else if (window.closesAtMs - nowMs >= minimumRemaining) countdownStartsAt = nowMs;
	else if (nowMs < window.closesAtMs) countdownStartsAt = window.closesAtMs;
	else countdownStartsAt = window.closesAtMs + 6e4;
	return countdownStartsAt + SIGNAL_COPY_DELAY_MS;
}
function visibleSignalReleaseAt(releaseAtMs, nowMs) {
	const minimumReleaseAt = nowMs + SIGNAL_COPY_DELAY_MS;
	const maximumReleaseAt = nowMs + MAX_SIGNAL_COUNTDOWN_MS;
	return Math.min(Math.max(releaseAtMs, minimumReleaseAt), maximumReleaseAt);
}
//#endregion
export { waitForSignalRequest as a, visibleSignalReleaseAt as i, settleSignalRequest as n, signalReleaseAt as r, nextCandleEntryWindow as t };
