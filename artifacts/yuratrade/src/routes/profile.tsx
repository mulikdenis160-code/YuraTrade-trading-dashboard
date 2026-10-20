import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { levelForPocketAccount, levels } from "@/lib/levels";
import { isAdminId, usePocket } from "@/lib/pocket";
import { useLanguage } from "@/lib/language";
import { getTelegramInitData } from "@/lib/telegram-webapp";
import { listTierGrants, revokeTierGrant, setTierGrant, type TierGrant } from "@/lib/tier-grants";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { t } = useLanguage();
  const { id, depositAmount, tierGrantId } = usePocket();
  const admin = isAdminId(id);
  const level = levelForPocketAccount(id, depositAmount, tierGrantId);
  const currentLimit = admin || level?.daily === null
    ? t("signal.noLimit")
    : level
      ? t("profile.dailyCount", { count: level.daily })
      : t("signal.block.minimum");
  const [grants, setGrants] = useState<TierGrant[]>([]);
  const [targetId, setTargetId] = useState("");
  const [tierId, setTierId] = useState<(typeof levels)[number]["id"]>("apex");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refreshGrants = async () => {
    const initData = getTelegramInitData();
    if (!initData) return;
    const result = await listTierGrants({ data: { initData } });
    setGrants(result);
  };

  useEffect(() => {
    if (!admin) return;
    void refreshGrants().catch(() => setMessage(t("profile.tariffs.loadError")));
  }, [admin, t]);

  const assignTariff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const initData = getTelegramInitData();
      if (!initData) throw new Error("Telegram session missing");
      await setTierGrant({ data: { initData, pocketOptionId: targetId, tierId } });
      setTargetId("");
      await refreshGrants();
      setMessage(t("profile.tariffs.saved"));
    } catch {
      setMessage(t("profile.tariffs.error"));
    } finally {
      setBusy(false);
    }
  };

  const removeTariff = async (pocketOptionId: string) => {
    setBusy(true);
    setMessage("");
    try {
      const initData = getTelegramInitData();
      if (!initData) throw new Error("Telegram session missing");
      await revokeTierGrant({ data: { initData, pocketOptionId } });
      await refreshGrants();
      setMessage(t("profile.tariffs.revoked"));
    } catch {
      setMessage(t("profile.tariffs.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <section className="panel p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.14em] text-dim uppercase">{admin ? t("profile.admin") : t("profile.title")}</p>
            <p className="mt-2 truncate font-mono text-2xl font-bold text-fg">{id}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {admin
            ? t("profile.adminInfo")
            : t("profile.userInfo")}
        </p>
        {!admin ? (
          <p className="mt-3 rounded-xl border border-blue/20 bg-blue/5 px-3 py-2 text-sm font-semibold text-blue-soft">
            {t("profile.currentLimit", { limit: currentLimit })}
          </p>
        ) : null}
        <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-dim">
          {t("profile.linkedTelegram")}
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
      {admin ? (
        <section className="panel space-y-4 p-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-blue-soft uppercase">{t("profile.admin")}</p>
            <h2 className="mt-1 text-xl font-bold text-fg">{t("profile.tariffs.title")}</h2>
          </div>
          <form className="space-y-3" onSubmit={assignTariff}>
            <label className="block space-y-1.5 text-sm text-muted">
              <span>{t("profile.tariffs.id")}</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-fg outline-none focus:border-blue/50"
                inputMode="numeric"
                pattern="[0-9]{9}"
                maxLength={9}
                required
                value={targetId}
                onChange={(event) => setTargetId(event.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="123456789"
              />
            </label>
            <label className="block space-y-1.5 text-sm text-muted">
              <span>{t("profile.tariffs.plan")}</span>
              <select
                className="w-full rounded-xl border border-white/10 bg-[#111722] px-3 py-2.5 text-fg"
                value={tierId}
                onChange={(event) => setTierId(event.target.value as typeof tierId)}
              >
                {levels.map((item) => <option key={item.id} value={item.id}>{item.name} · ${item.deposit}</option>)}
              </select>
            </label>
            <button className="w-full rounded-xl bg-blue px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={busy}>
              {t("profile.tariffs.assign")}
            </button>
          </form>
          {message ? <p className="text-sm text-blue-soft" role="status">{message}</p> : null}
          <div className="space-y-2 border-t border-white/10 pt-3">
            {grants.length === 0 ? <p className="text-sm text-dim">{t("profile.tariffs.empty")}</p> : grants.map((grant) => {
              const grantLevel = levels.find((item) => item.id === grant.tierId);
              return (
                <div key={grant.pocketOptionId} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <div>
                    <p className="font-mono text-sm text-fg">{grant.pocketOptionId}</p>
                    <p className="text-xs text-muted">{grantLevel?.name} · ${grantLevel?.deposit}</p>
                  </div>
                  <button type="button" className="rounded-lg bg-white/5 px-3 py-2 text-sm text-muted disabled:opacity-50" disabled={busy} onClick={() => void removeTariff(grant.pocketOptionId)}>
                    {t("profile.tariffs.revoke")}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
