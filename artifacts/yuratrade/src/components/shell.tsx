import { Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap, History, LayoutDashboard, UserRound } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BrandName } from "@/components/brand";
import { levels } from "@/lib/levels";
import { loadFeed } from "@/lib/pocket-live";
import { isAdminId, usePocket } from "@/lib/pocket";

const links = [
  { to: "/", label: "Сигналы", icon: LayoutDashboard },
  { to: "/history", label: "История", icon: History },
  { to: "/learn", label: "Обучение", icon: GraduationCap },
  { to: "/profile", label: "Профиль", icon: UserRound },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { id } = usePocket();
  const admin = isAdminId(id);
  const [levelName, setLevelName] = useState("Без уровня");

  useEffect(() => {
    let stop = false;
    const pull = () => {
      void loadFeed()
        .then((feed) => {
          if (stop || feed.balance === null) return;
          if (admin) return;
          const level = [...levels].reverse().find((item) => feed.balance !== null && feed.balance >= item.deposit);
          setLevelName(level ? `${level.name} · $${level.deposit}` : "Без уровня");
        })
        .catch(() => {});
    };
    pull();
    const timer = window.setInterval(pull, 8000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [admin]);

  return (
    <div className="stage min-h-dvh">
      <div className="aurora" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <header className="sticky top-0 z-20 border-b border-white/6 bg-bg/55 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-1.5 px-3 sm:h-16 sm:gap-2 sm:px-4">
          <BrandName className="min-w-0 truncate text-[15px] sm:text-lg" />
          <nav className="ml-6 hidden items-center lg:flex">
            {links.map((item) => {
              const on = item.to === "/" ? path === "/" : path.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to} className={`nav-link ${on ? "on" : ""}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link to="/profile" className="chip on ml-auto max-w-[7.5rem] shrink-0 truncate text-[11px] sm:max-w-[11rem] sm:text-xs">
            {admin ? "Админ" : levelName}
          </Link>
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-lg px-3 pt-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-6">{children}</main>
      <nav className="fixed inset-x-3 z-20 lg:hidden" style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="nav-glass grid h-16 grid-cols-4 rounded-3xl border border-white/12 bg-white/8 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          {links.map((item) => {
            const on = item.to === "/" ? path === "/" : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] leading-none font-semibold ${on ? "text-blue-soft" : "text-dim"}`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
