# CLAUDE.md

Контекст для Claude Code, работающего в этом репозитории. Читать перед нетривиальной правкой.

## Что это за проект

Порт монолитного web-приложения "Mixed Sport Elements" (фитнес/обучение, на русском) — оригинальный однофайловый `cascade.html` (18k строк, 827KB, vanilla JS + Firebase v10 + Lottie + html2canvas) переписывается на современный стек.

Оригинал лежит в [`_legacy/cascade.html`](_legacy/cascade.html) — это референс, в сборку не входит. Открывать через `Read` с offset/limit (целиком в контекст не лезет).

## Стек

- **Next.js 15** (App Router) + **React 19** + **TypeScript strict**
- **TailwindCSS** + CSS-переменные для темы
- **Zustand** (+ `persist`) — глобальное состояние
- **Firebase v10** — `firebase-admin` на сервере (через API routes), либо in-memory мок
- **framer-motion** — анимации
- **react-markdown** + **DOMPurify** — для будущего чата
- **lottie-react** — для будущих анимаций
- **html2canvas** — скриншоты (как в легаси)

## Структура `src/`

```
app/
  layout.tsx             root layout + ThemeProvider
  page.tsx               рендерит AppShell
  globals.css            CSS-переменные, reset, утилиты
  api/                   ВСЕ серверные эндпоинты (DB-доступ только тут)
    users/route.ts       GET (list), POST (register)
    users/[id]/route.ts  GET, PATCH, DELETE
    auth/login/route.ts  POST { id, pin } → { user } | 401

components/
  layout/                Header, AppShell, ContentBlock, BrowserBlock, ChatBlock
  theme/                 ThemeProvider, ThemeToggle
  monitor/               Monitor + ProfileBlock + MonitorVideo + SkinDots
  ui/                    Icon, IconButton, Modal, Overlay, PinInput

features/                фичи приложения
  auth/                  LoginForm, RegisterForm, LogoutForm, AuthOverlay

hooks/                   useHydrated и т.п.

lib/
  firebase-admin.ts      server-only, lazy-init Firebase Admin
  api-client.ts          fetch-обёртка для браузера, с логами
  api-utils.ts           server-only: jsonOk / jsonError / readJson / withLog
  types.ts               доменные типы (User, Task, ChatMessage, ...)
  assets.ts              карта статики /assets/...
  users-api.ts           клиентские врапперы вокруг /api/users
  repos/                 абстракция БД с двумя реализациями
    types.ts                 UsersRepo интерфейс
    firestoreUsersRepo.ts    через firebase-admin
    mockUsersRepo.ts         in-memory через globalThis
    index.ts                 usersRepo() — селектор по env

stores/                  Zustand-сторы (useAuthStore, useThemeStore, ...)
```

```
public/assets/           все SVG / JSON / WEBM
_legacy/cascade.html     оригинал
```

## Ключевые архитектурные решения

### 1. БД только через API routes

В легаси браузер ходил в Firestore напрямую через Web SDK. В порте — **никогда**. Клиент → `lib/api-client.ts` (или `lib/users-api.ts`) → `app/api/...` → `lib/repos/usersRepo()` → реальный Firestore либо мок.

Это требование пользователя ("вынеси работу с базой в Next.js API"). Не нарушать.

### 2. `MOCK_FIREBASE=1` для dev

