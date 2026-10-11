import { a as SIGNAL_COPY_DELAY_MS, c as SIGNAL_QUOTE_WAIT_MS, r as MIN_ENTRY_BUFFER_MS } from "./pocket-gate.middleware-pth9pe_b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signal-release-time-BaB1SHa2.js
function nextCandleEntryWindow(candles, nowMs) {
	const candleMs = 6e4;
	const lastClosed = candles.reduce((latest, candle) => {
		if (!Number.isFinite(candle.time) || candle.time * 1e3 + candleMs > nowMs) return latest;
		return !latest || candle.time > latest.time ? candle : latest;
	}, null);
	if (!lastClosed) return null;
	const opensAtMs = (lastClosed.time + 60) * 1e3;
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
	return Math.max(releaseAtMs, nowMs + SIGNAL_COPY_DELAY_MS);
}
//#endregion
export { waitForSignalRequest as a, visibleSignalReleaseAt as i, settleSignalRequest as n, signalReleaseAt as r, nextCandleEntryWindow as t };
