import { reconcileClosedPocketHistory, type HistoricalCandle, type TimedPriceTick } from "./pocket-option-history.ts";

export type PocketMarketCache = {
  ticks: TimedPriceTick[];
  history: HistoricalCandle[];
  historyPeriodSeconds: number | null;
  historyByPeriod?: Map<number, HistoricalCandle[]>;
};

export function historyForPeriod(state: PocketMarketCache | undefined, period: number): HistoricalCandle[] {
  return state?.historyByPeriod?.get(period) ?? (state?.historyPeriodSeconds === period ? state.history : []);
}

export function storePeriodHistory(state: PocketMarketCache, period: number, candles: HistoricalCandle[]) {
  state.historyByPeriod ??= new Map();
  if (state.historyPeriodSeconds !== null && !state.historyByPeriod.has(state.historyPeriodSeconds)) {
    state.historyByPeriod.set(state.historyPeriodSeconds, state.history);
  }
  state.historyByPeriod.set(period, candles);
  state.historyPeriodSeconds = period;
  state.history = candles;
}

export function refreshPeriodHistories(state: PocketMarketCache, nowMs: number, limit = 128) {
  if (state.historyPeriodSeconds !== null) {
    state.historyByPeriod ??= new Map();
    if (!state.historyByPeriod.has(state.historyPeriodSeconds)) state.historyByPeriod.set(state.historyPeriodSeconds, state.history);
  }
  for (const [period, candles] of state.historyByPeriod ?? []) {
    state.historyByPeriod!.set(period, reconcileClosedPocketHistory(candles, [], state.ticks, period, nowMs, limit));
  }
  if (state.historyPeriodSeconds !== null) state.history = historyForPeriod(state, state.historyPeriodSeconds);
}
