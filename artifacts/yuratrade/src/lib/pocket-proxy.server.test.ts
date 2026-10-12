import assert from "node:assert/strict";
import test from "node:test";
import { pocketProxyAgent } from "./pocket-proxy.server.ts";

test("WebSocket uses HTTPS proxy and respects NO_PROXY and direct environments", () => {
  const names = Object.keys(process.env).filter((name) => /proxy/i.test(name));
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    const url = "wss://demo-api-eu.po.market/socket.io/?EIO=4&transport=websocket";
    assert.equal(pocketProxyAgent(url), undefined);
    process.env.HTTPS_PROXY = "http://127.0.0.1:3128";
    const agent = pocketProxyAgent(url);
    assert.ok(agent);
    assert.equal(agent.proxy.hostname, "127.0.0.1");
    assert.equal(agent.proxy.port, "3128");
    agent.destroy();
    process.env.NO_PROXY = ".po.market";
    assert.equal(pocketProxyAgent(url), undefined);
    process.env.NO_PROXY = "unrelated.example";
    const otherAgent = pocketProxyAgent(url);
    assert.ok(otherAgent);
    otherAgent.destroy();
  } finally {
    for (const name of Object.keys(process.env)) {
      if (/proxy/i.test(name)) delete process.env[name];
    }
    Object.assign(process.env, saved);
  }
});
