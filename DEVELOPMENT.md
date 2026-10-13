# Development and connection checks

Use Node.js 24 and the pinned pnpm 10.30.0. The cloud task already has an
isolated checkout; do not create another worktree unless requested.

From `/workspace/YuraTrade-trading-dashboard`:

```sh
export COREPACK_HOME=/workspace/.corepack
export PNPM_HOME=/workspace/.pnpm
CI=true corepack pnpm@10.30.0 install --frozen-lockfile --store-dir /workspace/.pnpm-store
PORT=8080 corepack pnpm@10.30.0 --filter @workspace/yuratrade run dev
```

The main application uses the repository's app environment wrapper. Without
`DATABASE_URL`, its supported PGLite database runs in memory and applies
migrations automatically. Data resets when the server restarts.

Store credentials only in secure environment settings:

- `POCKET_OPTION_FEED_AUTH`: the complete Socket.IO `42["auth", …]` frame,
  including the account's `isDemo` field; a session ID alone is insufficient.
- `GEMINI_API_KEY`: Google Gemini API key, or the existing supported Gemini
  proxy configuration.
- Telegram identity and partner verification additionally require their
  existing bot and partner configuration. Do not bypass the access gate.

Pocket Option WebSocket and Gemini SDK requests now respect the environment's
proxy configuration and `NO_PROXY`. Without a proxy they use direct connections.
Keep TLS verification enabled. Restricted environments need access to
`generativelanguage.googleapis.com` and the account's Pocket endpoint:
`demo-api-eu.po.market` for demo or `api-eu.po.market` for real accounts.

## Checks

```sh
corepack pnpm@10.30.0 --filter @workspace/yuratrade test
corepack pnpm@10.30.0 run typecheck
PORT=8080 BASE_PATH=/ corepack pnpm@10.30.0 run build
corepack pnpm@10.30.0 --filter @workspace/yuratrade run test:tooling
```

The build regenerates **tracked** `artifacts/yuratrade/.vercel/output` files.
Back up that directory, including local changes, outside the checkout before
building. Restore only build-generated changes after validation; do not discard
user work. Generated deployment files should not obscure source changes.

The main test command covers application, authentication, data-readiness and
network regression tests. PWA tests use isolated fixtures so the application's
branding does not contaminate generic cases.

Four optional tooling tests require platform-owned files absent from this
repository: `artifacts/yuratrade/AGENTS.md` and
`artifacts/yuratrade/.grok/skills/og/` (including its references). They remain
failing with `ENOENT`; their assertions have not been removed or disabled.

For internal HTTP smoke checks, the main site must return HTTP 200 with title
`PRIME BOT`; unauthenticated `/api/ticks` must return HTTP 401. Run
`node artifacts/yuratrade/scripts/check-auth-invariant.mjs` from the repository
root to verify that development and build authentication flags agree.

The optional API server can be started with `PORT=5000 NODE_ENV=development`
and `corepack pnpm@10.30.0 --filter @workspace/api-server run dev`;
`/api/healthz` must return `{"status":"ok"}`. The optional mockup sandbox uses
`PORT=8081 BASE_PATH=/ corepack pnpm@10.30.0 --filter @workspace/mockup-sandbox run dev`.

## Reading connection failures

- `pocket-feed-authenticated`: the broker accepted the current authorization.
- `pocket-history-response`: a history response was parsed; check candle count
  and freshness rather than interpreting connection alone as readiness.
- `pocket-fast-history`: split fast-history attachments were received and
  retained. Covered ticks can fill missing closed candles; insufficient tick
  coverage must still reject a signal. Complete OHLC tuples in the same fast
  packet are validated and used directly. A pending latest-history request can
  complete from this packet even if the separate legacy history reply is missing
  or stale. Forming candle snapshots are not cached as completed candles.
  Subsequent live ticks maintain closed-candle caches; overlapping history loads
  for the same asset and period share one request.
- `pocket-history-warmup-failed`: one pair failed; other pairs continue warming.
- `signal-ai-duration`: distinguishes Gemini timeout, HTTP failure and a
  completed request. Provider HTTP 503 can still happen after successful
  authentication; it is not proof of an invalid key.

Current validation: all workspace type checks and all three application builds
passed. Application tests: 225 passed. Tooling tests: 193 passed, four failed
because the platform documentation described above is missing. HTTP smoke
checks passed for the website, the API health endpoint and mockup sandbox.
Pocket Option authenticated and supplied history and fast ticks. After fixing
history handling, two consecutive live signal requests used 100 and 101 closed
candles aged three and eight seconds, with no missing or irregular intervals.
Both passed history validation. Those attempts hit Gemini HTTP 503/429.
Subsequent live verification produced an EURGBP OTC CALL signal for a 120-second
expiry; Gemini returned a valid response and the entry-window check succeeded.
Two other requests in that series returned HTTP 429, so provider rate limits
remain an observed limitation. Saved signal results are historical test output;
their entry windows expire and should not be treated as current entry signals.

