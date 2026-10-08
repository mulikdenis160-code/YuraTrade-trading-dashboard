import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MarketLearning } from "@/components/market-learning";
import { lessons, quiz } from "@/lib/lessons";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/learn")({ component: LearnPage });

const DONE_KEY = "vprime_learn_done";

function readDone(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(DONE_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function LearnPage() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(lessons[0].id);
  const [done, setDone] = useState<string[]>([]);
  const [picked, setPicked] = useState<Record<number, number>>({});

  useEffect(() => {
    setDone(readDone());
  }, []);

  const lesson = lessons.find((item) => item.id === current) ?? lessons[0];
  const score = quiz.filter((item, index) => picked[index] === item.answer).length;
  const answered = Object.keys(picked).length;

  const mark = () => {
    const next = done.includes(lesson.id) ? done : [...done, lesson.id];
    setDone(next);
    localStorage.setItem(DONE_KEY, JSON.stringify(next));
    const index = lessons.findIndex((item) => item.id === lesson.id);
    const following = lessons[index + 1];
    if (following) setCurrent(following.id);
  };

  return (
    <div className="space-y-5">
      <header className="rise">
        <p className="text-sm font-semibold tracking-[0.16em] text-blue-soft uppercase">{t("learn.kicker")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">{t("learn.title")}</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
          {t("learn.intro", { done: done.length, total: lessons.length })}
        </p>
      </header>

      <div className="rise rise-2">
        <MarketLearning />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[16rem_1fr]">
        <nav className="rise rise-2 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {lessons.map((item, index) => {
            const on = item.id === lesson.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrent(item.id)}
                className={`min-h-11 shrink-0 rounded-2xl px-3 py-2 text-left lg:w-full ${on ? "bg-blue/10 text-blue-soft" : "text-muted hover:bg-white/4"}`}
              >
                <span className="block text-sm font-semibold">
                  {index + 1}. {item.title}
                </span>
                <span className="mt-0.5 block text-xs text-dim">
                  {t("learn.minutes", { minutes: item.minutes })}{done.includes(item.id) ? t("learn.read") : ""}
                </span>
              </button>
            );
          })}
        </nav>

        <article className="panel rise rise-3 p-5">
          <p className="text-xs font-semibold tracking-wide text-dim uppercase">{t("learn.minutes", { minutes: lesson.minutes })}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-fg">{lesson.title}</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">{lesson.lead}</p>
          <div className="mt-5 space-y-4">
            {lesson.blocks.map((block, index) => {
              if (block.type === "h") return <h3 key={index} className="pt-2 text-lg font-semibold text-fg">{block.text}</h3>;
              if (block.type === "p") return <p key={index} className="text-base leading-relaxed text-fg/90">{block.text}</p>;
              if (block.type === "note") {
                return (
                  <p key={index} className="rounded-2xl bg-blue/10 px-4 py-3 text-sm leading-relaxed text-muted">
                    {block.text}
                  </p>
                );
              }
              if (block.type === "list") {
                return (
                  <ul key={index} className="space-y-2">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-fg/90">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-soft" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <div key={index}>
                  <div className="hidden overflow-x-auto sm:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-xs tracking-wide text-dim uppercase">
                          {block.headers.map((header) => (
                            <th key={header} className="px-2 py-2 font-semibold">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row) => (
                          <tr key={row.join()} className="border-t border-white/6">
                            {row.map((cell) => (
                              <td key={cell} className="px-2 py-2 align-top text-fg/90">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-2 sm:hidden">
                    {block.rows.map((row) => (
                      <div key={row.join()} className="rounded-2xl bg-white/4 px-3 py-3">
                        <p className="text-sm font-semibold text-fg">{row[0]}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{block.headers[1]}: {row[1]}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{block.headers[2]}: {row[2]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" className="btn-prime mt-6" onClick={mark}>
            {done.includes(lesson.id) ? t("learn.done") : t("learn.next")}
          </button>
        </article>
      </div>

      <section className="panel rise rise-4 p-5">
        <h2 className="text-2xl font-bold tracking-tight text-fg">{t("learn.quiz")}</h2>
        <p className="mt-2 text-sm text-muted">
          {answered === 0 ? t("learn.quizEmpty") : t("learn.correct", { score, total: quiz.length })}
        </p>
        <ol className="mt-5 space-y-5">
          {quiz.map((item, index) => {
            const choice = picked[index];
            return (
              <li key={item.q}>
                <p className="text-base font-semibold text-fg">{index + 1}. {item.q}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {item.options.map((option, optionIndex) => {
                    const selected = choice === optionIndex;
                    const show = choice !== undefined;
                    const good = show && optionIndex === item.answer;
                    const bad = show && selected && optionIndex !== item.answer;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={show}
                        onClick={() => setPicked((prev) => ({ ...prev, [index]: optionIndex }))}
                        className={`rounded-2xl px-3 py-3 text-left text-sm ${
                          good ? "bg-win/15 text-win" : bad ? "bg-loss/15 text-loss" : "bg-white/4 text-fg hover:bg-white/8"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {choice !== undefined ? <p className="mt-2 text-sm leading-relaxed text-muted">{item.why}</p> : null}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
