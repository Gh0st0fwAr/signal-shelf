# Signal Shelf — LEARNING

Пет-проект: персональная полка материалов (React 19 + TypeScript).  
Формат как **nuxt-notes**: теория в чате на каждый шаг → ты пишешь решение → ревью.

## Роли

| Кто | Делает |
|-----|--------|
| **Ты** | Логика: state, effects, hooks, query, типы домена, map/filter, формы |
| **Наставник (агент)** | Вёрстка, design tokens, motion, оболочки страниц, развёрнутая теория в чате |

**Не трогай** без нужды: `src/index.css`, `src/styles/**`, разметку классов в оболочках.  
**Твоя зона:** `src/pages/**`, хуки (когда появятся), data-слой, правки props.

## Как работать шаг

1. Прочитай теорию **в чате** (не только этот файл).
2. Сделай задание в коде сам.
3. Напиши в чат: «шаг N готов» — получишь ревью и следующий шаг.
4. Не проси «сделай за меня» логику шага.

## Чеклист микрошагов

- [ ] **0. Setup** — каркас готов (Vite, CSS, оболочки, mock). *Сделано наставником.*
- [x] **1. Список** — `mockItems.map` → `ShelfCard`
- [x] **2. Фильтры** — `useState`: поиск + статус
- [x] **3. Форма create** — controlled inputs на `/new`
- [x] **4. CRUD в памяти** — add / delete (пока без persist)
- [x] **5. Persist** — `useEffect` + `localStorage`
- [x] **6. Custom hook** — `useShelfItems`
- [x] **7. Detail** — `/item/:id`, поиск по id
- [ ] **8. Edit route** — `/item/:id/edit`
- [ ] **9. TanStack Query** — async-адаптер storage
- [ ] **10. Context** — UI prefs (density / accent)
- [ ] **11. UX states** — empty / error / loading по уму
- [ ] **12. Deploy + README** — текст для портфолио

## Полезные пути

```
src/
  data/types.ts        — доменные типы
  data/mockItems.ts    — стартовый массив
  components/ShelfCard.tsx — презентационная карточка (готова)
  components/AppShell.tsx  — шапка/навигация (готова)
  pages/ListPage.tsx   — ШАГ 1 здесь
  pages/DetailPage.tsx — шаг 7
  pages/EditPage.tsx   — шаги 3 и 8
  App.tsx              — роуты уже разведены
```

## Запуск

```bash
cd signal-shelf
npm install
npm run dev
```

## Мост Vue → React (коротко)

| Vue | React |
|-----|--------|
| SFC template | JSX в функции компонента |
| `props` / `defineProps` | аргумент функции / тип props |
| `v-for` | `.map()` + стабильный `key` |
| `ref` / `reactive` | `useState` |
| `computed` | выражение в рендере или `useMemo` (редко) |
| `watch` / `onMounted` | `useEffect` |
| composable | custom hook |
| Vue Router | React Router |
| Pinia | Context + hooks / Query cache |

Подробности — в чате на каждом шаге.

**Справочник теории (без решений шагов):** [TEORIA-React-Next.md](./TEORIA-React-Next.md) — React + мост в Next на примерах Kendala.