## Signal request controls

Provider and pair failures have different handling. Missing data for one pair
can select another; Gemini quota, authentication, timeout and malformed-response
failures stop the search. The interface displays a retry timer instead of
issuing model requests for up to eight different pairs after the same failure.

The server serializes model work within a process, shares identical in-flight
requests, and honors `Retry-After` and Google `RetryInfo`. It retries a transient
5xx failure at most once only when the provider delay and original ten-second
analysis deadline allow it. It never automatically retries 429 or authentication
errors. Analysis timeouts abort the client's SDK request; Google may still count
already accepted work against its quota. Successful decisions are not reused
as cached signals for later requests. Cooldowns survive development HMR but
are scoped to the running process, not a distributed account-wide limiter.

History caches retain minute, five-minute and fifteen-minute intervals separately.
Reconnecting clears data from the old connection. A prepared signal has an
entry expiration; the server and interface reject expired signals and quote
confirmations. Returning from a background tab cannot open an old prediction.

Browser checks used isolated mocked RPC fixtures, without weakening production
access control. They verified that a cooldown disables requests, recovery works
after the delay, long delays display a readable timer, and an expired background
signal cannot navigate to an entry. No browser console errors were observed.

The latest real-provider series stopped at Google HTTP 429 with a quota-exhausted
response and a 2,884-second retry delay. One outbound model request was made;
an immediate request for another pair was blocked without a second provider
call. This validates cooldown handling, not successful live generation under
the new controls. Complete real-provider repetition requires available Google
quota. Evidence: `/workspace/site-preview/signal-check-results.json` and
`/workspace/site-preview/signal-ui-check.json` (the latter is a mocked UI check).

History and signal deadlines remain bounded. Stale or incomplete candles are
not relabeled as fresh, and no trades are opened by these checks. Changes in
this checkout are not deployed to an existing Replit website automatically.

## History timeout recovery

Signal history now has an eight-second response deadline and one reissue after
2.5 seconds. Both attempts share the request ID, chart lock and original
deadline; successful completion, disconnection and HMR disposal cancel the
recovery timer. Background warmup retains a 4.5-second deadline without retries
and uses lower queue priority. A queued signal can use history that became fresh
while waiting, rather than requesting the same data again. Quote subscriptions
do not switch charts and no longer wait behind history loads.

The Socket.IO decoder preserves a pending history attachment across intervening
inline quote/control events. Previously any inline event discarded the pending
header, so the following candle attachment could be lost. Authorization changes
and superseding binary headers still reset pending decoding state.

Tests cover lost requests, responses arriving after five seconds, cancellation,
retry failure, bounded expiration, queue priority/FIFO ordering and interleaved
quote/history frames. All 217 application tests, package typechecks and builds
passed. A real Pocket diagnostic deliberately dropped each initial foreground
request: three different pairs returned validated 60/300/900-second history
after recovery, 99 candles each, in 3.64/2.98/3.36 seconds. This is a history
recovery check, not a Gemini signal generation or a Replit production test.
Evidence: /workspace/site-preview/pocket-history-recovery-results.json.
A separate real series still observed missing responses before these checks;
provider outages and invalid history remain errors rather than fabricated data.

## Recovery signal preparation

Recovery requests explicitly select a 30-second model deadline and up to
45 seconds for preparation. Ordinary requests retain their ten-second model
and twenty-second preparation limits. Browser recovery has one shared
60-second budget, with a one-second transport allowance per request, and
allows at most two preparations. A second preparation reloads/validates market
data; it does not reuse a previous direction. Only transient model failures
(timeout, short unavailability/busy) or pair-scoped data failures may retry.
Quota, configuration, malformed responses, long provider cooldowns and unknown
RPC failures stop immediately. Leaving recovery suppresses further attempts.

Recovery confirmation now supplies the prepared signal expiration, bounds the
confirmation request and checks the returned quote validity before navigation.
Expired background-tab recovery cannot open an old signal.

225 tests, all package typechecks and builds passed. Real recovery-mode
generation and confirmation succeeded for AEDCNY OTC (120-second expiry),
with preparation taking 7.39 seconds. A preceding independent real request
returned Gemini HTTP503; do not claim every provider request succeeds.
Evidence: /workspace/site-preview/overlay-live-check.json. Saved signal
windows are historical and expired. Deploy the updated source in Replit
to verify actual production behavior; no trade was opened by these checks.
