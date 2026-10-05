import { o as __toESM } from "../_runtime.mjs";
import { _ as require_react, g as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as useLanguage } from "./router-D9YrstdH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn-CuifyG2Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var lessons = [
	{
		id: "signal",
		title: "Как получить сигнал",
		minutes: 4,
		lead: "Сигнал не приходит сам. Сначала пара и срок, потом кнопка.",
		blocks: [
			{
				type: "h",
				text: "Порядок на главном экране"
			},
			{
				type: "list",
				items: [
					"Нажмите строку пары. Откроется выбор, не весь экран.",
					"Сигналы формируются только по валютным парам.",
					"OTC отмечен в имени пары.",
					"Метка OTC показывает внебиржевую котировку. При копировании берётся только основное имя пары.",
					"Срок: 1, 3, 5 или 15 минут. Он выбирается до сигнала.",
					"Кнопка «Получить сигнал» запускает разбор."
				]
			},
			{
				type: "h",
				text: "Пока идёт поиск"
			},
			{
				type: "p",
				text: "Появляется окно анализа: свечи двигаются в круге. В это время бот забирает котировку и историю выбранной пары на выбранный срок. Пока круг крутится, сделку у брокера открывать рано: карточки ещё нет."
			},
			{
				type: "note",
				text: "Бот сам в сделку не входит. Он показывает сторону, цену и таймер. Кнопку у брокера нажимаете вы."
			}
		]
	},
	{
		id: "card",
		title: "Карточка сигнала",
		minutes: 4,
		lead: "После анализа открывается отдельная страница, не всплывашка поверх списка.",
		blocks: [
			{
				type: "list",
				items: [
					"Имя пары крупно. OTC вынесен меткой.",
					"«Копировать» кладёт в буфер основное имя пары без метки OTC.",
					"Справа бейдж «Вход» или номер перекрытия, например 1/3.",
					"Крупно направление: вверх или вниз.",
					"График свечей, по которым выбрана сторона.",
					"Ниже строки разбора: RSI, средняя, диапазон, свечи, наклон.",
					"Цена входа и выплата.",
					"Цена сейчас и таймер до конца срока."
				]
			},
			{
				type: "h",
				text: "Что сверять у брокера"
			},
			{
				type: "p",
				text: "Пара на графике брокера должна совпасть со скопированным именем. Срок — тот, что выбран до кнопки. Цена входа на карточке — ориентир. Если у брокера цена уже заметно ушла, сигнал опоздал, лучше пропустить, чем догонять."
			}
		]
	},
	{
		id: "chart",
		title: "График и строки разбора",
		minutes: 5,
		lead: "График на карточке — те свечи, по которым бот выбрал сторону. Это не украшение.",
		blocks: [
			{
				type: "p",
				text: "Зелёная свеча закрылась выше открытия, красная — ниже. Пунктир — цена входа. Точка справа — цена сейчас, пока идёт таймер. Если точка выше пунктира, цена ушла вверх от входа. Если ниже — вниз."
			},
			{
				type: "h",
				text: "Что значит каждая строка"
			},
			{
				type: "list",
				items: [
					"RSI 14. Выше 70 — перекуплен, ниже 30 — перепродан. Между ними бот смотрит, есть ли импульс без крайности.",
					"SMA 12. Цена выше или ниже средней за 12 свечей и на сколько процентов.",
					"Диапазон. Цена в верхней, средней или нижней трети окна.",
					"Свечи. Сколько из последних пяти бычьи и сколько медвежьи.",
					"Наклон. Восходящий, нисходящий или плоский, и совпадает ли он со свечами.",
					"Последняя строка. Срок и сторона, которую бот считает сильнее."
				]
			},
			{
				type: "note",
				text: "Если свечи спорят с наклоном, сторона слабее. На глубоких уровнях такой вход режется. На базовом он всё равно может быть показан, но строка об этом напишет."
			}
		]
	},
	{
		id: "timer",
		title: "Таймер, победа, ничья",
		minutes: 4,
		lead: "Когда таймер доходит до нуля, бот сравнивает цену входа и цену закрытия.",
		blocks: [
			{
				type: "rows",
				headers: [
					"Исход",
					"Условие",
					"Что делает бот"
				],
				rows: [
					[
						"Победа",
						"Вверх и цена выросла, или вниз и цена упала",
						"Анимация победы"
					],
					[
						"Ничья",
						"Цена закрытия равна цене входа",
						"Возврат, перекрытия нет"
					],
					[
						"Проигрыш",
						"Цена ушла против стороны",
						"10 секунд и новый сигнал той же пары"
					]
				]
			},
			{
				type: "p",
				text: "Сравнение идёт по тем знакам, которые вы видите. Было 820 и осталось 820 — это ничья, даже если внутри котировки дрожали. Ничья не победа и не повод перекрывать: ставка у брокера в таком случае обычно возвращается."
			},
			{
				type: "h",
				text: "Перекрытие"
			},
			{
				type: "list",
				items: [
					"Только после проигрыша, не после ничьей и не после победы.",
					"Та же пара и тот же срок.",
					"10 секунд на подготовку, затем бот сам ищет новый сигнал.",
					"Максимум 3 перекрытия. После третьего проигрыша четвёртого сигнала нет.",
					"На карточке это бейдж 1/3, 2/3, 3/3."
				]
			}
		]
	},
	{
		id: "pairs",
		title: "Пары",
		minutes: 3,
		lead: "Бот автоматически проверяет доступные валютные пары. Список зависит от наличия котировок.",
		blocks: [{
			type: "list",
			items: [
				"Валютные пары — например, EUR/USD и GBP/JPY.",
				"Криптовалюты, акции и сырьевые товары в сигналы не входят.",
				"OTC в конце имени обязательно. Без него это уже другая пара у брокера."
			]
		}, {
			type: "p",
			text: "Процент справа — выплата. Она плавает. Перед входом смотрите число на карточке, не то, что было утром. Кнопка «Копировать» кладёт в буфер основное имя пары без OTC."
		}]
	},
	{
		id: "expiry",
		title: "Срок",
		minutes: 4,
		lead: "1, 3, 5 и 15 минут — разные сделки. Срок выбирается до кнопки и на перекрытии не меняется.",
		blocks: [{
			type: "rows",
			headers: [
				"Срок",
				"Характер",
				"Ошибка"
			],
			rows: [
				[
					"1 мин",
					"Много шума, мало времени",
					"Клик в последнюю секунду"
				],
				[
					"3 мин",
					"Середина между шумом и ожиданием",
					"Сменить срок после входа"
				],
				[
					"5 мин",
					"Спокойнее, ошибка держится дольше",
					"Ставить как на минутке, только больше"
				],
				[
					"15 мин",
					"Старше и медленнее",
					"Ждать разворот, которого в окне нет"
				]
			]
		}, {
			type: "p",
			text: "Продлить уже открытый контракт нельзя. Если через 15 секунд кажется, что лучше было на 5 минут, это новая ставка. Перекрытие бот даёт на тот же срок, который вы выбрали в начале."
		}]
	},
	{
		id: "levels",
		title: "Уровни депозита",
		minutes: 4,
		lead: "Искра, Вектор и Апекс — глубина разбора, не другой список пар.",
		blocks: [
			{
				type: "rows",
				headers: [
					"Уровень",
					"Депозит",
					"Разбор"
				],
				rows: [
					[
						"Искра",
						"$60",
						"Один срок, короткая карточка, одно перекрытие"
					],
					[
						"Вектор",
						"$200",
						"Два срока, фильтр слабого входа, два перекрытия"
					],
					[
						"Апекс",
						"$500",
						"Структура, пропуск слабого сценария, три перекрытия"
					]
				]
			},
			{
				type: "p",
				text: "Проверка депозита по партнёрке ещё не включена, поэтому уровень пока не назначается сам. Карточка, которую вы видите сейчас, уже пишет RSI, среднюю, диапазон, свечи и наклон. Когда проверка заработает, глубина текста и жёсткость фильтра будут зависеть от уровня. Полный список отличий лежит в профиле."
			},
			{
				type: "note",
				text: "Большой депозит не делает сторону верной. Он только разрешает более длинный разбор и более строгий отказ от слабого входа."
			}
		]
	},
	{
		id: "risk",
		title: "Калькулятор и выплата",
		minutes: 5,
		lead: "Калькулятор на главной показывает потолок ставки. Таблица удвоения — предупреждение, не режим бота.",
		blocks: [
			{
				type: "p",
				text: "1% от баланса на вход оставляет запас. 2% — обычный потолок короткой сессии. 5% значит, что несколько поражений подряд снимают заметную часть счёта ещё до перекрытий. Перекрытия бота ограничены тремя и не заменяют эту таблицу: сумма у брокера всё равно ваша."
			},
			{
				type: "h",
				text: "Порог выплаты"
			},
			{
				type: "p",
				text: "Доля побед, после которой сессия не в минусе, равна 1 / (1 + выплата). Для 92% это около 52%. Для 80% — около 56%. Пять побед и пять поражений при 92% и ставке $10 дают примерно минус $4. Ничья в этот счёт не входит: деньги вернулись."
			},
			{
				type: "note",
				text: "Смотрите выплату на карточке перед кликом у брокера. Если процент упал, порог уже другой."
			}
		]
	},
	{
		id: "mistakes",
		title: "Ошибки с этим ботом",
		minutes: 4,
		lead: "Большая часть минуса — не «плохая свеча», а действие после карточки.",
		blocks: [{
			type: "list",
			items: [
				"Открыть другую пару, потому что график брокера уже был на ней.",
				"Скопировать имя без OTC и найти не ту бумагу.",
				"Войти, когда таймер почти умер.",
				"Считать ничью 820 → 820 проигрышем и ждать перекрытие. Его не будет.",
				"После трёх перекрытий искать четвёртое. Бот останавливается.",
				"Менять срок на перекрытии. Срок остаётся исходным.",
				"Поднимать сумму, потому что «должно отбить». Калькулятор как раз показывает, как быстро это съедает депозит.",
				"Ждать, что бот нажмёт кнопку у брокера. Не нажмёт."
			]
		}, {
			type: "note",
			text: "Фраза «последняя, и всё» значит, что сессия уже кончилась. Закройте карточку до этой сделки, не после."
		}]
	}
];
var quiz = [
	{
		q: "Цена входа 820, цена закрытия 820. Что это?",
		options: [
			"Победа",
			"Проигрыш и перекрытие",
			"Ничья и возврат, без перекрытия",
			"Новый сигнал на другую пару"
		],
		answer: 2,
		why: "Цена не изменилась. Бот считает это ничьей: возврат, перекрытие не запускается."
	},
	{
		q: "Сколько перекрытий бот даёт максимум?",
		options: [
			"Сколько угодно, пока не будет плюс",
			"Одно",
			"Три, затем стоп",
			"Пять"
		],
		answer: 2,
		why: "После проигрыша та же пара, до трёх раз. После третьего проигрыша нового сигнала нет."
	},
	{
		q: "Что копирует кнопка у названия пары?",
		options: [
			"Только тикер без OTC",
			"Полное имя, включая OTC",
			"Цену входа",
			"Направление"
		],
		answer: 1,
		why: "У брокера имя должно совпасть целиком. OTC в конце — часть названия."
	},
	{
		q: "Когда бот начинает перекрытие?",
		options: [
			"После победы",
			"После ничьей",
			"После проигрыша, через 10 секунд",
			"Сразу, как открылась карточка"
		],
		answer: 2,
		why: "Только проигрыш. Сначала 10 секунд на подготовку, потом новый разбор той же пары и того же срока."
	},
	{
		q: "Чем Апекс отличается от Искры?",
		options: [
			"Другим списком пар",
			"Глубиной разбора и числом перекрытий",
			"Тем, что бот сам входит в сделку",
			"Отключенным таймером"
		],
		answer: 1,
		why: "Пары те же. На Апексе жёстче фильтр, длиннее текст и до трёх перекрытий. На Искре разбор короче и перекрытие одно."
	},
	{
		q: "Выплата на карточке 80%. Какая доля побед нужна, чтобы не быть в минусе?",
		options: [
			"Ровно 50%",
			"Около 56%",
			"Около 80%",
			"Любая выше 40%"
		],
		answer: 1,
		why: "Порог = 1 / (1 + 0,80) ≈ 55,6%. Пятьдесят на пятьдесят при такой выплате убыточны. Ничьи в этот счёт не входят."
	}
];
var DONE_KEY = "vprime_learn_done";
function readDone() {
	try {
		const raw = JSON.parse(localStorage.getItem(DONE_KEY) || "[]");
		return Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
	} catch {
		return [];
	}
}
function LearnPage() {
	const { t } = useLanguage();
	const [current, setCurrent] = (0, import_react.useState)(lessons[0].id);
	const [done, setDone] = (0, import_react.useState)([]);
	const [picked, setPicked] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		setDone(readDone());
	}, []);
	const lesson = lessons.find((item) => item.id === current) ?? lessons[0];
	const score = quiz.filter((item, index) => picked[index] === item.answer).length;
	const answered = Object.keys(picked).length;
	const mark = () => {
		const next = done.includes(lesson.id) ? done : [...done, lesson.id];
		setDone(next);
		localStorage.setItem(DONE_KEY, JSON.stringify(next));
		const following = lessons[lessons.findIndex((item) => item.id === lesson.id) + 1];
		if (following) setCurrent(following.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "rise",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tracking-[0.16em] text-blue-soft uppercase",
						children: t("learn.kicker")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl",
						children: t("learn.title")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-base leading-relaxed text-muted",
						children: t("learn.intro", {
							done: done.length,
							total: lessons.length
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-start gap-4 lg:grid-cols-[16rem_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "rise rise-2 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible",
					children: lessons.map((item, index) => {
						const on = item.id === lesson.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setCurrent(item.id),
							className: `min-h-11 shrink-0 rounded-2xl px-3 py-2 text-left lg:w-full ${on ? "bg-blue/10 text-blue-soft" : "text-muted hover:bg-white/4"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-sm font-semibold",
								children: [
									index + 1,
									". ",
									item.title
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-0.5 block text-xs text-dim",
								children: [t("learn.minutes", { minutes: item.minutes }), done.includes(item.id) ? t("learn.read") : ""]
							})]
						}, item.id);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "panel rise rise-3 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-wide text-dim uppercase",
							children: t("learn.minutes", { minutes: lesson.minutes })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-2xl font-bold tracking-tight text-fg",
							children: lesson.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-base leading-relaxed text-muted",
							children: lesson.lead
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 space-y-4",
							children: lesson.blocks.map((block, index) => {
								if (block.type === "h") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "pt-2 text-lg font-semibold text-fg",
									children: block.text
								}, index);
								if (block.type === "p") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-base leading-relaxed text-fg/90",
									children: block.text
								}, index);
								if (block.type === "note") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-2xl bg-blue/10 px-4 py-3 text-sm leading-relaxed text-muted",
									children: block.text
								}, index);
								if (block.type === "list") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-2",
									children: block.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex gap-3 text-sm leading-relaxed text-fg/90",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1.5 shrink-0 rounded-full bg-blue-soft" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item })]
									}, item))
								}, index);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hidden overflow-x-auto sm:block",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-left text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
											className: "text-xs tracking-wide text-dim uppercase",
											children: block.headers.map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-2 font-semibold",
												children: header
											}, header))
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: block.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
											className: "border-t border-white/6",
											children: row.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-2 align-top text-fg/90",
												children: cell
											}, cell))
										}, row.join())) })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2 sm:hidden",
									children: block.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-2xl bg-white/4 px-3 py-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-semibold text-fg",
												children: row[0]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-sm leading-relaxed text-muted",
												children: [
													block.headers[1],
													": ",
													row[1]
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-sm leading-relaxed text-muted",
												children: [
													block.headers[2],
													": ",
													row[2]
												]
											})
										]
									}, row.join()))
								})] }, index);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-prime mt-6",
							onClick: mark,
							children: done.includes(lesson.id) ? t("learn.done") : t("learn.next")
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel rise rise-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-bold tracking-tight text-fg",
						children: t("learn.quiz")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: answered === 0 ? t("learn.quizEmpty") : t("learn.correct", {
							score,
							total: quiz.length
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-5 space-y-5",
						children: quiz.map((item, index) => {
							const choice = picked[index];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-base font-semibold text-fg",
									children: [
										index + 1,
										". ",
										item.q
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid gap-2 sm:grid-cols-2",
									children: item.options.map((option, optionIndex) => {
										const selected = choice === optionIndex;
										const show = choice !== void 0;
										const good = show && optionIndex === item.answer;
										const bad = show && selected && optionIndex !== item.answer;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: show,
											onClick: () => setPicked((prev) => ({
												...prev,
												[index]: optionIndex
											})),
											className: `rounded-2xl px-3 py-3 text-left text-sm ${good ? "bg-win/15 text-win" : bad ? "bg-loss/15 text-loss" : "bg-white/4 text-fg hover:bg-white/8"}`,
											children: option
										}, option);
									})
								}),
								choice !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-muted",
									children: item.why
								}) : null
							] }, item.q);
						})
					})
				]
			})
		]
	});
}
//#endregion
export { LearnPage as component };
