import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "ru" | "uk" | "en";

const copy = {
  "language.label": ["Язык", "Мова", "Language"],
  "language.ru": ["Русский", "Російська", "Russian"],
  "language.uk": ["Українська", "Українська", "Ukrainian"],
  "language.en": ["English", "English", "English"],
  "nav.signals": ["Сигналы", "Сигнали", "Signals"],
  "nav.history": ["История", "Історія", "History"],
  "nav.learn": ["Обучение", "Навчання", "Learn"],
  "nav.profile": ["Профиль", "Профіль", "Profile"],
  "nav.admin": ["Админ", "Адмін", "Admin"],
  "nav.noLevel": ["Без уровня", "Без рівня", "No level"],
  "home.eyebrow": ["ТОЛЬКО ВАЛЮТНЫЕ ПАРЫ", "ТІЛЬКИ ВАЛЮТНІ ПАРИ", "CURRENCY PAIRS ONLY"],
  "home.title": ["Сигналы для валютного рынка", "Сигнали для валютного ринку", "Signals for currency markets"],
  "home.body": [
    "PRIME BOT анализирует доступные валютные пары Pocket Option, показывает направление, цену входа и время экспирации. Сделки автоматически не открываются.",
    "PRIME BOT аналізує доступні валютні пари Pocket Option, показує напрямок, ціну входу та час експірації. Угоди автоматично не відкриваються.",
    "PRIME BOT analyzes available Pocket Option currency pairs and shows direction, entry price, and expiry. It never places trades automatically.",
  ],
  "home.feature1.title": ["ИИ-анализ свечей", "ШІ-аналіз свічок", "AI candle analysis"],
  "home.feature1.body": [
    "Выбирает направление по истории свечей Pocket Option, полученной через WebSocket.",
    "Обирає напрямок за історією свічок Pocket Option, отриманою через WebSocket.",
    "Chooses a direction from Pocket Option candle history received over WebSocket.",
  ],
  "home.feature2.title": ["Только валюты", "Лише валюти", "Currency pairs only"],
  "home.feature2.body": [
    "В выборе сигналов остаются только валютные пары, включая OTC.",
    "У виборі сигналів залишаються лише валютні пари, зокрема OTC.",
    "Signal selection includes currency pairs only, including OTC.",
  ],
  "home.feature3.title": ["Фактическая статистика", "Фактична статистика", "Recorded results"],
  "home.feature3.body": [
    "Результаты закрытых сигналов можно проверить в истории.",
    "Результати закритих сигналів можна перевірити в історії.",
    "Check completed signal outcomes in your history.",
  ],
  "home.rateCaption": [
    "Проходимость по завершённым валютным сигналам",
    "Прохідність за завершеними валютними сигналами",
    "Hit rate on completed currency signals",
  ],
  "home.disclaimer": [
    "Расчёт по сохранённым результатам в этом браузере. Прошлые результаты не гарантируют будущих.",
    "Розрахунок за збереженими результатами в цьому браузері. Минулі результати не гарантують майбутніх.",
    "Calculated from results saved in this browser. Past results do not guarantee future outcomes.",
  ],
  "stats.settled": ["Завершено", "Завершено", "Completed"],
  "stats.wins": ["Побед", "Перемог", "Wins"],
  "stats.losses": ["Поражений", "Поразок", "Losses"],
  "stats.rate": ["Проходимость", "Прохідність", "Hit rate"],
  "signal.connected": ["Поток Pocket Option подключён", "Потік Pocket Option підключено", "Pocket Option feed connected"],
  "signal.disconnected": ["Нет подключения к Pocket Option", "Немає підключення до Pocket Option", "Pocket Option is disconnected"],
  "signal.connecting": ["Подключаемся к Pocket Option…", "Підключаємося до Pocket Option…", "Connecting to Pocket Option…"],
  "signal.description": [
    "Проверяются только валютные пары с выплатой 92% и 80%. Выберите экспирацию от 1 минуты до 4 часов; ИИ напрямую анализирует свечи и выбирает направление.",
    "Перевіряються лише валютні пари з виплатою 92% і 80%. Оберіть експірацію від 1 хвилини до 4 годин; ШІ безпосередньо аналізує свічки та обирає напрямок.",
    "Only currency pairs with 92% or 80% payout are checked. Choose an expiry from 1 minute to 4 hours; AI directly analyzes the candles and selects a direction.",
  ],
  "signal.experimental": [
    "Самооценка уверенности ИИ субъективна: это не измеренная вероятность и не историческая проходимость. Результат не гарантирован.",
    "Самооцінка впевненості ШІ суб’єктивна: це не виміряна ймовірність і не історична прохідність. Результат не гарантовано.",
    "AI confidence is subjective, not a measured probability or historical hit rate. Outcomes are not guaranteed.",
  ],
  "signal.expiry": ["Время экспирации", "Час експірації", "Expiry time"],
  "signal.analyzed": [
    "Интервал свечи {period}; прямой анализ ИИ использует до 128 последних свечей.",
    "Інтервал свічки {period}; прямий аналіз ШІ використовує до 128 останніх свічок.",
    "Candle interval {period}; direct AI analysis uses up to the latest 128 candles.",
  ],
  "signal.checking": ["Проверяем пары…", "Перевіряємо пари…", "Checking pairs…"],
  "signal.searchFailed": ["Не удалось завершить поиск", "Не вдалося завершити пошук", "Signal search could not be completed"],
  "signal.tryAgain": ["Искать ещё раз", "Шукати ще раз", "Search again"],
  "signal.noSignalAtExpiry": [
    "На экспирации {expiry} ИИ не нашёл достаточно ясного сигнала. Направление не выдумываем.",
    "На експірації {expiry} ШІ не знайшов достатньо чіткого сигналу. Напрямок не вигадуємо.",
    "The AI found no clear signal for the {expiry} expiry. No direction was guessed.",
  ],
  "signal.reason": ["Почему сигнал не выдан", "Чому сигнал не надано", "Why no signal was issued"],
  "signal.alternativeSearchKicker": [
    "БЛИЖАЙШИЕ ЭКСПИРАЦИИ",
    "НАЙБЛИЖЧІ ЕКСПІРАЦІЇ",
    "NEARBY EXPIRIES",
  ],
  "signal.alternativesChecking": [
    "Проверяем другие экспирации",
    "Перевіряємо інші експірації",
    "Checking other expiries",
  ],
  "signal.alternativesCheckingBody": [
    "Проверяем ближайшие сроки. Покажем только варианты, где ИИ действительно выбрал пару и направление.",
    "Перевіряємо найближчі строки. Покажемо лише варіанти, де ШІ справді обрав пару та напрямок.",
    "Checking nearby durations. Only options where the AI actually selected a pair and direction will be shown.",
  ],
  "signal.alternativesFound": [
    "Сигнал найден на другой экспирации",
    "Сигнал знайдено на іншій експірації",
    "A signal was found at another expiry",
  ],
  "signal.alternativesFoundBody": [
    "Выберите срок, чтобы показать пару. Перед выдачей направления ИИ проверит её ещё раз.",
    "Оберіть строк, щоб показати пару. Перед видачею напрямку ШІ перевірить її ще раз.",
    "Choose an expiry to reveal the pair. The AI will check it again before issuing a direction.",
  ],
  "signal.alternativePayout": ["Выплата {payout}%", "Виплата {payout}%", "{payout}% payout"],
  "signal.alternativeChoose": [
    "Выбрать срок и показать пару",
    "Обрати строк і показати пару",
    "Choose expiry and reveal pair",
  ],
  "signal.alternativesNone": [
    "На проверенных сроках ясных сигналов тоже нет. Выберите другую экспирацию и запустите новый поиск.",
    "На перевірених строках чітких сигналів також немає. Оберіть іншу експірацію та запустіть новий пошук.",
    "No clear signals were found at the checked expiries either. Choose another expiry and search again.",
  ],
  "signal.alternativesPartial": [
    "Не все другие экспирации удалось проверить: {error}",
    "Не всі інші експірації вдалося перевірити: {error}",
    "Some alternative expiries could not be checked: {error}",
  ],
  "signal.get": ["Получить сигнал", "Отримати сигнал", "Get a signal"],
  "signal.noLimit": ["Без лимита", "Без ліміту", "No limit"],
  "signal.pairReady": ["Пара выбрана", "Пару вибрано", "Pair selected"],
  "signal.pairChosen": ["Валютная пара выбрана", "Валютну пару вибрано", "Currency pair selected"],
  "signal.choosePair": [
    "Выберите эту пару у брокера. Направление появится после отсчёта.",
    "Оберіть цю пару у брокера. Напрямок з’явиться після відліку.",
    "Select this pair at your broker. The direction appears when the countdown ends.",
  ],
  "signal.countdownRemaining": ["Осталось {seconds} секунд", "Залишилося {seconds} секунд", "{seconds} seconds remaining"],
  "signal.countdownUnit": ["до сигнала", "до сигналу", "until the signal"],
  "signal.finalizing": ["Проверяем вход…", "Перевіряємо вхід…", "Checking the entry…"],
  "signal.analysisTimeout": [
    "Поиск сигнала не завершился за 7 секунд. Попробуйте ещё раз; сигнал не выдан.",
    "Пошук сигналу не завершився за 7 секунд. Спробуйте ще раз; сигнал не видано.",
    "Signal search did not finish within 7 seconds. Try again; no signal was issued.",
  ],
  "signal.pairNoLongerReady": [
    "При повторном анализе ИИ не подтвердил направление по этой паре. Получите новый сигнал.",
    "Під час повторного аналізу ШІ не підтвердив напрямок для цієї пари. Запросіть новий сигнал.",
    "The AI did not confirm a direction for this pair on reanalysis. Request a new signal.",
  ],
  "ai.title": ["ИИ выбрал направление", "ШІ обрав напрямок", "AI-selected direction"],
  "ai.explanation": [
    "Уверенность — самооценка ИИ, не измеренная вероятность выигрыша и не историческая статистика. Проходимость считается только по завершённым сигналам, сверенным с ценой Pocket Option.",
    "Впевненість — самооцінка ШІ, не виміряна ймовірність виграшу та не історична статистика. Прохідність обчислюється лише за завершеними сигналами, звіреними з ціною Pocket Option.",
    "Confidence is AI self-assessment, not a measured win probability or historical statistic. Hit rate uses only completed signals checked against Pocket Option prices.",
  ],
  "signal.today": ["Сегодня {used} из {cap}", "Сьогодні {used} із {cap}", "Today {used} of {cap}"],
  "signal.block.deposit": ["Депозит ещё не прочитан", "Депозит ще не зчитано", "Deposit has not been read yet"],
  "signal.block.minimum": ["Для сигналов нужен депозит от $60", "Для сигналів потрібен депозит від $60", "Signals require a deposit of at least $60"],
  "signal.block.limit": ["Лимит сигналов на сегодня закончился", "Ліміт сигналів на сьогодні вичерпано", "Today's signal limit has been reached"],
  "signal.none": ["Сейчас нет подходящего входа. Дождитесь следующей проверки.", "Зараз немає відповідного входу. Дочекайтеся наступної перевірки.", "No suitable entry right now. Wait for the next check."],
  "history.kicker": ["Журнал", "Журнал", "Journal"],
  "history.title": ["История сигналов", "Історія сигналів", "Signal history"],
  "history.description": [
    "Фактические исходы, сверенные с котировками Pocket Option. Старые сигналы без цены закрытия отмечаются как непроверенные.",
    "Фактичні результати, звірені з котируваннями Pocket Option. Старі сигнали без ціни закриття позначаються як неперевірені.",
    "Actual outcomes checked against Pocket Option quotes. Older signals without a recorded closing price are marked unverified.",
  ],
  "history.export": ["Экспорт CSV", "Експорт CSV", "Export CSV"],
  "history.breakEven": ["Порог безубыточности", "Поріг беззбитковості", "Break-even rate"],
  "history.breakEvenHelp": ["Расчёт по выплате записанных входов", "Розрахунок за виплатою записаних входів", "Based on recorded signal payouts"],
  "history.net": ["Условный итог", "Умовний підсумок", "Illustrative total"],
  "history.netHelp": ["Каждая запись считается ставкой 1 ед.", "Кожен запис рахується як ставка 1 од.", "Each entry is treated as a 1-unit stake"],
  "history.disclaimer": [
    "Это локальный журнал фактических исходов, не прогноз. Направление выбирает экспериментальная модель по свечам WebSocket и временной проверке; прошлые данные не гарантируют будущих результатов. Условный итог не учитывает суммы ставок, комиссии или перекрытия.",
    "Це локальний журнал фактичних результатів, а не прогноз. Напрямок обирає експериментальна модель за свічками WebSocket і часовою перевіркою; минулі дані не гарантують майбутніх результатів. Умовний підсумок не враховує суми ставок, комісії чи перекриття.",
    "This is a local record of actual outcomes, not a forecast. An experimental model chooses direction from WebSocket candles and time-based validation; past data does not guarantee future results. Illustrative totals exclude stake sizes, fees, and recovery trades.",
  ],
  "history.byPair": ["Разбивка по паре и сроку", "Розподіл за парою та строком", "By pair and expiry"],
  "history.draws": ["Ничьи не входят в проходимость", "Нічиї не входять до прохідності", "Draws are excluded from hit rate"],
  "history.hitRate": ["Проходимость", "Прохідність", "Hit rate"],
  "history.decided": ["решающих", "вирішальних", "decided"],
  "history.latest": ["Последние сигналы", "Останні сигнали", "Recent signals"],
  "history.lastOf": ["Последние {shown} из {total}", "Останні {shown} із {total}", "Latest {shown} of {total}"],
  "history.records": ["{total} записей", "{total} записів", "{total} records"],
  "history.loading": ["Загружаем журнал…", "Завантажуємо журнал…", "Loading history…"],
  "history.empty": ["Записей пока нет", "Записів поки немає", "No records yet"],
  "history.reading": ["Читаем сохранённые в этом браузере исходы.", "Читаємо збережені в цьому браузері результати.", "Reading outcomes saved in this browser."],
  "history.emptyHelp": [
    "Запись появится, когда сигнал завершится по котировке. Непроверенные сигналы не учитываются в проходимости.",
    "Запис з’явиться, коли сигнал завершиться за котируванням. Неперевірені сигнали не враховуються у прохідності.",
    "A result is recorded when a signal is settled against a quote. Unverified signals are excluded from the hit rate.",
  ],
  "history.goSignals": ["Перейти к сигналам", "До сигналів", "Go to signals"],
  "history.direction": ["Направление", "Напрямок", "Direction"],
  "history.up": ["Вверх", "Вгору", "Up"],
  "history.down": ["Вниз", "Вниз", "Down"],
  "history.price": ["Цена", "Ціна", "Price"],
  "history.payout": ["Выплата", "Виплата", "Payout"],
  "history.step": ["Попытка", "Спроба", "Attempt"],
  "history.attemptCount": ["{current} из {total}", "{current} із {total}", "{current} of {total}"],
  "history.units": ["ед.", "од.", "units"],
  "history.expiry": ["экспирация", "експірація", "expiry"],
  "history.candles": ["свечи", "свічки", "candles"],
  "outcome.pending": ["В ожидании", "Очікується", "Pending"],
  "outcome.unverified": ["Не проверен", "Не перевірено", "Unverified"],
  "outcome.win": ["Победа", "Перемога", "Win"],
  "outcome.loss": ["Поражение", "Поразка", "Loss"],
  "outcome.draw": ["Ничья", "Нічия", "Draw"],
  "calculator.title": ["Калькулятор риска", "Калькулятор ризику", "Risk calculator"],
  "calculator.subtitle": ["Сумма входа и план удвоения", "Сума входу та план подвоєння", "Stake size and doubling plan"],
  "calculator.balance": ["Баланс, $", "Баланс, $", "Balance, $"],
  "calculator.risk": ["Риск на сделку", "Ризик на угоду", "Risk per trade"],
  "calculator.recommended": ["Рекомендуемая сумма", "Рекомендована сума", "Suggested amount"],
  "calculator.save": ["Сохранить сумму", "Зберегти суму", "Save amount"],
  "calculator.saved": ["Сумма сохранена", "Суму збережено", "Amount saved"],
  "calculator.enterBalance": ["Введите баланс, чтобы посчитать вход.", "Введіть баланс, щоб розрахувати суму входу.", "Enter a balance to calculate a stake."],
  "calculator.plan": ["План удвоения", "План подвоєння", "Doubling plan"],
  "calculator.warning": [
    "Удвоение может перекрыть минус, но быстро съедает депозит. Дальше третьего шага лучше не идти.",
    "Подвоєння може перекрити мінус, але швидко зменшує депозит. Краще не йти далі третього кроку.",
    "Doubling may recover a loss but can quickly consume your deposit. Avoid going beyond the third step.",
  ],
  "common.back": ["Назад", "Назад", "Back"],
  "common.copied": ["Скопировано", "Скопійовано", "Copied"],
  "common.copy": ["Копировать", "Копіювати", "Copy"],
  "common.noSignal": ["Сигнала нет.", "Сигналу немає.", "No signal."],
  "common.categoryFx": ["Валюта", "Валюта", "Currency"],
  "common.signalChart": ["График свечей", "Графік свічок", "Candlestick chart"],
  "common.entryPrice": ["Цена входа", "Ціна входу", "Entry price"],
  "common.quoteActive": ["Котировки Pocket Option активны", "Котирування Pocket Option активні", "Pocket Option quotes are live"],
  "common.quoteUnavailable": ["Поток котировок недоступен", "Потік котирувань недоступний", "Quote feed unavailable"],
  "common.quoteWaiting": ["Ожидание котировки Pocket Option", "Очікування котирування Pocket Option", "Waiting for Pocket Option quote"],
  "common.waitQuote": ["ждём котировку", "очікуємо котирування", "waiting for quote"],
  "common.noChange": ["без изменения", "без змін", "unchanged"],
  "common.fromEntry": ["от входа", "від входу", "from entry"],
  "common.win": ["Победа", "Перемога", "Win"],
  "common.priceRose": ["Цена выросла", "Ціна зросла", "Price rose"],
  "common.priceFell": ["Цена упала", "Ціна впала", "Price fell"],
  "common.draw": ["Ничья", "Нічия", "Draw"],
  "common.refund": ["Возврат", "Повернення", "Refund"],
  "common.priceUnchanged": ["Цена не изменилась. Результат: ничья.", "Ціна не змінилася. Результат: нічия.", "Price was unchanged; the result is a draw."],
  "common.loss": ["Проигрыш", "Поразка", "Loss"],
  "common.prepareRecovery": ["Подготовьтесь к перекрытию", "Підготуйтеся до перекриття", "Prepare for the recovery trade"],
  "common.samePairAttempts": ["Та же пара. Осталось попыток: {count}", "Та сама пара. Спроб залишилося: {count}", "Same pair. Attempts left: {count}"],
  "common.recoveryStop": [
    "Все три перекрытия использованы. Проверьте журнал перед следующим запросом.",
    "Усі три перекриття використано. Перевірте журнал перед наступним запитом.",
    "All three overlays have been used. Review the journal before requesting another signal.",
  ],
  "common.skipEntry": ["Вход пропущен", "Вхід пропущено", "Entry skipped"],
  "common.notConfirmed": ["Новый сигнал не подтверждён", "Новий сигнал не підтверджено", "New signal not confirmed"],
  "common.skipReason": [
    "Фильтр не подтвердил повторный вход по этой паре. Новый сигнал не выдан; предыдущий результат сохранён в журнале.",
    "Фільтр не підтвердив повторний вхід за цією парою. Новий сигнал не надано; попередній результат збережено в журналі.",
    "The filter did not confirm another entry for this pair. No new signal was issued; the previous result is saved in history.",
  ],
  "common.openHistory": ["Открыть историю", "Відкрити історію", "Open history"],
  "common.toSignals": ["К сигналам", "До сигналів", "Back to signals"],
  "common.copyError": ["Не удалось скопировать название.", "Не вдалося скопіювати назву.", "Could not copy the pair name."],
  "common.cancel": ["Отмена", "Скасувати", "Cancel"],
  "learn.kicker": ["Курс", "Курс", "Guide"],
  "learn.title": ["Обучение", "Навчання", "Learning"],
  "learn.intro": [
    "Как устроен PRIME BOT: пара, срок, карточка, таймер, ничья и перекрытие. Это не обещание дохода. Прочитано {done} из {total}.",
    "Як працює PRIME BOT: пара, строк, картка, таймер, нічия та перекриття. Це не обіцянка доходу. Прочитано {done} з {total}.",
    "How PRIME BOT works: pair, expiry, signal card, timer, draw, and recovery trades. This is not a promise of income. Read {done} of {total}.",
  ],
  "learn.minutes": ["{minutes} минут", "{minutes} хвилин", "{minutes} minutes"],
  "learn.read": [" · прочитано", " · прочитано", " · read"],
  "learn.done": ["Уже отмечено", "Вже позначено", "Completed"],
  "learn.next": ["Дальше", "Далі", "Next"],
  "learn.quiz": ["Проверка", "Перевірка", "Knowledge check"],
  "learn.quizEmpty": ["Шесть вопросов по темам выше.", "Шість запитань за темами вище.", "Six questions about the topics above."],
  "learn.correct": ["Верно {score} из {total}.", "Правильно {score} із {total}.", "{score} of {total} correct."],
  "profile.admin": ["Админ", "Адмін", "Admin"],
  "profile.title": ["Профиль", "Профіль", "Profile"],
  "profile.signOut": ["Выйти", "Вийти", "Sign out"],
  "profile.adminInfo": ["Админский ID. Лимита сигналов нет, депозит для входа не нужен.", "ID адміністратора. Ліміту сигналів немає, депозит для доступу не потрібен.", "Admin ID. No signal limit or minimum deposit is required."],
  "profile.userInfo": [
    "Уровень зависит от депозита. Искра от $60 — 5 сигналов в день, Вектор от $200 — 20, Апекс от $500 — без лимита.",
    "Рівень залежить від депозиту. Іскра від $60 — 5 сигналів на день, Вектор від $200 — 20, Апекс від $500 — без ліміту.",
    "Your level depends on your deposit. Spark from $60: 5 signals/day; Vector from $200: 20; Apex from $500: unlimited.",
  ],
  "modal.title": ["Готовим сигнал", "Готуємо сигнал", "Preparing signal"],
  "modal.step1": ["Смотрим валютные пары", "Перевіряємо валютні пари", "Checking currency pairs"],
  "modal.step2": ["Сверяем последние свечи", "Зіставляємо останні свічки", "Checking recent candles"],
  "modal.step3": ["Оставляем подтверждённый вход", "Залишаємо підтверджений вхід", "Keeping a confirmed entry"],
  "gate.brand": ["PRIME BOT", "PRIME BOT", "PRIME BOT"],
  "gate.intro": [
    "Проверка идентификатора. Регистрация не нужна — пароль не запрашиваем.",
    "Перевірка ідентифікатора. Реєстрація не потрібна — пароль не запитуємо.",
    "Verify your identifier. No registration or password is required.",
  ],
  "gate.id": ["Идентификатор Pocket Option", "Ідентифікатор Pocket Option", "Pocket Option identifier"],
  "gate.idHelp": [
    "Девять цифр из профиля. Это проверка ID, не создание аккаунта.",
    "Дев’ять цифр із профілю. Це перевірка ID, а не створення облікового запису.",
    "The nine-digit ID from your profile. This verifies your ID; it does not create an account.",
  ],
  "gate.error": [
    "Идентификатор должен состоять ровно из 9 цифр",
    "Ідентифікатор має містити рівно 9 цифр",
    "The identifier must contain exactly 9 digits",
  ],
  "gate.check": ["Проверить ID", "Перевірити ID", "Verify ID"],
  "gate.enterDigits": ["Введите 9 цифр", "Введіть 9 цифр", "Enter 9 digits"],
  "gate.privacy": [
    "ID остаётся только в этом браузере. На сервер он не отправляется.",
    "ID залишається лише в цьому браузері. На сервер його не надсилають.",
    "Your ID stays in this browser and is not sent to the server.",
  ],
  "gate.note1": ["Только 9 цифр из профиля Pocket Option", "Лише 9 цифр із профілю Pocket Option", "Only the 9-digit ID from your Pocket Option profile"],
  "gate.note2": ["Пароль от кабинета не нужен", "Пароль від кабінету не потрібен", "No account password needed"],
  "gate.note3": ["Сделки сами не открываются", "Угоди самі не відкриваються", "Trades are never placed automatically"],
  "gate.note4": ["Сумму считает калькулятор риска", "Суму рахує калькулятор ризику", "Use the risk calculator to size trades"],
} as const;

type MessageKey = keyof typeof copy;
type ContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<ContextValue | null>(null);
const STORAGE_KEY = "prime_bot_language";
const languageIndex: Record<Language, number> = { ru: 0, uk: 1, en: 2 };

function isLanguage(value: string | null): value is Language {
  return value === "ru" || value === "uk" || value === "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ru");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isLanguage(saved)) setLanguage(saved);
    } catch {
      // Keep Russian as the default if storage is unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // The selector remains usable for the current session without storage.
    }
  }, [language]);

  const value = useMemo<ContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, values) => {
        let result = copy[key][languageIndex[language]] as string;
        for (const [name, value] of Object.entries(values ?? {})) {
          result = result.replaceAll(`{${name}}`, String(value));
        }
        return result;
      },
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

export function formatExpiryForLanguage(seconds: number, language: Language) {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourUnit = language === "en" ? "h" : language === "uk" ? "год" : "ч";
  const minuteUnit = language === "en" ? "min" : language === "uk" ? "хв" : "мин";
  if (hours && minutes) return `${hours} ${hourUnit} ${minutes} ${minuteUnit}`;
  if (hours) return `${hours} ${hourUnit}`;
  return `${totalMinutes} ${minuteUnit}`;
}
