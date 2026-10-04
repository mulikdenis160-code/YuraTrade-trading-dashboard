import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ticks")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const symbol = new URL(request.url).searchParams.get("symbol")?.trim() ?? "";
        if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) {
          return new Response("bad symbol", { status: 400 });
        }
        const { followQuote } = await import("@/lib/pocket-live.server");
        const encoder = new TextEncoder();
        let closed = false;
        const stream = new ReadableStream({
          start(controller) {
            let timer: ReturnType<typeof setInterval>;
            const stop = () => {
              if (closed) return;
              closed = true;
              clearInterval(timer);
              try {
                controller.close();
              } catch {
                /* already closed */
              }
            };
            request.signal.addEventListener("abort", stop);
            let last = "";
            timer = setInterval(() => {
              if (closed) return;
              const quote = followQuote(symbol);
              if (!quote) return;
              const line = String(quote.price);
              if (line === last) return;
              last = line;
              try {
                controller.enqueue(encoder.encode(`data: ${line}\n\n`));
              } catch {
                stop();
              }
            }, 250);
          },
        });
        return new Response(stream, {
          headers: {
            "content-type": "text/event-stream",
            "cache-control": "no-cache",
            connection: "keep-alive",
          },
        });
      },
    },
  },
});
