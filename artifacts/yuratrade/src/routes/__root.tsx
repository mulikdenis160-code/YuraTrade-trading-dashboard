import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Gate } from "@/components/gate";
import { Shell } from "@/components/shell";
import { PocketProvider, usePocket } from "@/lib/pocket";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "VLADOS PRIME" },
      { name: "theme-color", content: "#080b12" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <PocketProvider>
            <Frame />
          </PocketProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});

function Frame() {
  const { ready, id } = usePocket();
  if (!ready) return <div className="stage min-h-dvh" />;
  if (!id) return <Gate />;
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
