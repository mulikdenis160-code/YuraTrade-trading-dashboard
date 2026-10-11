---
name: Rotating signal candidates
description: Selection strategy for Pocket Option candidates that balances coverage against per-search latency.
---

Use a payout-descending pool of at most 20 active OTC currency pairs paying at least 92%. Analyze exactly one pair per request and rotate through the pool across requests; recent-pair exclusions may skip entries but must not pin searches to one candidate. If a candidate has no fresh quote, skip it and continue the bounded search rather than aborting the request.

**Why:** the user wants a single Gemini request for one pair at a time, with payout-aware rotation rather than parallel analysis of several candidates. A missing tick from one pair should not prevent trying the next eligible pair.

**How to apply:** sort eligible pairs by current payout, cap the list at 20, advance a shared round-robin selector, and load/analyze only the selected pair. Keep candle validation and quote freshness checks; quote failure makes that candidate a pass, not a signal.
