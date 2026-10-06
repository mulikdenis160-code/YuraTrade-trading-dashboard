//#region node_modules/.nitro/vite/services/ssr/assets/signal-request-D1JknhjO.js
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
//#endregion
export { waitForSignalRequest as n, settleSignalRequest as t };
