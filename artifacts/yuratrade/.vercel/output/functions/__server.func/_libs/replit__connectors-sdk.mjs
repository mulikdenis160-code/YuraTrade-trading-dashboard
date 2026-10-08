import { i as __require, t as __commonJSMin } from "../_runtime.mjs";
//#region ../../node_modules/.pnpm/@replit+connectors-sdk@0.4.3/node_modules/@replit/connectors-sdk/identity.js
var require_identity = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.resolveAudience = resolveAudience;
	exports.createIdentityToken = createIdentityToken;
	exports.resolveIdentityToken = resolveIdentityToken;
	exports.resolveBaseUrl = resolveBaseUrl;
	exports.buildHeaders = buildHeaders;
	var node_child_process_1 = __require("node:child_process");
	var promises_1 = __require("node:timers/promises");
	var execFileAsync = (0, __require("node:util").promisify)(node_child_process_1.execFile);
	var DEFAULT_CONNECTORS_HOST = "connectors.replit.com";
	var DEPLOYMENT_IDENTITY_ENDPOINT = "http://127.0.0.1:1105/getIdentityToken";
	var IDENTITY_MINT_TIMEOUT_MS = 5e3;
	var IDENTITY_MINT_RETRY_DELAY_MS = 250;
	var TransientLocalIdentityError = class extends Error {};
	function isDeploymentEnvironment() {
		if (process.env["REPLIT_CONRUN"]) return false;
		return [
			"REPLIT_DEPLOYMENT_ID",
			"REPLIT_DEPLOYMENT_ENVIRONMENT",
			"WEB_REPL_RENEWAL"
		].some((name) => Boolean(process.env[name]));
	}
	function resolveAudience() {
		const audience = process.env["REPLIT_CONNECTORS_AUDIENCE"];
		if (audience) {
			if (audience.startsWith("http://") || audience.startsWith("https://")) return audience;
			return `https://${audience}`;
		}
		return `https://${DEFAULT_CONNECTORS_HOST}`;
	}
	async function createIdentityToken() {
		const replitBinary = process.env["REPLIT_CLI"] || "replit";
		const audience = resolveAudience();
		const { stdout } = await execFileAsync(replitBinary, [
			"identity",
			"create",
			"--audience",
			audience
		], {
			encoding: "utf8",
			timeout: IDENTITY_MINT_TIMEOUT_MS,
			windowsHide: true
		});
		const token = stdout.trim();
		if (!token) throw new Error(`replit identity create returned an empty token (audience: ${audience})`);
		return token;
	}
	async function createIdentityTokenFromLocalEndpoint(timeoutMs) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), timeoutMs);
		try {
			let response;
			try {
				response = await fetch(DEPLOYMENT_IDENTITY_ENDPOINT, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ audience: resolveAudience() }),
					signal: controller.signal
				});
			} catch (cause) {
				if (cause instanceof TypeError) throw new TransientLocalIdentityError("local identity endpoint is not accepting connections");
				throw cause;
			}
			if (!response.ok) {
				const message = `local identity endpoint returned HTTP ${response.status}`;
				if (response.status >= 500) throw new TransientLocalIdentityError(message);
				throw new Error(message);
			}
			const payload = await response.json();
			if (typeof payload.identityToken !== "string") throw new Error("local identity endpoint returned an invalid response");
			const token = payload.identityToken.trim();
			if (!token) throw new Error("local identity endpoint returned an empty token");
			return token;
		} finally {
			clearTimeout(timeout);
		}
	}
	async function createDeploymentIdentityToken() {
		const deadline = Date.now() + IDENTITY_MINT_TIMEOUT_MS;
		try {
			return await createIdentityToken();
		} catch {}
		do {
			const remainingMs = Math.max(1, deadline - Date.now());
			try {
				return await createIdentityTokenFromLocalEndpoint(remainingMs);
			} catch (cause) {
				if (!(cause instanceof TransientLocalIdentityError)) break;
			}
			const retryBudgetMs = deadline - Date.now();
			if (retryBudgetMs <= 0) break;
			await (0, promises_1.setTimeout)(Math.min(IDENTITY_MINT_RETRY_DELAY_MS, retryBudgetMs));
		} while (Date.now() < deadline);
		throw new Error("Could not mint an audience-scoped deployment identity. Neither `replit identity create` nor the local hostingpid1 identity endpoint is available. Raw WEB_REPL_RENEWAL credentials are not accepted.");
	}
	async function resolveIdentityToken() {
		if (isDeploymentEnvironment()) return `depl ${await createDeploymentIdentityToken()}`;
		try {
			return await createIdentityToken();
		} catch {}
		const replIdentity = process.env["REPL_IDENTITY"];
		if (replIdentity) return `repl ${replIdentity}`;
		throw new Error("Replit identity token not found. Could not run `replit identity create` and REPL_IDENTITY is not set in the environment. Are you running this inside a Repl?");
	}
	function resolveBaseUrl() {
		const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
		if (hostname) {
			if (hostname.startsWith("http://") || hostname.startsWith("https://")) return hostname;
			return `https://${hostname}`;
		}
		return `https://${DEFAULT_CONNECTORS_HOST}`;
	}
	async function buildHeaders() {
		const token = await resolveIdentityToken();
		const headers = { Accept: "application/json" };
		if (token.startsWith("repl ") || token.startsWith("depl ")) headers["X-Replit-Token"] = token;
		else headers["Replit-Authentication"] = `Bearer ${token}`;
		return headers;
	}
}));
//#endregion
//#region ../../node_modules/.pnpm/@replit+connectors-sdk@0.4.3/node_modules/@replit/connectors-sdk/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ReplitConnectors = void 0;
	var identity_1 = require_identity();
	function resolveProxyTarget(url, proxyBase) {
		if (url.startsWith(proxyBase)) return url;
		if (url.startsWith("http://") || url.startsWith("https://")) {
			const parsed = new URL(url);
			return `${proxyBase}${parsed.pathname}${parsed.search}`;
		}
		return `${proxyBase}${url.startsWith("/") ? "" : "/"}${url}`;
	}
	function flattenHeaders(headers) {
		if (!headers) return {};
		const result = {};
		if (headers instanceof Headers) headers.forEach((value, key) => {
			result[key] = value;
		});
		else if (Array.isArray(headers)) for (const pair of headers) result[pair[0]] = pair[1];
		else Object.assign(result, headers);
		return result;
	}
	/**
	* Per-connector strategies for shaping the `host` + `token` pair returned by
	* `getCliConfig()`. Different partner CLIs require different layouts:
	*
	*   - `dbx-compound-token`: the Databricks Go SDK (and CLIs built on it)
	*     strip the path from `*_HOST`, so routing data has to ride along
	*     inside the token. Used by `databricks` (U2M) and `databricks-m2m`.
	*
	*   - `path-route`: the CLI preserves the full URL path of `*_API_URL`,
	*     so the connector name + connection id can be encoded directly in
	*     the URL. Used by `microsoft-fabric` for the Rayfin CLI.
	*
	* Adding a new connector? Pick whichever strategy matches the partner
	* CLI's behavior — never invent a third format unless the CLI literally
	* cannot consume either of the two above.
	*/
	var dbxCompoundTokenStrategy = ({ baseUrl, connectorName, connectionId, rawIdentityToken }) => ({
		host: baseUrl,
		token: `${rawIdentityToken} dbx:${connectionId}`,
		connectorName
	});
	var pathRouteStrategy = ({ baseUrl, connectorName, connectionId, rawIdentityToken }) => ({
		host: `${baseUrl}/api/v2/cli-proxy/${connectorName}/${connectionId}`,
		token: rawIdentityToken,
		connectorName
	});
	var CLI_CONFIG_STRATEGIES = {
		databricks: dbxCompoundTokenStrategy,
		"databricks-m2m": dbxCompoundTokenStrategy,
		"microsoft-fabric": pathRouteStrategy,
		datadog: pathRouteStrategy
	};
	var ReplitConnectors = class {
		constructor(options) {
			this.baseUrl = options?.baseUrl ?? (0, identity_1.resolveBaseUrl)();
		}
		async proxy(connectorName, path, options) {
			const method = options?.method ?? "GET";
			const normalizedPath = path.startsWith("/") ? path : `/${path}`;
			const url = `${this.getProxyUrl()}${normalizedPath}`;
			const headers = {
				...await (0, identity_1.buildHeaders)(),
				"Connector-Name": connectorName,
				...options?.headers ?? {}
			};
			const init = {
				method,
				headers
			};
			if (options?.body !== void 0 && options.body !== null) {
				if (typeof options.body === "string" || typeof Buffer !== "undefined" && options.body instanceof Buffer || options.body instanceof ArrayBuffer || options.body instanceof FormData || options.body instanceof URLSearchParams || options.body instanceof Blob || options.body instanceof ReadableStream) init.body = options.body;
				else {
					init.body = JSON.stringify(options.body);
					if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
				}
			}
			const response = await fetch(url, init);
			if (response.status === 401) {
				const freshAuth = await (0, identity_1.buildHeaders)();
				return await fetch(url, {
					...init,
					headers: {
						...headers,
						...freshAuth
					}
				});
			}
			return response;
		}
		async listConnections(options) {
			const params = new URLSearchParams();
			if (options?.connector_names) params.set("connector_names", options.connector_names);
			for (const val of options?.expand ?? ["connector"]) params.append("expand", val);
			params.set("refresh_policy", options?.refresh_policy ?? "none");
			const qs = params.toString();
			const url = `${this.baseUrl}/api/v2/connection${qs ? `?${qs}` : ""}`;
			const headers = await (0, identity_1.buildHeaders)();
			const response = await fetch(url, {
				method: "GET",
				headers
			});
			if (response.status === 401) {
				const freshHeaders = await (0, identity_1.buildHeaders)();
				const retryResponse = await fetch(url, {
					method: "GET",
					headers: freshHeaders
				});
				if (!retryResponse.ok) throw new Error(`Failed to list connections: ${retryResponse.status} ${retryResponse.statusText}`);
				return (await retryResponse.json()).items ?? [];
			}
			if (!response.ok) throw new Error(`Failed to list connections: ${response.status} ${response.statusText}`);
			return (await response.json()).items ?? [];
		}
		getProxyUrl() {
			return `${this.baseUrl}/api/v2/proxy`;
		}
		async getProxyHeaders(connectorName) {
			return {
				...await (0, identity_1.buildHeaders)(),
				"Connector-Name": connectorName
			};
		}
		async getCliConfig(connectorName) {
			const strategy = CLI_CONFIG_STRATEGIES[connectorName];
			if (!strategy) {
				const supported = Object.keys(CLI_CONFIG_STRATEGIES).join(", ");
				throw new Error(`getCliConfig() is only supported for ${supported}, got: ${connectorName}`);
			}
			const connection = (await this.listConnections({ connector_names: connectorName }))[0];
			if (!connection) throw new Error(`No ${connectorName} connection found`);
			const headers = await (0, identity_1.buildHeaders)();
			const identityToken = headers["X-Replit-Token"] ?? headers["Replit-Authentication"];
			if (!identityToken) throw new Error("Replit identity token not found");
			const rawToken = identityToken.replace(/^Bearer\s+/i, "");
			return strategy({
				baseUrl: this.baseUrl,
				connectorName,
				connectionId: connection.id,
				rawIdentityToken: rawToken
			});
		}
		createProxyFetch(connectorName) {
			const proxyBase = this.getProxyUrl();
			return async (input, init) => {
				const targetUrl = resolveProxyTarget(input instanceof Request ? input.url : String(input), proxyBase);
				const authHeaders = await (0, identity_1.buildHeaders)();
				const userHeaders = flattenHeaders(init?.headers ?? (input instanceof Request ? input.headers : void 0));
				const headers = {
					...authHeaders,
					"Connector-Name": connectorName,
					...userHeaders
				};
				const fetchInit = {
					...input instanceof Request ? {
						method: input.method,
						body: input.body,
						cache: input.cache,
						credentials: input.credentials,
						integrity: input.integrity,
						keepalive: input.keepalive,
						mode: input.mode,
						redirect: input.redirect,
						referrer: input.referrer,
						referrerPolicy: input.referrerPolicy,
						signal: input.signal,
						duplex: input.body ? "half" : void 0
					} : {},
					...init,
					headers
				};
				const response = await fetch(targetUrl, fetchInit);
				if (response.status === 401) {
					const freshAuth = await (0, identity_1.buildHeaders)();
					return fetch(targetUrl, {
						...fetchInit,
						headers: {
							...freshAuth,
							"Connector-Name": connectorName,
							...userHeaders
						}
					});
				}
				return response;
			};
		}
	};
	exports.ReplitConnectors = ReplitConnectors;
}));
//#endregion
//#region ../../node_modules/.pnpm/@replit+connectors-sdk@0.4.3/node_modules/@replit/connectors-sdk/index.js
var require_connectors_sdk = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ReplitConnectors = void 0;
	var client_1 = require_client();
	Object.defineProperty(exports, "ReplitConnectors", {
		enumerable: true,
		get: function() {
			return client_1.ReplitConnectors;
		}
	});
}));
//#endregion
export { require_connectors_sdk as t };
