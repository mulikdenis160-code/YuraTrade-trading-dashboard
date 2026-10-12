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
    "Только подтверждённые результаты сигналов из истории этого браузера. Показатели обновляются после фиксации исхода; прошлые результаты не гарантируют будущих.",
    "Лише підтверджені результати сигналів з історії цього браузера. Показники оновлюються після фіксації результату; минулі результати не гарантують майбутніх.",
    "Only verified signal outcomes from this browser’s history. Statistics update when an outcome is recorded; past results do not guarantee future outcomes.",
  ],
  "stats.title": ["Реальная статистика", "Реальна статистика", "Recorded statistics"],
  "stats.settled": ["Завершено", "Завершено", "Completed"],
  "stats.wins": ["Побед", "Перемог", "Wins"],
  "stats.losses": ["Поражений", "Поразок", "Losses"],
  "stats.draws": ["Ничьих", "Нічиїх", "Draws"],
  "stats.rate": ["Проходимость", "Прохідність", "Hit rate"],
  "stats.source": [
    "Только подтверждённые исходы из истории этого браузера; срез обновляется раз в сутки. Ничьи не входят в проходимость.",
    "Лише підтверджені результати з історії цього браузера; показники оновлюються після запису результату. Нічиї не входять до прохідності.",
    "Verified outcomes from this browser’s history; statistics refresh after an outcome is recorded. Draws are excluded from hit rate.",
  ],
  "stats.asOf": ["Обновлено: {date}", "Оновлено: {date}", "Updated: {date}"],
  "stats.empty": [
    "Подтверждённых исходов пока нет. Показатели появятся после реальных сигналов.",
    "Підтверджених результатів поки немає. Показники з’являться після реальних сигналів.",
    "No verified outcomes yet. Statistics will appear after real signals are recorded.",
  ],
  "learn.trend.definition": [
    "Тренд — это общее направление движения цены.",
    "Тренд — це загальний напрямок руху ціни.",
    "A trend is the overall direction in which price is moving.",
  ],
  "learn.trend.imageAlt": [
    "Инфографика: восходящий тренд с более высокими вершинами и минимумами, нисходящий тренд с более низкими вершинами и минимумами и боковое движение в диапазоне.",
    "Інфографіка: висхідний тренд із вищими вершинами та мінімумами, низхідний тренд із нижчими вершинами та мінімумами й боковий рух у діапазоні.",
    "Infographic showing an uptrend with higher highs and lows, a downtrend with lower highs and lows, and sideways movement within a range.",
  ],
  "learn.trend.up": [
    "Восходящий тренд — цена в целом движется вверх, вершины и минимумы становятся выше.",
    "Висхідний тренд — ціна загалом рухається вгору, вершини й мінімуми стають вищими.",
    "An uptrend means price is generally moving higher, with higher highs and higher lows.",
  ],
  "learn.trend.down": [
    "Нисходящий тренд — цена в целом движется вниз, вершины и минимумы становятся ниже.",
    "Нисхідний тренд — ціна загалом рухається вниз, вершини й мінімуми стають нижчими.",
    "A downtrend means price is generally moving lower, with lower highs and lower lows.",
  ],
  "learn.trend.sideways": [
    "Боковой тренд (флэт) — цена колеблется в определённом диапазоне без выраженного направления.",
    "Боковий тренд (флет) — ціна коливається в певному діапазоні без вираженого напрямку.",
    "A sideways trend (range) means price moves within a defined range without a clear direction.",
  ],
  "learn.trend.caution": [
    "Тренд помогает понять общее направление движения цены, но не гарантирует результат сделки.",
    "Тренд допомагає зрозуміти загальний напрямок руху ціни, але не гарантує результат угоди.",
    "A trend helps identify the overall direction of price movement, but it does not guarantee a trade outcome.",
  ],
  "learn.open": ["Открыть материал", "Відкрити матеріал", "Open lesson"],
  "learn.collectionTitle": [
    "Тренды, уровни и паттерны",
    "Тренди, рівні та патерни",
    "Trends, levels, and patterns",
  ],
  "learn.collectionDescription": [
    "Три коротких материала: о трендах, уровнях поддержки и сопротивления и свечных паттернах.",
    "Три короткі матеріали: про тренди, рівні підтримки та опору й свічкові патерни.",
    "Three short lessons on trends, support and resistance levels, and candlestick patterns.",
  ],
  "learn.levels.title": [
    "Что такое уровни поддержки и сопротивления?",
    "Що таке рівні підтримки та опору?",
    "What are support and resistance levels?",
  ],
  "learn.levels.definition": [
    "Уровни поддержки и сопротивления — это важные зоны на графике, в которых цена может замедлить движение, остановиться или развернуться.",
    "Рівні підтримки та опору — це важливі зони на графіку, у яких ціна може сповільнити рух, зупинитися або розвернутися.",
    "Support and resistance are important chart zones where price may slow down, pause, or reverse.",
  ],
  "learn.levels.imageAlt": [
    "Инфографика об уровнях поддержки и сопротивления: отскоки цены, пробои и смена роли уровня.",
    "Інфографіка про рівні підтримки та опору: відскоки ціни, пробої та зміна ролі рівня.",
    "Infographic about support and resistance: price bounces, breakouts, and role reversal.",
  ],
  "learn.levels.supportTitle": ["1. Уровень поддержки", "1. Рівень підтримки", "1. Support level"],
  "learn.levels.support": [
    "Это зона, от которой цена ранее отскакивала вверх. Здесь может появляться повышенный интерес покупателей, поэтому цена иногда снова начинает расти.",
    "Це зона, від якої ціна раніше відскакувала вгору. Тут може зростати інтерес покупців, тому ціна іноді знову починає підніматися.",
    "A zone where price has previously bounced upward. Buyer interest may increase here, so price may start rising again.",
  ],
  "learn.levels.resistanceTitle": ["2. Уровень сопротивления", "2. Рівень опору", "2. Resistance level"],
  "learn.levels.resistance": [
    "Это зона, от которой цена ранее отскакивала вниз. Здесь может усиливаться давление продавцов, из-за чего цена иногда начинает снижаться.",
    "Це зона, від якої ціна раніше відскакувала вниз. Тут може посилюватися тиск продавців, через що ціна іноді починає знижуватися.",
    "A zone where price has previously bounced downward. Selling pressure may increase here, sometimes pushing price lower.",
  ],
  "learn.levels.breakoutTitle": ["3. Пробой уровня", "3. Пробій рівня", "3. Level breakout"],
  "learn.levels.breakout": [
    "Если цена проходит через поддержку или сопротивление, это может указывать на продолжение движения. После пробоя сопротивление иногда становится поддержкой, а поддержка — сопротивлением.",
    "Якщо ціна проходить крізь підтримку або опір, це може вказувати на продовження руху. Після пробою опір іноді стає підтримкою, а підтримка — опором.",
    "If price moves through support or resistance, it may signal continuation. After a breakout, resistance can sometimes become support, and support can become resistance.",
  ],
  "learn.levels.practiceTitle": ["Как использовать уровни на практике?", "Як використовувати рівні на практиці?", "How can you use levels?"],
  "learn.levels.step1": ["Определи текущий тренд.", "Визнач поточний тренд.", "Identify the current trend."],
  "learn.levels.step2": [
    "Найди зоны, от которых цена неоднократно отскакивала.",
    "Знайди зони, від яких ціна неодноразово відскакувала.",
    "Find zones where price has bounced repeatedly.",
  ],
  "learn.levels.step3": [
    "Дождись реакции цены на уровень или подтверждённого пробоя.",
    "Дочекайся реакції ціни на рівень або підтвердженого пробою.",
    "Wait for a price reaction at the level or a confirmed breakout.",
  ],
  "learn.levels.step4": ["Используй дополнительные инструменты анализа.", "Використовуй додаткові інструменти аналізу.", "Use additional analysis tools."],
  "learn.levels.step5": [
    "Соблюдай риск-менеджмент и не входи в сделку только потому, что цена коснулась уровня.",
    "Дотримуйся ризик-менеджменту й не входь в угоду лише тому, що ціна торкнулася рівня.",
    "Manage risk, and do not enter a trade just because price touched a level.",
  ],
  "learn.levels.warning": [
    "Важно: уровни поддержки и сопротивления — это зоны, а не точные линии. Цена может пробить их в любой момент, поэтому они не гарантируют успешный исход сделки.",
    "Важливо: рівні підтримки та опору — це зони, а не точні лінії. Ціна може пробити їх будь-коли, тому вони не гарантують успішного результату угоди.",
    "Important: support and resistance are zones, not exact lines. Price can break through them at any time, so they do not guarantee a successful trade.",
  ],
  "learn.levels.remember": [
    "Запомни: поддержка помогает найти зоны возможного роста, сопротивление — зоны возможного снижения, а подтверждение движения помогает принимать более обоснованные решения.",
    "Запам’ятай: підтримка допомагає знайти зони можливого зростання, опір — зони можливого зниження, а підтвердження руху допомагає ухвалювати обґрунтованіші рішення.",
    "Remember: support can help identify potential rising zones, resistance potential falling zones, and confirmation can support more informed decisions.",
  ],
  "learn.patterns.title": ["Что такое паттерны?", "Що таке патерни?", "What are chart patterns?"],
  "learn.patterns.definition": [
    "Паттерны — это повторяющиеся комбинации свечей на графике, которые помогают предположить, куда цена может двигаться дальше.",
    "Патерни — це повторювані комбінації свічок на графіку, які допомагають припустити, куди ціна може рухатися далі.",
    "Patterns are recurring candle combinations on a chart that can help suggest where price may move next.",
  ],
  "learn.patterns.imageAlt": [
    "Инфографика о бычьих и медвежьих паттернах продолжения и паттернах разворота.",
    "Інфографіка про бичачі та ведмежі патерни продовження й патерни розвороту.",
    "Infographic showing bullish and bearish continuation patterns and reversal patterns.",
  ],
  "learn.patterns.risingTitle": ["1. Паттерны продолжения роста", "1. Патерни продовження зростання", "1. Bullish continuation patterns"],
  "learn.patterns.rising": [
    "Появляются во время восходящего тренда и могут указывать на то, что после небольшой коррекции цена продолжит расти.",
    "З’являються під час висхідного тренду й можуть вказувати на те, що після невеликої корекції ціна продовжить зростати.",
    "They appear during an uptrend and may suggest that price will continue rising after a small correction.",
  ],
  "learn.patterns.fallingTitle": ["2. Паттерны продолжения падения", "2. Патерни продовження падіння", "2. Bearish continuation patterns"],
  "learn.patterns.falling": [
    "Формируются во время нисходящего тренда и могут указывать на продолжение движения цены вниз.",
    "Формуються під час низхідного тренду й можуть вказувати на продовження руху ціни вниз.",
    "They form during a downtrend and may suggest that price will continue moving lower.",
  ],
  "learn.patterns.reversalTitle": ["3. Паттерны разворота", "3. Патерни розвороту", "3. Reversal patterns"],
  "learn.patterns.reversal": [
    "Могут сигнализировать о возможной смене направления движения цены. Например: «Двойная вершина», «Двойное дно» или «Голова и плечи».",
    "Можуть сигналізувати про можливу зміну напрямку руху ціни. Наприклад: «Подвійна вершина», «Подвійне дно» або «Голова та плечі».",
    "They may signal a possible change in price direction. Examples include a double top, double bottom, or head and shoulders.",
  ],
  "learn.patterns.practiceTitle": [
    "Как использовать паттерны на Pocket Option?",
    "Як використовувати патерни на Pocket Option?",
    "How can you use patterns on Pocket Option?",
  ],
  "learn.patterns.step1": ["Определи текущий тренд.", "Визнач поточний тренд.", "Identify the current trend."],
  "learn.patterns.step2": [
    "Найди на графике формирующийся паттерн.",
    "Знайди на графіку патерн, що формується.",
    "Look for a pattern forming on the chart.",
  ],
  "learn.patterns.step3": [
    "Дождись подтверждения — например, пробоя уровня или закрытия свечи.",
    "Дочекайся підтвердження — наприклад, пробою рівня або закриття свічки.",
    "Wait for confirmation, such as a level breakout or candle close.",
  ],
  "learn.patterns.step4": [
    "Оцени уровни поддержки и сопротивления.",
    "Оціни рівні підтримки та опору.",
    "Assess support and resistance levels.",
  ],
  "learn.patterns.step5": [
    "Не входи в сделку только из-за появления знакомой фигуры — учитывай общую ситуацию на рынке.",
    "Не входь в угоду лише через появу знайомої фігури — враховуй загальну ситуацію на ринку.",
    "Do not enter a trade just because a familiar shape appears; consider the overall market situation.",
  ],
  "learn.patterns.warning": [
    "Важно: паттерны не гарантируют прибыль и могут отрабатывать неправильно. Даже если фигура выглядит идеально, цена может пойти в противоположную сторону. Соблюдай риск-менеджмент и не пытайся отыгрываться после убытков.",
    "Важливо: патерни не гарантують прибутку й можуть відпрацьовувати неправильно. Навіть якщо фігура виглядає ідеально, ціна може піти в протилежний бік. Дотримуйся ризик-менеджменту й не намагайся відігратися після збитків.",
    "Important: patterns do not guarantee profit and can fail. Even a perfect-looking pattern can be followed by a move in the opposite direction. Manage risk and do not chase losses.",
  ],
  "learn.patterns.remember": [
    "Запомни: паттерн — это инструмент анализа, а не гарантия результата сделки.",
    "Запам’ятай: патерн — це інструмент аналізу, а не гарантія результату угоди.",
    "Remember: a pattern is an analysis tool, not a guarantee of a trade outcome.",
  ],
  "signal.connected": ["Поток Pocket Option подключён", "Потік Pocket Option підключено", "Pocket Option feed connected"],
  "signal.disconnected": ["Нет подключения к Pocket Option", "Немає підключення до Pocket Option", "Pocket Option is disconnected"],
  "signal.telegramExpired": [
    "Сеанс Telegram истёк. Закройте и снова откройте Mini App из бота.",
    "Сеанс Telegram завершився. Закрийте й знову відкрийте Mini App із бота.",
    "The Telegram session expired. Close and reopen the Mini App from the bot.",
  ],
  "signal.streamInterrupted": [
    "Соединение с потоком котировок прервано. Переподключаемся…",
    "З’єднання з потоком котирувань перервано. Перепідключаємося…",
    "The quote stream was interrupted. Reconnecting…",
  ],
  "signal.connecting": ["Подключаемся к Pocket Option…", "Підключаємося до Pocket Option…", "Connecting to Pocket Option…"],
  "signal.description": [
    "Проверяются только валютные пары с выплатой 92% и 80%. Выберите экспирацию от 30 секунд до 4 часов; ИИ напрямую анализирует свечи и выбирает направление.",
    "Перевіряються лише валютні пари з виплатою 92% і 80%. Оберіть експірацію від 30 секунд до 4 годин; ШІ безпосередньо аналізує свічки та обирає напрямок.",
    "Only currency pairs with 92% or 80% payout are checked. Choose an expiry from 30 seconds to 4 hours; AI directly analyzes the candles and selects a direction.",
  ],
  "signal.experimental": [
    "Самооценка уверенности ИИ субъективна: это не измеренная вероятность и не историческая проходимость. Результат не гарантирован.",
    "Самооцінка впевненості ШІ суб’єктивна: це не виміряна ймовірність і не історична прохідність. Результат не гарантовано.",
    "AI confidence is subjective, not a measured probability or historical hit rate. Outcomes are not guaranteed.",
  ],
  "signal.expiry": ["Время экспирации", "Час експірації", "Expiry time"],
  "batch.title": ["Тест точности · 20 серий", "Тест точності · 20 серій", "Accuracy test · 20 series"],
  "batch.description": [
    "Сигналы проверяются последовательно по реальным котировкам и сохраняются в истории этого браузера. Сделки не открываются.",
    "Сигнали перевіряються послідовно за реальними котируваннями та зберігаються в історії цього браузера. Угоди не відкриваються.",
    "Signals are checked sequentially against live quotes and saved in this browser’s history. No trades are placed.",
  ],
  "batch.start": ["Запустить тест из 20", "Запустити тест із 20", "Start 20-series test"],
  "batch.pause": ["Пауза", "Пауза", "Pause"],
  "batch.resume": ["Продолжить", "Продовжити", "Resume"],
  "batch.stop": ["Остановить", "Зупинити", "Stop"],
  "batch.running": ["Выполняется", "Виконується", "Running"],
  "batch.paused": ["На паузе", "На паузі", "Paused"],
  "batch.stopping": ["Завершает текущую серию", "Завершує поточну серію", "Finishing current series"],
  "batch.completed": ["Тест завершён", "Тест завершено", "Test completed"],
  "batch.stopped": ["Остановлен", "Зупинено", "Stopped"],
  "batch.progress": ["Серий завершено", "Серій завершено", "Series completed"],
  "batch.wins": ["Победы", "Перемоги", "Wins"],
  "batch.losses": ["Поражения", "Поразки", "Losses"],
  "batch.draws": ["Ничьи", "Нічиї", "Draws"],
  "batch.winRate": ["Проходимость", "Прохідність", "Win rate"],
  "batch.winRateHelp": [
    "По победам и поражениям; ничьи не учитываются",
    "За перемогами та поразками; нічиї не враховуються",
    "Based on wins and losses; draws are excluded",
  ],
  "batch.retry": ["Следующая попытка через {seconds} с", "Наступна спроба через {seconds} с", "Next attempt in {seconds}s"],
  "batch.error": ["Пауза: {reason}", "Пауза: {reason}", "Paused: {reason}"],
  "batch.startFailed": [
    "Не удалось сохранить тест в локальном хранилище браузера.",
    "Не вдалося зберегти тест у локальному сховищі браузера.",
    "Could not save the test in this browser’s local storage.",
  ],
  "batch.series": ["Тестовая серия {current}/{total}", "Тестова серія {current}/{total}", "Test series {current}/{total}"],
  "signal.analyzed": [
    "Свечи {period}; индикаторы учитывают до 128 закрытых свечей, ИИ получает до 30 последних.",
    "Свічки {period}; індикатори враховують до 128 закритих свічок, ШІ отримує до 30 останніх.",
    "Candles {period}; indicators use up to 128 closed candles and the AI receives the latest 30.",
  ],
  "signal.checking": ["Проверяем пары…", "Перевіряємо пари…", "Checking pairs…"],
  "signal.searchFailed": ["Не удалось завершить поиск", "Не вдалося завершити пошук", "Signal search could not be completed"],
  "signal.tryAgain": ["Искать ещё раз", "Шукати ще раз", "Search again"],
  "signal.noSignalAtExpiry": [
    "Сигнал на экспирацию {expiry} не подготовлен: не удалось подтвердить свежие данные или направление. Направление не выдумываем.",
    "Сигнал на експірацію {expiry} не підготовлено: не вдалося підтвердити свіжі дані або напрямок. Напрямок не вигадуємо.",
    "No signal was prepared for the {expiry} expiry because fresh data or a valid direction could not be confirmed.",
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
  "signal.entryExpired": ["Окно входа истекло. Получите новый сигнал.", "Вікно входу минуло. Отримайте новий сигнал.", "The entry window has expired. Request a new signal."],
  "signal.retryCooldownSeconds": ["Повторить через {seconds} с", "Повторити через {seconds} с", "Retry in {seconds}s"],
  "signal.retryCooldownTimer": ["Повторить через {time}", "Повторити через {time}", "Retry in {time}"],
  "signal.analysisTimeout": [
    "Поиск сигнала не завершился за 20 секунд. Попробуйте ещё раз; сигнал не выдан.",
    "Пошук сигналу не завершився за 20 секунд. Спробуйте ще раз; сигнал не видано.",
    "Signal search did not finish within 20 seconds. Try again; no signal was issued.",
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
  "history.batchSeries": ["Тестовая серия {current}/20", "Тестова серія {current}/20", "Test series {current}/20"],
  "history.units": ["ед.", "од.", "units"],
  "history.expiry": ["экспирация", "експірація", "expiry"],
  "history.candles": ["свечи", "свічки", "candles"],
  "outcome.pending": ["В ожидании", "Очікується", "Pending"],
  "outcome.unverified": ["Не проверен", "Не перевірено", "Unverified"],
  "outcome.overlay": ["Перекрытие", "Перекриття", "Recovery"],
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
  "learn.kicker": ["ОСНОВЫ РЫНКА", "ОСНОВИ РИНКУ", "MARKET BASICS"],
  "learn.title": ["Что такое тренд?", "Що таке тренд?", "What is a trend?"],
  "learn.intro": ["Главное, что нужно запомнить:", "Головне, що потрібно запам’ятати:", "Key points to remember:"],
  "profile.admin": ["Админ", "Адмін", "Admin"],
  "profile.title": ["Профиль", "Профіль", "Profile"],
  "profile.linkedTelegram": [
    "Этот Pocket ID закреплён за Telegram-аккаунтом, из которого открыт PRIME BOT. Изменить привязку с этого экрана нельзя.",
    "Цей Pocket ID закріплено за Telegram-акаунтом, з якого відкрито PRIME BOT. Змінити прив’язку на цьому екрані не можна.",
    "This Pocket ID is linked to the Telegram account used to open PRIME BOT. The link cannot be changed from this screen.",
  ],
  "profile.adminInfo": ["Админский ID. Лимита сигналов нет, депозит для входа не нужен.", "ID адміністратора. Ліміту сигналів немає, депозит для доступу не потрібен.", "Admin ID. No signal limit or minimum deposit is required."],
  "profile.userInfo": [
    "Тариф зависит от первого депозита. Базовый от $60 — 10 сигналов в день, Профессиональный от $200 — 40, Глубокий от $500 — без лимита.",
    "Тариф залежить від першого депозиту. Базовий від $60 — 10 сигналів на день, Професійний від $200 — 40, Глибокий від $500 — без ліміту.",
    "Your plan depends on the first deposit. Basic from $60: 10 signals/day; Professional from $200: 40; Deep from $500: unlimited.",
  ],
  "profile.currentLimit": [
    "Ваш персональный дневной лимит: {limit}.",
    "Ваш персональний денний ліміт: {limit}.",
    "Your personal daily limit: {limit}.",
  ],
  "profile.dailyCount": [
    "{count} сигналов в день",
    "{count} сигналів на день",
    "{count} signals per day",
  ],
  "modal.title": ["Готовим сигнал", "Готуємо сигнал", "Preparing signal"],
  "modal.step1": ["Смотрим валютные пары", "Перевіряємо валютні пари", "Checking currency pairs"],
  "modal.step2": ["Сверяем последние свечи", "Зіставляємо останні свічки", "Checking recent candles"],
  "modal.step3": ["Оставляем подтверждённый вход", "Залишаємо підтверджений вхід", "Keeping a confirmed entry"],
  "gate.brand": ["PRIME BOT", "PRIME BOT", "PRIME BOT"],
  "gate.loadingAccess": [
    "Проверяем доступ через Telegram…",
    "Перевіряємо доступ через Telegram…",
    "Checking Telegram access…",
  ],
  "gate.intro": [
    "Введите Pocket Option ID, чтобы проверить доступ к сигналам.",
    "Введіть Pocket Option ID, щоб перевірити доступ до сигналів.",
    "Enter your Pocket Option ID to check signal access.",
  ],
  "gate.id": ["Идентификатор Pocket Option", "Ідентифікатор Pocket Option", "Pocket Option identifier"],
  "gate.idHelp": [
    "Обычный ID из профиля Pocket Option состоит из 9 цифр; настроенные админ-ID принимаются отдельно. Партнёрская проверка не подтверждает владение счётом.",
    "Звичайний ID із профілю Pocket Option містить 9 цифр; налаштовані адмін-ID приймаються окремо. Партнерська перевірка не підтверджує володіння рахунком.",
    "Regular Pocket Option IDs have 9 digits; configured admin IDs are accepted separately. The partner API does not prove account ownership.",
  ],
  "gate.error": [
    "Идентификатор должен состоять ровно из 9 цифр",
    "Ідентифікатор має містити рівно 9 цифр",
    "The identifier must contain exactly 9 digits",
  ],
  "gate.check": ["Проверить ID", "Перевірити ID", "Verify ID"],
  "gate.enterDigits": ["Введите 9 цифр", "Введіть 9 цифр", "Enter 9 digits"],
  "gate.checking": ["Проверяем…", "Перевіряємо…", "Checking…"],
  "gate.result.invalidId": ["Проверьте ID: нужны ровно 9 цифр.", "Перевірте ID: потрібно рівно 9 цифр.", "Check the ID: exactly 9 digits are required."],
  "gate.result.notRegistered": [
    "Регистрация по партнёрской ссылке не подтверждена. Убедитесь, что аккаунт создан по ссылке владельца PRIME BOT.",
    "Реєстрацію за партнерським посиланням не підтверджено. Переконайтеся, що акаунт створено за посиланням власника PRIME BOT.",
    "Registration through the partner link was not confirmed. Make sure the account was created through the PRIME BOT owner’s link.",
  ],
  "gate.result.depositRequired": [
    "Подтверждённый депозит пока не найден. Внесите депозит любого размера и повторите проверку позже.",
    "Підтверджений депозит поки не знайдено. Внесіть депозит будь-якого розміру й повторіть перевірку пізніше.",
    "No confirmed deposit was found yet. Make a deposit of any amount and try again later.",
  ],
  "gate.result.alreadyLinked": [
    "Этот Telegram-аккаунт или Pocket ID уже связан. Один Telegram-аккаунт — один Pocket ID, и один Pocket ID — один Telegram-аккаунт.",
    "Цей Telegram-акаунт або Pocket ID уже пов’язано. Один Telegram-акаунт — один Pocket ID, і один Pocket ID — один Telegram-акаунт.",
    "This Telegram account or Pocket ID is already linked. One Telegram account per Pocket ID, and one Pocket ID per Telegram account.",
  ],
  "gate.result.telegramRequired": [
    "Откройте PRIME BOT внутри Telegram, чтобы подтвердить ID.",
    "Відкрийте PRIME BOT у Telegram, щоб підтвердити ID.",
    "Open PRIME BOT inside Telegram to verify your ID.",
  ],
  "gate.result.rateLimited": [
    "Слишком много проверок. Попробуйте снова примерно через час.",
    "Забагато перевірок. Спробуйте ще раз приблизно за годину.",
    "Too many checks. Try again in about an hour.",
  ],
  "gate.result.unavailable": [
    "Не удалось проверить данные сейчас. Попробуйте позже.",
    "Не вдалося перевірити дані зараз. Спробуйте пізніше.",
    "We couldn’t verify the details right now. Please try again later.",
  ],
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
  if (seconds === 30) {
    return language === "en" ? "30 sec" : language === "uk" ? "30 с" : "30 сек";
  }
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourUnit = language === "en" ? "h" : language === "uk" ? "год" : "ч";
  const minuteUnit = language === "en" ? "min" : language === "uk" ? "хв" : "мин";
  if (hours && minutes) return `${hours} ${hourUnit} ${minutes} ${minuteUnit}`;
  if (hours) return `${hours} ${hourUnit}`;
  return `${totalMinutes} ${minuteUnit}`;
}
