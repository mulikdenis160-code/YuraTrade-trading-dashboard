import assert from "node:assert/strict";
import test from "node:test";
import {
  localSignalStatsDayKey,
  millisecondsUntilNextLocalDay,
  normalizeDailySignalStatsSnapshot,
  resolveDailySignalStatsSnapshot,
} from "./daily-signal-stats.ts";

const emptyStats = {
  settled: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  hitRate: null,
};

test("daily signal statistics stay fixed within a day and refresh on the next local day", () => {
  const saved = {
    dayKey: "2026-10-07",
    stats: { settled: 1, wins: 1, losses: 0, draws: 0, hitRate: 100 },
  };
  const changedDuringDay = {
    settled: 2,
    wins: 1,
    losses: 1,
    draws: 0,
    hitRate: 50,
  };

  assert.deepEqual(
    resolveDailySignalStatsSnapshot(saved, "2026-10-07", changedDuringDay),
    saved,
  );
  assert.deepEqual(
    resolveDailySignalStatsSnapshot(saved, "2026-10-08", changedDuringDay),
    { dayKey: "2026-10-08", stats: changedDuringDay },
  );
  assert.deepEqual(
    resolveDailySignalStatsSnapshot(null, "2026-10-08", emptyStats),
    { dayKey: "2026-10-08", stats: emptyStats },
  );
});

test("daily snapshots ignore stored rates and derive them from recorded wins and losses", () => {
  assert.deepEqual(
    normalizeDailySignalStatsSnapshot({
      dayKey: "2026-10-08",
      stats: { settled: 999, wins: 3, losses: 1, draws: 2, hitRate: 75 },
    }),
    {
      dayKey: "2026-10-08",
      stats: { settled: 6, wins: 3, losses: 1, draws: 2, hitRate: 75 },
    },
  );
  assert.equal(
    normalizeDailySignalStatsSnapshot({
      dayKey: "2026-10-08",
      stats: { wins: 1.5, losses: 0, draws: 0 },
    }),
    null,
  );
});

test("daily refresh timing follows local calendar midnight", () => {
  const beforeMidnight = new Date(2026, 9, 8, 23, 59, 30);
  assert.equal(localSignalStatsDayKey(beforeMidnight), "2026-10-08");
  assert.equal(millisecondsUntilNextLocalDay(beforeMidnight), 30_000);
});
