import { EnvHttpProxyAgent } from "undici";

// Node's fetch does not use HTTPS_PROXY by default. Keep routing local to the
// server-side SDK, preserving its abort signal, TLS checks and NO_PROXY rules.
let dispatcher: EnvHttpProxyAgent | undefined;
export const environmentFetch: typeof fetch = (input, init) => {
  dispatcher ??= new EnvHttpProxyAgent();
  return fetch(input, { ...init, dispatcher } as RequestInit);
};
