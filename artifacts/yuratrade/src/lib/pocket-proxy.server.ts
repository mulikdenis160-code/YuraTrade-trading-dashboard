import { HttpsProxyAgent } from "https-proxy-agent";
import { getProxyForUrl } from "proxy-from-env";

/** WebSocket upgrades use HTTPS routing, including NO_PROXY exclusions. */
export function pocketProxyAgent(feedUrl: string) {
  const destination = new URL(feedUrl);
  destination.protocol = destination.protocol === "wss:" ? "https:" : "http:";
  const proxy = getProxyForUrl(destination.href);
  return proxy ? new HttpsProxyAgent(proxy) : undefined;
}
