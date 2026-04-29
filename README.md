# Mixed Sport Elements — Next.js

Перенос монолитного `_legacy/cascade.html` (vanilla JS + Firebase) на современный стек: Next.js 15 + React 19 + TypeScript + Tailwind + Zustand. Два модуля: **София** (здоровье, обучение) и **Проксима** (задачи).

## Стек

- **Next.js 15** (App Router) + **React 19** + **TypeScript strict**
- **TailwindCSS** + CSS-переменные тем
- **Zustand** (+ `persist`) для глобального состояния
- **firebase-admin** на сервере (через API routes), либо in-memory мок
- **framer-motion** анимации, **react-markdown** + **DOMPurify** для чата
- **Groq** (Llama-3.3 + Whisper) для Sofia-чата и голосового ввода
- **Gemini** (2.0 Flash) для Proxima — генерация pipeline и AI Enhance задач

Подробности архитектуры — в [`CLAUDE.md`](CLAUDE.md).

## Запуск

```bash
cp .env.example .env       # ключи (.env в .gitignore)
npm install
npm run dev
```

Откроется на http://localhost:3000.

`MOCK_FIREBASE=1` по умолчанию — приложение поднимется без Firestore-кредов. Чтобы получить рабочий AI: в `.env` заполни `GROQ_API_KEY` (есть бесплатный тир) и `GEMINI_API_KEY`.

## Скрипты

```bash
npm run dev          # dev-сервер
npm run build        # production build
npx tsc --noEmit     # типизация
```

## Структура

```
src/
  app/                 App Router + API routes (только сервер ходит в БД)
    api/
      ai/sofia         Groq chat
      ai/proxima       Gemini chat
      ai/proxima/...   enhance, pipeline (структурные задачи)
      ai/transcribe    Whisper (голосовой ввод)
      auth/login       Логин по ID + PIN
      users/*          CRUD пользователя
  components/          UI-примитивы, layout, monitor, theme
  features/            chat, browser/sofia, browser/proxima, sync, auth
  hooks/               useHydrated, useVoiceRecorder
  lib/                 firebase-admin, repos, ai, pipeline parser
  stores/              useAuthStore, useTasksStore, useChatStore, useStatsStore...
public/assets/         SVG / Lottie / WEBM из легаси
_legacy/               оригинальные HTML-файлы (не собираются)
```

## Статус

См. таблицу миграции в [`CLAUDE.md`](CLAUDE.md). Готово: auth, theme, monitor, layout, обе модули, AI-чат с историей, голосовой ввод, AI-генерация pipeline для задач, экзамены с achievements, weight tracker, backend-sync для tasks/stats. В работе: chat-history sync, materials API, modals (Leaderboard/Invite/ProductKey), function-calling в Proxima-чате.
