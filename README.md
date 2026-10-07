# Signal Shelf

Персональная полка материалов (статьи, ссылки, заметки) на **React 19 + TypeScript**.

**Live:** [gh0st0fwar.github.io/signal-shelf](https://gh0st0fwar.github.io/signal-shelf/)

## Stack

- Vite + React 19 + TypeScript
- React Router
- TanStack Query
- react-hook-form
- Context для UI prefs (density / accent)
- localStorage через async-адаптер Query

## Features

- Список с поиском и фильтром по статусу
- Create / edit / delete карточек
- Detail-страница
- Persist в `localStorage`
- UX: loading / error + retry / empty shelf / empty filter

## Dev

```bash
npm install
npm run dev
```

Сборка:

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

Путь сайта совпадает с именем репозитория: `base: '/signal-shelf/'` в `vite.config.ts`.

1. В репо: **Settings → Pages → Source → GitHub Actions**
2. Пуш в `main` запускает [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
3. После зелёного workflow сайт доступен по ссылке выше

Учебный чеклист шагов: [LEARNING.md](./LEARNING.md).
