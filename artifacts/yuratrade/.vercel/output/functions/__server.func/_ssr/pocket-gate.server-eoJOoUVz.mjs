import { a as getRequest } from "./ssr.mjs";
import { n as isValidPocketOptionId, t as isAdminId } from "./pocket-admin-BdE5Pnii.mjs";
import { createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/pocket-gate.server-eoJOoUVz.js
var _0001_telegram_pocket_gate_default = "CREATE TABLE IF NOT EXISTS telegram_pocket_bindings (\n  telegram_user_id TEXT PRIMARY KEY,\n  pocket_option_id TEXT NOT NULL UNIQUE\n    CHECK (pocket_option_id ~ '^[0-9]{9}$'),\n  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE TABLE IF NOT EXISTS telegram_pocket_gate_attempts (\n  telegram_user_id TEXT PRIMARY KEY,\n  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0)\n);\n";
var _0002_telegram_locale_default = "ALTER TABLE telegram_pocket_bindings\n  ADD COLUMN locale TEXT\n    CHECK (locale IN ('ru', 'uk', 'en'));\n";
var _0003_telegram_admin_access_default = "CREATE TABLE IF NOT EXISTS telegram_admin_access (\n  telegram_user_id TEXT PRIMARY KEY\n    CHECK (telegram_user_id ~ '^[0-9]{1,20}$'),\n  pocket_option_id TEXT NOT NULL\n    CHECK (pocket_option_id IN ('113510708', '92535291', '984367891')),\n  locale TEXT CHECK (locale IN ('ru', 'uk', 'en')),\n  granted_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0001_telegram_pocket_gate.sql": _0001_telegram_pocket_gate_default,
			"/migrations/0002_telegram_locale.sql": _0002_telegram_locale_default,
			"/migrations/0003_telegram_admin_access.sql": _0003_telegram_admin_access_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
/**
* Fetch-Metadata sibling isolation — **server-only** (`.server.ts` suffix).
*
* MUST keep the `.server` suffix: this file imports `@tanstack/react-start/server`
* (`getRequest` → Node `AsyncLocalStorage`). If it is imported from a dual
* client/server module under a non-`.server` name, Vite ships it to the browser
* and the app dies with: `AsyncLocalStorage is not a constructor`.
*
* Apps deployed on `*.grok.me` are "same-site" to each other but MUTUALLY
* UNTRUSTED, and a `SameSite=Lax` session cookie IS sent on same-site
* subrequests — so without this, a malicious sibling could make a SCRIPTED
* (fetch/XHR/form-POST) request to this app's server functions and ride this
* app's session cookie.
*
* We allow only: same-origin requests (this app's own client), non-browser
* requests (SSR / server-to-server, which send no `Sec-Fetch-Site`), and
* top-level GET navigations (how the OAuth callback and normal page loads
* arrive). Every cross-site / same-site *scripted* request is rejected.
* Together with `__Host-` cookies and Better Auth's `trustedOrigins`, this
* closes the sibling-tenant attack surface. Enforced at the `authMiddleware`
* chokepoint (see `middleware.ts`).
*/
var CrossSiteRequestError = class extends Error {
	status = 403;
	constructor() {
		super("Forbidden: cross-site request blocked");
		this.name = "CrossSiteRequestError";
	}
};
/** Throw `CrossSiteRequestError` for a scripted cross-site/sibling request. */
function assertSameSiteRequest() {
	const request = getRequest();
	if (!request) return;
	const h = request.headers;
	const site = h.get("sec-fetch-site");
	if (!site || site === "same-origin" || site === "none") return;
	const dest = h.get("sec-fetch-dest");
	if (h.get("sec-fetch-mode") === "navigate" && request.method === "GET" && dest !== "object" && dest !== "embed") return;
	throw new CrossSiteRequestError();
}
var MAX_INIT_DATA_AGE_SECONDS = 86400;
var MAX_FUTURE_CLOCK_SKEW_SECONDS = 60;
function validateTelegramInitData$1(raw, botToken, nowMilliseconds = Date.now()) {
	if (!raw || raw.length > 1e4 || !botToken) return null;
	const values = /* @__PURE__ */ new Map();
	for (const [key, value] of new URLSearchParams(raw).entries()) {
		if (values.has(key)) return null;
		values.set(key, value);
	}
	const suppliedHash = values.get("hash");
	const authDateText = values.get("auth_date");
	const userText = values.get("user");
	if (!suppliedHash || !/^[\da-f]{64}$/i.test(suppliedHash) || !authDateText || !userText) return null;
	const authDate = Number(authDateText);
	const now = Math.floor(nowMilliseconds / 1e3);
	if (!Number.isSafeInteger(authDate) || authDate <= 0 || authDate > now + MAX_FUTURE_CLOCK_SKEW_SECONDS || now - authDate > MAX_INIT_DATA_AGE_SECONDS) return null;
	let telegramUserId;
	try {
		const parsed = JSON.parse(userText);
		if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed) || !("id" in parsed) || typeof parsed.id !== "number" && typeof parsed.id !== "string") return null;
		telegramUserId = Number(parsed.id);
		if (!Number.isSafeInteger(telegramUserId) || telegramUserId <= 0) return null;
	} catch {
		return null;
	}
	const checkString = [...values.entries()].filter(([key]) => key !== "hash").sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0).map(([key, value]) => `${key}=${value}`).join("\n");
	const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
	const expectedHash = createHmac("sha256", secretKey).update(checkString).digest();
	const actualHash = Buffer.from(suppliedHash, "hex");
	if (actualHash.length !== expectedHash.length || !timingSafeEqual(actualHash, expectedHash)) return null;
	return String(telegramUserId);
}
function recordOf(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function positiveNumber(value) {
	if (typeof value !== "number" && typeof value !== "string") return false;
	if (typeof value === "string" && value.trim() === "") return false;
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0;
}
function nonNegativeAmount(value) {
	if (typeof value !== "number" && typeof value !== "string") return null;
	if (typeof value === "string" && value.trim() === "") return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
function parsePocketPartnerStatus(payload, pocketOptionId) {
	const root = recordOf(payload);
	const user = root ? recordOf(root.user) ?? recordOf(root.data) ?? root : null;
	if (!user || !("uid" in user) || !("count_deposits" in user)) throw new Error("Partner API response is missing required account status.");
	return {
		registered: String(user.uid) === pocketOptionId,
		hasDeposit: positiveNumber(user.count_deposits),
		depositAmount: nonNegativeAmount(user.sum_ftd)
	};
}
function evaluatePocketGateStatus(partnerStatus, pocketOptionId, telegramUserId) {
	if (isAdminId(pocketOptionId)) return {
		status: "verified",
		depositAmount: 0
	};
	if (!partnerStatus.registered) return { status: "not_registered" };
	if (!partnerStatus.hasDeposit) return { status: "deposit_required" };
	if (partnerStatus.depositAmount === null) return { status: "check_unavailable" };
	return {
		status: "verified",
		depositAmount: partnerStatus.depositAmount ?? 0
	};
}
function telegramAdminBypassForPocketId(pocketOptionId) {
	return isAdminId(pocketOptionId) ? {
		status: "verified",
		pocketId: pocketOptionId,
		depositAmount: 0
	} : null;
}
var PARTNER_ID = "857649";
var PARTNER_API_URL = "https://pocketpartners.me/api/v1/user-info";
var MAX_ATTEMPTS_PER_WINDOW = 5;
var PARTNER_REQUEST_TIMEOUT_MS = 8e3;
function validateTelegramInitData(raw) {
	const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
	return token ? validateTelegramInitData$1(raw, token) : null;
}
async function readBindingByTelegram(telegramUserId) {
	return (await (await getSql()).query(`SELECT pocket_option_id FROM (
       SELECT pocket_option_id, 1 AS priority
       FROM telegram_admin_access
       WHERE telegram_user_id = $1
       UNION ALL
       SELECT pocket_option_id, 2 AS priority
       FROM telegram_pocket_bindings
       WHERE telegram_user_id = $1
     ) access_ids
     ORDER BY priority
     LIMIT 1`, [telegramUserId]))[0]?.pocket_option_id ?? null;
}
async function getPocketGateStateForTelegram(initData) {
	assertSameSiteRequest();
	const telegramUserId = validateTelegramInitData(initData);
	if (!telegramUserId) return { status: "telegram_required" };
	try {
		const pocketId = await readBindingByTelegram(telegramUserId);
		if (!pocketId) return { status: "unverified" };
		const adminBypass = telegramAdminBypassForPocketId(pocketId);
		if (adminBypass) return adminBypass;
		const gate = evaluatePocketGateStatus(await readPartnerStatus(pocketId), pocketId, telegramUserId);
		if (gate.status === "not_registered") return { status: "unverified" };
		if (gate.status === "deposit_required") return { status: "deposit_required" };
		if (gate.status === "check_unavailable") return { status: "check_unavailable" };
		return {
			status: "verified",
			pocketId,
			depositAmount: gate.depositAmount
		};
	} catch {
		return { status: "check_unavailable" };
	}
}
async function incrementAttemptCount(telegramUserId) {
	const rows = await (await getSql()).query(`INSERT INTO telegram_pocket_gate_attempts
       (telegram_user_id, window_started_at, attempt_count)
     VALUES ($1, now(), 1)
     ON CONFLICT (telegram_user_id) DO UPDATE
       SET window_started_at = CASE
             WHEN telegram_pocket_gate_attempts.window_started_at <=
               now() - interval '1 hour'
             THEN now()
             ELSE telegram_pocket_gate_attempts.window_started_at
           END,
           attempt_count = CASE
             WHEN telegram_pocket_gate_attempts.window_started_at <=
               now() - interval '1 hour'
             THEN 1
             ELSE telegram_pocket_gate_attempts.attempt_count + 1
           END
     RETURNING attempt_count`, [telegramUserId]);
	return Number(rows[0]?.attempt_count ?? 0);
}
async function readPartnerStatus(pocketOptionId) {
	const apiKey = process.env.POCKET_OPTION_PARTNER_API_KEY?.trim();
	if (!apiKey) throw new Error("Partner API configuration is missing.");
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), PARTNER_REQUEST_TIMEOUT_MS);
	try {
		const response = await fetch(`${PARTNER_API_URL}/${encodeURIComponent(pocketOptionId)}/${PARTNER_ID}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				Accept: "application/json"
			},
			signal: controller.signal
		});
		if (response.status === 404) return {
			registered: false,
			hasDeposit: false,
			depositAmount: null
		};
		if (!response.ok) throw new Error("Partner API request failed.");
		return parsePocketPartnerStatus(await response.json(), pocketOptionId);
	} finally {
		clearTimeout(timeout);
	}
}
async function verifyPocketAccountForTelegramIdentity(pocketOptionId, telegramUserId) {
	if (!isValidPocketOptionId(pocketOptionId)) return { status: "invalid_id" };
	try {
		const adminBypass = telegramAdminBypassForPocketId(pocketOptionId);
		const sql = await getSql();
		if (adminBypass) {
			await sql.query(`INSERT INTO telegram_admin_access (telegram_user_id, pocket_option_id)
         VALUES ($1, $2)
         ON CONFLICT (telegram_user_id) DO UPDATE
           SET pocket_option_id = EXCLUDED.pocket_option_id,
               granted_at = now()`, [telegramUserId, pocketOptionId]);
			return adminBypass;
		}
		const existing = await sql.query(`SELECT telegram_user_id, pocket_option_id
       FROM telegram_pocket_bindings
       WHERE telegram_user_id = $1 OR pocket_option_id = $2
       LIMIT 1`, [telegramUserId, pocketOptionId]);
		if (existing[0]) {
			if (existing[0].telegram_user_id !== telegramUserId || existing[0].pocket_option_id !== pocketOptionId) return { status: "already_linked" };
			const gate = evaluatePocketGateStatus(await readPartnerStatus(pocketOptionId), pocketOptionId, telegramUserId);
			if (gate.status !== "verified") return gate;
			return {
				status: "verified",
				pocketId: pocketOptionId,
				depositAmount: gate.depositAmount
			};
		}
		if (await incrementAttemptCount(telegramUserId) > MAX_ATTEMPTS_PER_WINDOW) return { status: "rate_limited" };
		const gate = evaluatePocketGateStatus(await readPartnerStatus(pocketOptionId), pocketOptionId, telegramUserId);
		if (gate.status !== "verified") return gate;
		if ((await sql.query(`INSERT INTO telegram_pocket_bindings (telegram_user_id, pocket_option_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING telegram_user_id`, [telegramUserId, pocketOptionId])).length > 0) return {
			status: "verified",
			pocketId: pocketOptionId,
			depositAmount: gate.depositAmount
		};
		const conflict = await sql.query(`SELECT telegram_user_id, pocket_option_id
       FROM telegram_pocket_bindings
       WHERE telegram_user_id = $1 OR pocket_option_id = $2
       LIMIT 1`, [telegramUserId, pocketOptionId]);
		return conflict[0]?.telegram_user_id === telegramUserId && conflict[0]?.pocket_option_id === pocketOptionId ? {
			status: "verified",
			pocketId: pocketOptionId,
			depositAmount: gate.depositAmount
		} : { status: "already_linked" };
	} catch {
		return { status: "check_unavailable" };
	}
}
async function verifyPocketAccountForTelegram(pocketOptionId, initData) {
	if (!isValidPocketOptionId(pocketOptionId)) return { status: "invalid_id" };
	assertSameSiteRequest();
	const telegramUserId = validateTelegramInitData(initData);
	if (!telegramUserId) return { status: "telegram_required" };
	return verifyPocketAccountForTelegramIdentity(pocketOptionId, telegramUserId);
}
async function verifyPocketAccountForTelegramUser(pocketOptionId, telegramUserId) {
	if (!isValidPocketOptionId(pocketOptionId)) return { status: "invalid_id" };
	if (!/^\d{1,20}$/.test(telegramUserId)) return { status: "telegram_required" };
	return verifyPocketAccountForTelegramIdentity(pocketOptionId, telegramUserId);
}
async function verifyLinkedPocketAccountForTelegramUser(telegramUserId) {
	if (!/^\d{1,20}$/.test(telegramUserId)) return { status: "telegram_required" };
	try {
		const pocketOptionId = await readBindingByTelegram(telegramUserId);
		if (!pocketOptionId) return { status: "telegram_required" };
		return verifyPocketAccountForTelegramIdentity(pocketOptionId, telegramUserId);
	} catch {
		return { status: "check_unavailable" };
	}
}
async function readTelegramLocale(telegramUserId) {
	const locale = (await (await getSql()).query(`SELECT locale FROM (
       SELECT locale, 1 AS priority
       FROM telegram_admin_access
       WHERE telegram_user_id = $1
       UNION ALL
       SELECT locale, 2 AS priority
       FROM telegram_pocket_bindings
       WHERE telegram_user_id = $1
     ) locales
     ORDER BY priority
     LIMIT 1`, [telegramUserId]))[0]?.locale;
	return locale === "ru" || locale === "uk" || locale === "en" ? locale : null;
}
async function saveTelegramLocale(telegramUserId, locale) {
	const sql = await getSql();
	if ((await sql.query(`UPDATE telegram_admin_access
     SET locale = $1
     WHERE telegram_user_id = $2
     RETURNING telegram_user_id`, [locale, telegramUserId]))[0]) return;
	if (!(await sql.query(`UPDATE telegram_pocket_bindings
     SET locale = $1
     WHERE telegram_user_id = $2
     RETURNING telegram_user_id`, [locale, telegramUserId]))[0]) throw new Error("Cannot save a Telegram locale without a verified binding.");
}
async function requireVerifiedPocketAccess(initData) {
	assertSameSiteRequest();
	if (!initData) throw new Error("Telegram Mini App authentication is required.");
	const telegramUserId = validateTelegramInitData(initData);
	if (!telegramUserId) throw new Error("Telegram Mini App authentication is invalid or expired.");
	const pocketOptionId = await readBindingByTelegram(telegramUserId);
	if (!pocketOptionId) throw new Error("Pocket Option access has not been verified.");
	return {
		telegramUserId,
		pocketOptionId
	};
}
//#endregion
export { getPocketGateStateForTelegram, readTelegramLocale, requireVerifiedPocketAccess, saveTelegramLocale, verifyLinkedPocketAccountForTelegramUser, verifyPocketAccountForTelegram, verifyPocketAccountForTelegramUser };