В `.env.local`:
- `MOCK_FIREBASE=1` — все API routes используют [`mockUsersRepo`](src/lib/repos/mockUsersRepo.ts), хранение в `globalThis.__mockUsers` (Map), переживает HMR, теряется при перезапуске.
- `MOCK_FIREBASE=0` — реальный Firestore, нужны `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (service-account из Firebase Console).

При первом обращении лог `[repos] mode=MOCK ...` или `[repos] mode=FIRESTORE`.

### 3. Тема — CSS-переменные, не `filter: invert()`

В легаси была дикая фича — глобальный `filter: invert(0.92)` на root для светлой темы. **Не воспроизводить.** Используем CSS-переменные на `:root[data-theme="dark|light"]`. [`ThemeProvider`](src/components/theme/ThemeProvider.tsx) ставит атрибут на `<html>` через `useEffect`. `<html suppressHydrationWarning>` обязательно — иначе React ругается.

### 4. Hydration-safety с `persist`-сторами

`persist` middleware из Zustand читает localStorage **синхронно при первом рендере на клиенте**. На сервере localStorage нет → `user = null`. На клиенте → `user = {...}`. Это hydration mismatch.

Решение — хук [`useHydrated()`](src/hooks/useHydrated.ts):

```tsx
const hydrated = useHydrated();
const user = useAuthStore((s) => s.user);
const visibleUser = hydrated ? user : null;  // безопасно для SSR
```

То же — для любых `Math.random()` / `Date.now()` в инициализации стора. Пример решения: [`useMonitorStore`](src/stores/useMonitorStore.ts) — `vitals` стартуют как нули, реальные значения генерируются через `ensureVitals()` после mount.

### 5. Респонсив

- `<lg` (< 1024px): `flex-col` — блоки вертикально (как мобила)
- `lg+`: `flex-row` — блоки горизонтально (Browser | Monitor | Chat)

[`ContentBlock`](src/components/layout/ContentBlock.tsx) сворачивается через framer-motion `flex-grow` + `flex-basis: 50` — работает в обоих направлениях. На блоках ОБЯЗАТЕЛЬНО `min-h-0 min-w-0`.

Body — `width: 100%`, `height: 100dvh` (dynamic viewport, адресная строка на мобиле). Никаких `width: 430px` / `display: flex` центрирования из легаси.

### 6. Monitor видим только когда оба блока свёрнуты

[`useBlocksStore.bothCollapsed()`](src/stores/useBlocksStore.ts) — селектор. Monitor читает его и анимирует opacity + flex-grow.

## Конвенции

- Все client-компоненты — `"use client"` в первой строке.
- Server-only модули — `import "server-only"` сверху (firebase-admin, api-utils, repos/*).
- Каждый Zustand-стор — отдельный файл в `src/stores/`, имя `use*Store`.
- Каждая фича — папка в `src/features/`, экспортирует `*Overlay` / `*Form` компоненты.
- API routes — оборачивать в `withLog("METHOD /path", async (...) => { ... })` для трассировки.
- Все ответы — через `jsonOk()` / `jsonError()` (логирует ошибки сами).
- Не звать `firebase-admin` напрямую из API routes — только через `usersRepo()`.
- Иконки — через [`ICONS`](src/lib/assets.ts) / `LOTTIE` / `VIDEOS` константы, не литералы путей.

## Команды

```bash
npm run dev          # dev на http://localhost:3000
npm run build        # production build
npx tsc --noEmit     # типизация (запускать перед коммитом)
```

## Статус миграции

| Слой | Что | Статус |
|---|---|---|
| 0 | Фундамент: DI, репозиторий, стораны, UI-примитивы, API client/utils | ✅ |
| 1 | Layout shell: Header, BrowserBlock, ChatBlock, AppShell, AuthOverlay | ✅ |
| 2 | Тема dark / light / auto | ✅ |
| - | Monitor (видео × 3 скина × 2 пола, ProfileBlock с vitals, scroll-градиенты) | ✅ |
| - | Auth (Login / Register / Logout, PinInput, persist через Zustand, mock-режим) | ✅ |
| - | Респонсив (vertical mobile / horizontal lg+) | ✅ |
| 5 | Chat (Proxima): табы, markdown, файлы через IndexedDB, голос, Groq API | ⏳ |
| 6 | Tasks (Helix): CRUD, поиск, pinning, pipeline-визуализация | ⏳ |
| 7 | Modals: Calculator, Exams, Materials, Workouts, ProductKey, Leaderboard, Invite | ⏳ |
| 8 | Polish: Lottie через lottie-react, grain-loaders как хуки | ⏳ |

## Карта легаси (для будущих портов)

В `_legacy/cascade.html` (читать через Read с offset/limit):

| Фича | Линии |
|---|---|
| Auth (login/register pipeline) | 4732–5395 |
| Chat (tabs, messages, voice) | 11911–13901, 17323–17500 |
| Tasks (Helix pipelines) | 16004–17476 |
| Monitor (videos, profile, skin) | 2870–3219 |
| Calculator (TDEE + macros) | 8807–9069 |
| Exams (swipe, timer, results) | 9137–9274 |
| Materials/Workouts (locked) | 5550–5594 |
| Leaderboard | 3980–4130 |
| Invite | 15573–15675 |
| Theme system (legacy filter:invert) | 2738–2860 |

## Чего НЕ делать

- ❌ Не звать Firebase Web SDK напрямую с клиента — всё через `/api/...`.
- ❌ Не использовать `firebase-admin` напрямую из API routes — только через `usersRepo()`.
- ❌ Не вызывать `Math.random()` / `Date.now()` / `new Date()` в инициализации стора или модуля — будет hydration mismatch.
- ❌ Не воспроизводить `filter: invert()` для светлой темы — у нас CSS-переменные.
- ❌ Не возвращать `width: 430px` body или `maximumScale: 1` — мы responsive.
- ❌ Не ставить `localStorage`/`window` в render-фазу — только через `useEffect` или `useHydrated()`.
- ❌ Не коммитить `.env.local` (в `.gitignore`).
- ❌ Не править `next-env.d.ts` руками (Next.js регенерирует).

## Если что-то падает

1. **Hydration mismatch** → ищите `Math.random` / `Date.now` / `localStorage` / `persist` в render-пути → оборачивайте в `useHydrated()`.
2. **`Firebase Admin credentials are missing`** → либо ставьте `MOCK_FIREBASE=1`, либо заполняйте service-account в `.env.local`.
3. **API route 500** → смотрите серверный лог в терминале где `npm run dev` (логи `[api] →`, `[firebase-admin] init failed`).
4. **Сетевая ошибка в DevTools** → клиентский лог `[api-client] ✖ ...` тоже покажет статус и сообщение.
