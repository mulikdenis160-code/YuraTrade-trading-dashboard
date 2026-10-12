export class SignalDataError extends Error {
  scope: "pair" | "feed";
  constructor(message: string, scope: "pair" | "feed") {
    super(message);
    this.scope = scope;
    this.name = "SignalDataError";
  }
  toResult() {
    return { decision: "pass" as const, reason: this.message,
      retryAcrossPairs: this.scope === "pair", retryAfterMs: this.scope === "feed" ? 2_000 : 0 };
  }
}
