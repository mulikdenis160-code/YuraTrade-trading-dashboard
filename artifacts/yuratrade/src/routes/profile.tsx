import { createFileRoute } from "@tanstack/react-router";
import { levels } from "@/lib/levels";
import { isAdminId, usePocket } from "@/lib/pocket";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { t } = useLanguage();
  const { id, leave } = usePocket();
  const admin = isAdminId(id);

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <section className="panel p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.14em] text-dim uppercase">{admin ? t("profile.admin") : t("profile.title")}</p>
            <p className="mt-2 truncate font-mono text-2xl font-bold text-fg">{id}</p>
          </div>
          <button type="button" className="btn-ghost shrink-0 text-sm" onClick={leave}>
            {t("profile.signOut")}
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {admin
            ? t("profile.adminInfo")
            : t("profile.userInfo")}
        </p>
      </section>
      {levels.map((level) => (
        <article key={level.id} className="panel arrive p-4" style={{ animationDelay: `${levels.indexOf(level) * 80}ms` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-blue-soft uppercase">{level.tag}</p>
              <h2 className="mt-1 text-2xl font-bold text-fg">{level.name}</h2>
            </div>
            <p className="font-mono text-xl font-bold text-fg">${level.deposit}</p>
          </div>
          <p className="mt-3 text-sm text-muted">{level.lead}</p>
          <ul className="mt-3 space-y-2">
            {level.points.map((point) => (
              <li key={point} className="flex gap-2 text-sm leading-relaxed text-fg">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-blue-soft" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
