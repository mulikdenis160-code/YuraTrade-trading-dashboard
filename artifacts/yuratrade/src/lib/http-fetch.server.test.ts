import assert from "node:assert/strict";
import { createServer } from "node:http";
import { connect } from "node:net";
import type { Duplex } from "node:stream";
import test from "node:test";
import { environmentFetch } from "./http-fetch.server.ts";

test("SDK fetch reaches its destination through an environment proxy and preserves aborts", async () => {
  const sockets = new Set<Duplex>();
  let tunnels = 0;
  const destination = createServer((req, res) => {
    assert.equal(req.headers["x-test-key"], "test-only");
    res.end("proxy works");
  });
  const proxy = createServer();
  proxy.on("connect", (_req, client, head) => {
    tunnels += 1;
    const address = destination.address();
    assert.ok(address && typeof address === "object");
    const upstream = connect(address.port, "127.0.0.1", () => {
      client.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      if (head.length) upstream.write(head);
      upstream.pipe(client);
      client.pipe(upstream);
    });
    sockets.add(client);
    sockets.add(upstream);
    upstream.on("error", () => client.destroy());
    client.on("error", () => upstream.destroy());
  });
  destination.on("connection", (socket) => sockets.add(socket));
  await new Promise<void>((resolve) => destination.listen(0, "127.0.0.1", resolve));
  await new Promise<void>((resolve) => proxy.listen(0, "127.0.0.1", resolve));
  const keys = ["HTTP_PROXY", "http_proxy", "HTTPS_PROXY", "https_proxy", "NO_PROXY", "no_proxy"];
  const saved = keys.map((key) => [key, process.env[key]] as const);
  try {
    for (const key of keys) delete process.env[key];
    const proxyAddress = proxy.address();
    const destinationAddress = destination.address();
    assert.ok(proxyAddress && typeof proxyAddress === "object");
    assert.ok(destinationAddress && typeof destinationAddress === "object");
    process.env.HTTP_PROXY = `http://127.0.0.1:${proxyAddress.port}`;
    const url = `http://127.0.0.1:${destinationAddress.port}/`;
    const response = await environmentFetch(url, {
      headers: { "x-test-key": "test-only" },
      signal: AbortSignal.timeout(5_000),
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "proxy works");
    assert.equal(tunnels, 1);
    await assert.rejects(environmentFetch(url, { signal: AbortSignal.abort() }), { name: "AbortError" });
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    for (const socket of sockets) socket.destroy();
    await Promise.all([
      new Promise<void>((resolve) => destination.close(() => resolve())),
      new Promise<void>((resolve) => proxy.close(() => resolve())),
    ]);
  }
});
