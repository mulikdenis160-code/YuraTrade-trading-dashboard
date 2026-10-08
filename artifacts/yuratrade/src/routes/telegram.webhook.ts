import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleTelegramWebhook } = await import("@/lib/telegram-bot.server");
        return handleTelegramWebhook(request);
      },
    },
  },
});
