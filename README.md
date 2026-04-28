# Cascade — Next.js

Перенос монолитного `cascade.html` (Mixed Sport Elements) на стек Next.js 15 + React 19 + TypeScript + Tailwind + Firebase.

## Стек

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** в strict-режиме
- **TailwindCSS** для стилей
- **Zustand** для глобального состояния
- **Firebase v10** (Firestore + Storage) — клиентский SDK через `@/lib/firebase`
- **lottie-react** для анимаций
- **html2canvas** для скриншотов (как в оригинале)

## Структура

```
src/
  app/                  # App Router: layout, страницы
  components/           # переиспользуемые UI-компоненты
  features/             # фичи: profile, chat, exams, materials, calculator, ...
  hooks/                # React-хуки
  lib/                  # firebase, assets, утилиты
  stores/               # Zustand-сторы
  styles/               # модульные CSS, если нужны
public/
  assets/               # все SVG / JSON / WEBM
_legacy/
  cascade.html          # оригинал — справочник, не собирается
```

## Запуск

```bash
cp .env.local.example .env.local   # подставить свой Firebase config (или оставить дефолт)
npm install
npm run dev
```

Откроется на http://localhost:3000.

## Статус миграции

Скелет готов, фичи переносятся итерационно. См. план в обсуждении.
