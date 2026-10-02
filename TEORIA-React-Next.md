# React + Next.js — полный теоретический гайд

**Источники примеров:** `kendala-foodservice` (боевой Next.js 15 App Router) и каркас `signal-shelf` (Vite + React 19 + React Router; **без решений шагов LEARNING**).  
**Для кого:** закрыть Signal Shelf → второй пет на Next → собеседования на React/Next.  
**Как читать:** теория → 2–3 реальных фрагмента → типичные вопросы на собесе → связь с шагами полки (что тренируешь, не «как ответить»).

> **Правило по Signal Shelf:** здесь нет готовых решений шагов 1–12. Каркас (роуты, `ShelfCard`, типы, заглушки страниц) можно цитировать как «как устроено». Логику `map` / фильтров / CRUD / persist / Query / Context — пишешь сам. Похожие паттерны беру из **Kendala**.

---

## 0. Вердикт: хватит ли этого файла «на всю теорию»?

**Частично да, полностью — нет. И это нормально.**

| Слой | Этот гайд + два проекта | Что ещё добрать к джуну/мидлу React·Next |
|------|-------------------------|------------------------------------------|
| React-основа (компоненты, JSX, props, state, списки, формы, effects, refs, custom hooks, Context) | ✅ Signal Shelf как тренажёр + Kendala как «как в проде» | — |
| Роутинг SPA | ✅ React Router в полке | Сравнение с App Router — ниже |
| Асинхронный UI-кэш | ✅ TanStack Query (шаг 9 полки) — теория здесь, код — ты | `useMutation`, инвалидация, `staleTime` на практике |
| Next.js App Router | ✅ Kendala: layout, `"use client"`, cookies, middleware, Route Handlers | Server Actions, streaming/`Suspense`, ISR/SSG глубже, Auth.js, Edge |
| RSC-модель мышления | ✅ разобрана | Попрактиковать на **втором пете** (не только читать) |
| Собес «под капотом» | ⚠️ есть блоки (reconciliation, Strict Mode, keys, batching) | Fiber в глубину, Concurrent Features, `useTransition`/`useDeferredValue` — кратко здесь, углублять отдельно |
| Тесты, a11y, performance profiling | ⚠️ упоминания | Отдельный проход перед мидл-вакансиями |
| Стейт-менеджеры (Zustand/Redux) | ❌ почти нет (в твоих проектах Context + Query) | На собесе спросит «когда Context мало» — ответ в §14 |

**Вывод:** файл закрывает **практический минимум React для полки + мост в Next по Kendala + солидную базу под собесы**. Для должности «React/Next разработчик» после полки нужен **второй пет на Next** (очередь: Signal → второй Next-пет → voice chat). Этот документ — учебник рядом с руками, не замена коду.

**Предложения (помимо файла):**
1. Идти по LEARNING шагам 1→12, сюда возвращаться как в справочник.
2. После шага 6–7 — прогнать себя по чеклисту «собес: hooks» (§20).
3. Второй пет: Server Component + один Client island + fetch на сервере + одна форма с Server Action или Route Handler — этого не хватает в Signal Shelf по определению (там Vite CSR).
4. Не смешивать «теория Next» и «спойлеры полки»: полку решай сам, Next смотри в Kendala.

---

## 1. Два стека рядом: карта

```
signal-shelf                          kendala-foodservice
─────────────                         ───────────────────
Vite                                  Next.js (App Router)
createRoot → <App />                  app/layout.tsx → pages
React Router (BrowserRouter)          файловая маршрутизация app/**
всё Client Component по сути          Server Layout + Client islands
localStorage / Query (планируется)    Context + REST через lib/api + Route Handlers
UI: токены CSS                        UI: Tailwind + shadcn-подобные компоненты
```

**Мост Vue → React** (из LEARNING, раскрытый):

| Vue | React | Где увидишь |
|-----|-------|-------------|
| SFC template | JSX в функции | `ShelfCard`, `app/page.tsx` |
| `defineProps` | аргумент + тип | `EditPage({ mode })`, `AppShell({ children })` |
| `v-for` | `.map` + `key` | Kendala меню; полка — шаг 1 |
| `ref` / `reactive` | `useState` | заказ, фильтры админки |
| `computed` | выражение в рендере / редко `useMemo` | `useMemo(() => resolveQrMenuDay(), [])` |
| `watch` / `onMounted` | `useEffect` | баннер, persist (шаг 5) |
| composable | custom hook | `useOrders`, `useIsMobile`, `useShelfItems` (шаг 6) |
| provide/inject / Pinia | Context | `OrdersProvider`, `LanguageProvider` |
| Vue Router | React Router / Next `Link` | `App.tsx` vs `app/menu/page.tsx` |

---

## 2. Ментальная модель React

### 2.1. UI = f(state)

Компонент — функция: на вход props (+ hooks state) → на выход описание UI (элементы React).  
React **сравнивает** новое дерево с предыдущим и меняет DOM точечно (reconciliation). Ты не пишешь `document.querySelector` для обновления текста — меняешь state → React перерисует.

### 2.2. Declarative vs imperative

- **Imperative:** «найди input, поставь value, повесь listener».
- **Declarative:** «value = state.phone; onChange обновляет state» — UI следует за данными.

### 2.3. Однонаправленный поток данных

Родитель → props → ребёнок. Ребёнок сообщает наверх через **колбэки** (`onChange`, `setMenu`). Глобальный обход — Context / внешний store / Query cache.

### 2.4. Render ≠ mount

- **Mount** — первый показ в дереве.
- **Render** — вызов функции компонента (может быть много раз).
- **Commit** — применение изменений к DOM.
В Strict Mode (dev) React **дважды** вызывает render/effects умышленно — ловит грязные side effects.

**Пример Strict Mode (signal-shelf):**

```tsx
// signal-shelf/src/main.tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Пример точки входа Next (нет createRoot — фреймворк монтирует сам):**

```tsx
// kendala …/app/layout.tsx (фрагмент)
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  // …
  return (
    <html lang="ru">
      <body className={inter.className}>
        <LanguageProvider>
          <OrdersProvider initialToken={token} initialHash={hash}>
            {children}
          </OrdersProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
```

**Собес:** «Что такое reconciliation?» — сопоставление деревьев по типу элемента и `key`; при смене type — размонт и новый mount.

---

## 3. Компоненты и JSX

### 3.1. Функциональный компонент

Обычная функция (или `function Name()`), имя с **большой буквы**, возвращает JSX.

**Пример 1 — презентационный (полка, готовая оболочка):**

```tsx
// signal-shelf/src/components/ShelfCard.tsx
export function ShelfCard({ item }: ShelfCardProps) {
  const statusClass = `shelf-card__status shelf-card__status--${item.status}`
  return (
    <Link className="shelf-card" to={`/item/${item.id}`}>
      <h2 className="shelf-card__title">{item.title}</h2>
      {/* … */}
    </Link>
  )
}
```

**Пример 2 — страница-контейнер (Kendala QR):**

```tsx
// kendala …/app/menu/page.tsx
export default function RestaurantQrMenuPage() {
  const { banner, isBannerVisible, isLoadingBanner, qrMenuImages } = useOrders()
  // state + effects + JSX
  return <div className="relative min-h-screen …">…</div>
}
```

**Пример 3 — layout-оболочка с children:**

```tsx
// signal-shelf/src/components/AppShell.tsx
export function AppShell({ children, tagline = '…' }: AppShellProps) {
  return (
    <div className="shell">
      <header>…</header>
      <main className="shell__main">{children}</main>
    </div>
  )
}
```

### 3.2. JSX → `React.createElement`

```jsx
<h1 className="x">Hi</h1>
// ≈ createElement('h1', { className: 'x' }, 'Hi')
```

Правила:
- Один корень **или** фрагмент `<>…</>`.
- `class` → `className`, `for` → `htmlFor`.
- В `{}` — JS-выражения, не инструкции (`if` целиком нельзя; тернарный / `&&` — можно).
- Самозакрывающиеся теги обязательны: `<img />`, `<Input />`.

**Фрагмент (полка ListPage-заглушка):**

```tsx
export function ListPage() {
  return (
    <>
      <div className="todo-banner">…</div>
      <div className="toolbar" …>…</div>
      <div className="empty">…</div>
    </>
  )
}
```

### 3.3. Выражения в JSX

**Условный рендер заметки:**

```tsx
// ShelfCard
{item.note ? <p className="shelf-card__note">{item.note}</p> : <p className="shelf-card__note">Без заметки</p>}
```

**Условный блок афиши (Kendala):**

```tsx
{showAfishaGate ? (
  <div role="dialog" aria-modal="true">…</div>
) : null}
```

**Короткий &&:**

```tsx
{showWeekendNotice && (
  <div className="mb-3 rounded-md …">Обеденное меню AZURE доступно с пн по пт…</div>
)}
```

Ловушка: `{count && <Badge />}` при `count === 0` нарисует `0`. Лучше `count > 0 && …` или тернарный.

---

## 4. Props, children, композиция

### 4.1. Props — входные данные, read-only

Не мутируй `props` и вложенные объекты «на месте». Новый объект → новый state у владельца.

**Типизация props (полка):**

```tsx
type EditPageProps = {
  mode: 'create' | 'edit'
}

export function EditPage({ mode }: EditPageProps) {
  const title = mode === 'create' ? 'Новый сигнал' : 'Редактирование'
  // …
}
```

**Дефолт в деструктуризации:**

```tsx
export function AppShell({
  children,
  tagline = 'Личная полка материалов — pet на React + TypeScript',
}: AppShellProps) { … }
```

**Props извне провайдера (Kendala layout → OrdersProvider):**

```tsx
<OrdersProvider initialToken={token} initialHash={hash}>
  {children}
</OrdersProvider>
```

```tsx
export const OrdersProvider: React.FC<{
  initialToken: string | undefined
  initialHash: string | undefined
  children: React.ReactNode
}> = ({ initialToken = undefined, initialHash = undefined, children }) => {
  const [token, setToken] = useState<string | undefined>(initialToken)
  // …
}
```

### 4.2. `children`

Слот для вложенного JSX. Тип: `React.ReactNode` (элементы, строки, массивы, `null`…).

```tsx
type AppShellProps = {
  children: ReactNode
  tagline?: string
}
```

### 4.3. Композиция vs наследование

React почти не использует классовое наследование UI. Собираешь экраны из мелких частей: `AppShell` + страница; `LanguageProvider` + `OrdersProvider` + page.

**Собес:** «lifting state up» — state живёт у ближайшего общего предка, которому нужны данные и сеттер.

---

## 5. Списки, `map`, `key`

### 5.1. Зачем `key`

`key` — стабильный идентификатор элемента в списке для reconciliation.  
Плохо: `key={index}` если список фильтруется/сортируется/удаляется (путаются state инпутов внутри строк).  
Хорошо: `id` из данных.

### 5.2. Примеры

**Пример 1 — теги в карточке (готовая логика полки, не шаг 1):**

```tsx
{item.tags.map((tag) => (
  <span className="tag" key={tag}>
    {tag}
  </span>
))}
```

**Пример 2 — дни меню заказа (Kendala):**

```tsx
{menu?.map((dayMenu) => {
  // карточка дня, блюда внутри
})}
```

**Пример 3 — preload картинок QR по дням:**

```tsx
{QR_MENU_DAYS.map((d) => {
  const img = qrMenuImages[d.day]
  if (!img?.url) return null
  return (
    <img key={`preload-${d.day}-${img.dlId}`} src={img.url} alt="" />
  )
})}
```

**Пример 4 — данные для map (mock, без UI-решения шага 1):**

```ts
// signal-shelf/src/data/mockItems.ts
export const mockItems: ShelfItem[] = [
  { id: '1', title: 'React Docs — Describing the UI', tags: ['react', 'docs'], status: 'reading', /* … */ },
  // …
]
```

**Связь с полкой:** шаг 1 — `mockItems.map` → `<ShelfCard item={…} />` внутри `.shelf-grid`. Решение не привожу.

**filter + map** (типичный паттерн фильтров, Kendala-группы блюд):

```tsx
.filter((group) => group.items.length > 0)
.map((group) => { /* … */ })
```

На шаге 2 полки тот же приём: отфильтровать массив → map в карточки.

---

## 6. Состояние: `useState`

### 6.1. Контракт

```ts
const [value, setValue] = useState(initial)
```

- `setValue(next)` планирует re-render.
- Не мутируй `value` напрямую (`arr.push` — плохо; новый массив — хорошо).
- Обновление от предыдущего: `setX(prev => …)` — обязательно при серии обновлений и в async/closures.

### 6.2. Примитив и объект

**Пример 1 — много локальных флагов (QR menu):**

```tsx
const [tab, setTab] = useState<QrMenuDayNum>(resolved.initialTab)
const [afishaDismissed, setAfishaDismissed] = useState(false)
const [bannerFetchDone, setBannerFetchDone] = useState(false)
const [afishaImgLoaded, setAfishaImgLoaded] = useState(false)
const [dayImagesReady, setDayImagesReady] = useState(false)
```

**Пример 2 — объект формы клиента:**

```tsx
const [customerInfo, setCustomerInfo] = useState({
  fullName: "",
  phone: "",
  office: "",
  floor: "",
  company: "",
})

// обновление одного поля — новый объект:
setCustomerInfo({
  ...customerInfo,
  fullName: e.target.value,
})
```

Или безопаснее от prev:

```tsx
setCustomerInfo((prev) => ({ ...prev, phone: value.replace(/\D/g, "") }))
```

**Пример 3 — union-литералы:**

```tsx
const [paymentMethod, setPaymentMethod] = useState<"cash" | "invoice">("cash")
```

**Пример 4 — массив дней заказа:**

```tsx
const [orderDays, setOrderDays] = useState<OrderDay[]>([])
// удаление по индексу без мутации:
setOrderDays(orderDays.filter((_, index) => index !== existingIndex))
```

### 6.3. Ленивая инициализация

```ts
const [x, setX] = useState(() => expensiveParse())
```

Функция вызовется только на первом mount. Полезно для чтения `localStorage` (идея шага 5 полки — не копируй сюда готовое решение).

### 6.4. Batching

В React 18+ несколько `setState` в одном обработчике событий обычно батчатся в один render. В async после `await` тоже (в современных версиях). Не полагайся на «прочитал state сразу после set» — ещё старое значение в том же тике.

**Собес:** «Почему setState асинхронный?» — не блокировать UI; группировать обновления; state из замыкания render’а фиксирован до следующего render.

---

## 7. События и controlled inputs

### 7.1. Synthetic events

`onClick`, `onChange`, `onSubmit` — обёртки React. В форме почти всегда:

```tsx
onSubmit={(e) => {
  e.preventDefault()
  // …логика
}}
```

Заглушка на полке уже так делает:

```tsx
// EditPage (каркас)
<form
  className="form-grid"
  onSubmit={(e) => {
    e.preventDefault()
  }}
>
```

### 7.2. Controlled vs uncontrolled

| | Controlled | Uncontrolled |
|--|------------|--------------|
| Источник истины | React state | DOM |
| Типичный API | `value={…}` + `onChange` | `defaultValue` + `ref` |
| Формы в учебных шагах | да (шаг 3) | редко |

**Пример controlled (Kendala имя):**

```tsx
onChange={(e) => {
  setCustomerInfo({
    ...customerInfo,
    fullName: e.target.value,
  })
}}
```

**Каркас полей полки (пока disabled — ты оживишь на шаге 3):**

```tsx
<input id="title" name="title" placeholder="Название материала" disabled />
<select id="status" name="status" disabled defaultValue="to-read">…</select>
```

Теория шага 3: каждое поле → кусок state (или один объект формы) → `value`/`onChange` → на submit собрать `ShelfItem`.

### 7.3. `htmlFor` + `id`

Доступность: клик по label фокусирует input. В JSX атрибут `htmlFor`, не `for`.

---

## 8. `useEffect` — глубоко

### 8.1. Назначение

Синхронизация с **внешним миром**: сеть, `localStorage`, таймеры, подписки, imperative DOM/API библиотек, analytics hit.

Не для: вычисления производных данных (считай в render), трансформации props→state «на каждый чих» (часто антипаттерн).

Официальный must-read: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — даже в `mockItems` полки на это есть ссылка.

### 8.2. Сигнатура

```ts
useEffect(() => {
  // side effect
  return () => {
    // cleanup: clearInterval, abort, removeListener
  }
}, [deps])
```

| deps | Поведение |
|------|-----------|
| `[]` | после mount (+ Strict remount в dev) |
| `[a, b]` | когда `a`/`b` изменились по `Object.is` |
| нет массива | каждый render (почти всегда ошибка) |

### 8.3. Примеры из Kendala

**1) Таймер + cleanup:**

```tsx
useEffect(() => {
  // …начальная проверка времени заказа
  const interval = setInterval(() => {
    // каждую минуту: закрыть день / сообщение
  }, 1000 * 60)
  return () => clearInterval(interval)
}, [])
```

**2) Effect с отменой гонки (banner image):**

```tsx
useEffect(() => {
  let isActive = true
  const img = new window.Image()
  img.src = banner.url
  img.onload = () => {
    if (!isActive) return
    setBannerSize({ width, height })
    setIsBannerReady(true)
  }
  return () => {
    isActive = false
  }
}, [/* banner deps */])
```

**3) Preload с `cancelled` флагом (QR):**

```tsx
useEffect(() => {
  if (isLoadingBanner) return
  let cancelled = false
  void Promise.all(jobs).then(() => {
    if (!cancelled) setDayImagesReady(true)
  })
  return () => {
    cancelled = true
  }
}, [isLoadingBanner, bannerUrl, qrMenuImages])
```

**4) Подписка matchMedia (custom hook):**

```tsx
// hooks/use-mobile.tsx
React.useEffect(() => {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  const onChange = () => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
  }
  mql.addEventListener("change", onChange)
  setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
  return () => mql.removeEventListener("change", onChange)
}, [])
```

**5) Analytics на смену URL:**

```tsx
// YandexRouterTracker.tsx
useEffect(() => {
  if (typeof window !== "undefined" && window.ym) {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "")
    window.ym(YANDEX_METRICA_ID, "hit", url)
  }
}, [pathname, searchParams])
```

**6) Persist UI-prefs (админка — идея шага 5 полки, другой ключ):**

```tsx
useEffect(() => {
  const storedTab = localStorage.getItem("admin_active_tab")
  if (storedTab === "menu" || storedTab === "orders" || /* … */) {
    setActiveTab(storedTab)
  }
}, [])
```

(Запись в storage при смене таба — симметричный effect или сразу в обработчике; на полке продумаешь сам.)

**7) Загрузка при появлении token/hash:**

```tsx
useEffect(() => {
  if (token && hash) {
    getOrders()
  }
  setInitialized(true)
}, [token, hash])
```

### 8.4. Замыкание и «устаревший state»

Effect видит props/state того render’а, в котором был создан. Если в deps забыли значение — stale closure. ESLint `react-hooks/exhaustive-deps` — друг, не враг.

### 8.5. Связь с шагами полки

- Шаг 5: sync массива items ↔ `localStorage` (чтение при init, запись при изменении).  
- Не тащи сеть в effect «просто так», если на шаге 9 появится Query — Query сам управляет fetch lifecycle.

---

## 9. `useRef`

### 9.1. Два смысла

1. Ссылка на DOM: `ref={el}`.
2. «Коробочка» мутабельного значения **без** re-render: `ref.current = …`.

### 9.2. Примеры Kendala

**Флаг «уже применили QR day»:**

```tsx
const qrDayAppliedRef = useRef(false)
```

**Флаг «баннер уже начали грузить»:**

```tsx
const bannerLoadStarted = useRef(false)
useEffect(() => {
  if (isLoadingBanner) {
    bannerLoadStarted.current = true
    return
  }
  if (bannerLoadStarted.current) setBannerFetchDone(true)
}, [isLoadingBanner])
```

**Remount через `key` (рядом с ref-идеей):** PhoneInput ломается при очистке value → форсируют новый instance:

```tsx
const [phoneInputKey, setPhoneInputKey] = useState(0)
// после сброса заказа: setPhoneInputKey(k => k + 1)
// <PhoneInput key={phoneInputKey} … />
```

Это паттерн «сброс state ребёнка сменой key» — на собесе любят.

---

## 10. `useMemo` и `useCallback`

### 10.1. Когда нужны

Не по умолчанию. Нужны когда:
- тяжёлый расчёт;
- стабильная ссылка для deps effect’а / мемо-ребёнка (`React.memo`);
- контекст value, чтобы не рвать всех потребителей.

### 10.2. Примеры

**useMemo — один раз посчитать стартовый день QR:**

```tsx
const resolved = useMemo(() => resolveQrMenuDay(), [])
const [tab, setTab] = useState<QrMenuDayNum>(resolved.initialTab)
```

**useCallback — стабильный loader для deps:**

```tsx
const loadBanner = useCallback(async () => {
  setIsLoadingBanner(true)
  try {
    // dropbox select → banner + qrMenuImages
  } finally {
    setIsLoadingBanner(false)
  }
}, [])

useEffect(() => {
  void loadBanner()
}, [])
```

**Аналог в админ QR tab:** `const refresh = useCallback(async () => { … }, […deps])`.

**Собес:** `useMemo` кэширует **значение**; `useCallback` — синтаксический сахар над `useMemo(() => fn, deps)` для **функции**.

---

## 11. Custom hooks

### 11.1. Правило

Имя с `use…`. Внутри можно вызывать другие hooks. Это способ **разделить stateful-логику**, не «магия».

### 11.2. Примеры

**1) `useOrders` — тонкая обёртка Context:**

```tsx
export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within a OrdersProvider")
  }
  return context
}
```

**2) `useLanguage` — то же для i18n:**

```tsx
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
```

**3) `useIsMobile` — полностью самостоятельный hook:**

```tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  React.useEffect(() => { /* matchMedia */ }, [])
  return !!isMobile
}
```

**4) `useToast` — внешнее хранилище + подписка (упрощённый store):** слушатели + `useState`/`useEffect` внутри хука (см. `hooks/use-toast.ts`) — полезно понять до Redux.

**Связь с полкой:** шаг 6 — вынести items + persist в `useShelfItems`. Контракт сам: что возвращает (`items`, `add`, `remove`, `update`…), где живёт storage.

---

## 12. Context API

### 12.1. Зачем

Прокинуть данные глубоко без prop drilling. Цена: любой consumer ре-рендерится при смене `value` (если value — новый объект каждый render — ре-рендеры чаще).

### 12.2. Паттерн Provider + hook

**Language (проще):**

```tsx
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ru")
  const t = (key: string): string => { /* … */ }
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
```

**Orders (богаче — меню, заказы, баннер, QR):**

```tsx
const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

// value={{ orders, setOrders, menu, loadBanner, … }}
```

Вложение в layout:

```tsx
<LanguageProvider>
  <OrdersProvider initialToken={token} initialHash={hash}>
    {children}
    <Toaster />
  </OrdersProvider>
</LanguageProvider>
```

### 12.3. Что класть в Context, что нет

| Хорошо в Context | Лучше Query / локальный state |
|------------------|-------------------------------|
| theme, language, auth session shell | частые списки с сервера |
| «меню недели + флаги сайта» как в Kendala | форма одного экрана |
| UI prefs (density) — шаг 10 полки | ephemeral modal open |

**Шаг 10 полки:** Context для density/accent — теория выше; реализацию не спойлерю.

### 12.4. Начальные данные с сервера → клиентский Context

Kendala: Server Layout читает `cookies()`, передаёт в Client Provider как `initialToken` / `initialHash`. Это мост RSC → client state.

---

## 13. Роутинг

### 13.1. React Router (signal-shelf)

```tsx
// App.tsx
<BrowserRouter>
  <AppShell>
    <Routes>
      <Route path="/" element={<ListPage />} />
      <Route path="/new" element={<EditPage mode="create" />} />
      <Route path="/item/:id" element={<DetailPage />} />
      <Route path="/item/:id/edit" element={<EditPage mode="edit" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AppShell>
</BrowserRouter>
```

**Навигация:**

```tsx
<Link to={`/item/${item.id}`}>…</Link>
<NavLink to="/" end>Полка</NavLink>
```

**Параметры:**

```tsx
const { id } = useParams()
// DetailPage показывает id; поиск item — шаг 7 (сам)
```

Понятия: path params (`:id`), query (`?q=` — через `useSearchParams`), nested routes, outlet (в полке пока плоско).

### 13.2. Next App Router (kendala)

Файлы = маршруты:

| Файл | URL |
|------|-----|
| `app/page.tsx` | `/` |
| `app/menu/page.tsx` | `/menu` |
| `app/admin/page.tsx` | `/admin` |
| `app/api/orders/add/route.ts` | `/api/orders/add` |

**Клиентская навигация:**

```tsx
import Link from "next/link"
<Link href="/">…</Link>
```

**Чтение path/search на клиенте:**

```tsx
const pathname = usePathname()
const searchParams = useSearchParams()
```

**Собес:** CSR SPA (полка) vs SSR/RSC (Next) — первая грузит JS и рисует всё на клиенте; вторая может отдать HTML с сервера, гидрировать острова.

---

## 14. Асинхронные данные и TanStack Query (теория под шаг 9)

### 14.1. Проблема «голого» useEffect + fetch

Дубли запросов, гонки, нет дедупа, ручной loading/error, сложно шарить кэш между страницами списка и детали.

### 14.2. Идея Query

- **Query** = кэшированный асинхронный результат по `queryKey`.
- **staleTime** — сколько данные «свежие» без рефетча.
- **gcTime** (бывший cacheTime) — сколько мёртвый кэш живёт в памяти.
- **invalidateQueries** после мутации — список узнаёт, что устарел.

### 14.3. Как это рифмуется с Kendala (без Query, но те же состояния)

В `OrdersProvider` уже есть ручные аналоги:

```tsx
const [isLoadingBanner, setIsLoadingBanner] = useState(false)
// loadBanner: try/finally → set false
// UI: menuLoading = isLoadingBanner || !dayImagesReady
```

И empty/error через toast + пустые объекты. На шаге 9–11 полки Query + явные UX-состояния сделают это чище.

### 14.4. Типичный скелет (учебный, не решение полки)

```tsx
// ИЛЛЮСТРАЦИЯ, не вставляй слепо в шаг 9
const { data, isPending, isError, error } = useQuery({
  queryKey: ['shelf-items'],
  queryFn: () => readItemsFromStorageAsync(),
})
```

Мутации: `useMutation` + `onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shelf-items'] })`.

Defaults TanStack важны — в mockItems полки уже есть ссылка на Important Defaults.

### 14.5. Context vs Query

- Context: синхронный UI/session.
- Query: сервер/async источник истины + кэш.
Часто оба: SessionContext + `useQuery(['orders'])`.

---

## 15. TypeScript в React-проектах

### 15.1. Доменные типы (полка)

```ts
export type ShelfStatus = 'to-read' | 'reading' | 'done'

export type ShelfItem = {
  id: string
  title: string
  url?: string
  note?: string
  tags: string[]
  status: ShelfStatus
  createdAt: string
}
```

### 15.2. API-контракты (Kendala)

```ts
export interface Order {
  id?: string
  customer: { fullName: string; phone: string; /* … */ }
  orderDays: Array<{ /* … */ dessertQuantity?: number }>
  paymentMethod: "cash" | "invoice"
  total: number
  // …
}
```

### 15.3. Props + Record maps

```ts
const STATUS_LABEL: Record<ShelfStatus, string> = {
  'to-read': 'To read',
  reading: 'Reading',
  done: 'Done',
}
```

### 15.4. Чистые функции рядом с UI

Бизнес-логика десертов вынесена из компонентов — тестируемо и читаемо:

```ts
// lib/dessert.ts
export function normalizeDessertQuantity(value: unknown): number { /* … */ }
export function getDessertDish(dayMenu: DayMenu | undefined): Dish | null { /* … */ }
export function calculateOrderTotal(/* … */): number { /* … */ }
```

На собесе плюс: «логика не только в JSX».

---

## 16. Next.js App Router — модель

### 16.1. Server Components по умолчанию

Файл без `"use client"` — Server Component: можно `async`, читать `cookies()`, БД, не слать лишний JS на клиент. Нельзя: `useState`, браузерные API, множество интерактивных хендлеров.

**Root layout — async Server Component:**

```tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value || undefined
  // …
}
```

### 16.2. Client Components — `"use client"`

Директива на **верху файла**. Граница: этот модуль и его импорты (если они используют hooks) становятся клиентским бандлом.

Почти все интерактивные страницы Kendala:

```tsx
"use client"
import { useState, useEffect, useRef } from "react"
// app/page.tsx, app/menu/page.tsx, orders-provider.tsx, …
```

Паттерн: тонкий Server Layout + толстые Client islands.

### 16.3. Metadata

```tsx
export const metadata: Metadata = {
  title: "KENDALA Foodservice by AZURE",
  description: "Food delivery service for Ken Dala Business Center",
}
```

Только в Server Components.

### 16.4. Route Handlers (`app/api/…/route.ts`)

HTTP endpoints внутри Next: `GET`, `POST`, …  
Клиент дергает их через `lib/api.ts` (`fetch` на `API_BASE_URL` или относительные пути).

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""
```

**Важно для собеса и деплоя:** `NEXT_PUBLIC_*` вшиваются на **build**. Сменил env на Vercel — нужен redeploy. Путаница CORS у Kendala часто из «фронт собран с одним origin, API другой».

### 16.5. Middleware

```ts
// middleware.ts
export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const hash = req.cookies.get("hash")?.value
  if (!token || !hash) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/menu/upload", "/delivery", "/kitchen"],
}
```

Edge-проверка до страницы/API. Не путать с React Context auth.

### 16.6. `next/image`, `next/script`, `next/font`

В layout: `Inter` из `next/font/google`, `Script` для пикселя. Оптимизации фреймворка — тема собеса «зачем next/image».

---

## 17. Рендеринг: CSR / SSR / RSC / hydration

| Режим | Кто рисует HTML | Типичный кейс |
|-------|-----------------|---------------|
| CSR | Браузер после JS | Vite Signal Shelf |
| SSR | Сервер на каждый запрос | классический Pages `getServerSideProps` / динамический App Router |
| SSG/ISR | На билде / с ревалидацией | маркетинг, блоги |
| RSC | Сервер отдаёт полезную нагрузку компонентов | App Router default |

**Hydration:** серверный HTML + клиентский JS «оживляют» listeners. Ошибка hydration — markup не совпал (random id, `Date.now()` в render без оговорок, `window` в первом render).

В QR/заказе Kendala время через `getMockDate()` — осознанная точка контроля; таймзона Almaty для QR vs браузер на `/` — пример «серверные/бизнес правила vs клиентские часы».

---

## 18. Формы, фильтры, UX-состояния (прикладные паттерны)

### 18.1. Фильтрация списка (админ / шаг 2 полки)

Идея: `searchTerm` + `statusFilter` в state → `orders.filter(…)` в render (или `useMemo` если тяжело). В полке — поиск по title/tags + chip status. **Код решения шага 2 не даю.**

Похожий кусок админки: `searchTerm`, `statusFilter` state + effects на login detection.

### 18.2. Loading / empty / error

Из QR page:

```tsx
const menuLoading = isLoadingBanner || !dayImagesReady
// …и отдельные ветки «нет картинки», «выходные»
```

Шаг 11 полки: не оставляй вечный спиннер; empty — осмысленный; error — retry.

### 18.3. Toast как глобальный feedback

```tsx
const { toast } = useToast()
toast({ title: t("common.error"), description: res.error, variant: "destructive" })
```

### 18.4. Derived state без effect

Сумма заказа, отфильтрованный список, label статуса — **вычисляй в render** (или чистой функцией), не копируй в state через effect.

```ts
calculateLunchLineTotal(...)
calculateOrderTotal(...)
```

---

## 19. Производительность и качество (шпаргалка)

1. **Ключи** стабильные.
2. **Не создавай** компоненты внутри компонентов (`function Inner()` в render) — сброс state.
3. **Список огромный** — виртуализация (на собесе знать слово).
4. **React.memo** — только после измерения.
5. **Code split** — `React.lazy` / dynamic import Next.
6. **Accessibility:** semantic tags, `aria-*` на диалогах афиши уже есть в QR.
7. **Immutable updates** массивов/объектов.

---

## 20. Собеседование: частые вопросы → короткие ответы

**Virtual DOM?** Лёгкое описание UI в памяти; сравнивается с предыдущим; патч в DOM. Не «быстрее DOM всегда», а предсказуемые обновления.

**Controlled input?** Value из state.

**Зачем key?** Идентичность элемента в списке между render’ами.

**useEffect vs useLayoutEffect?** Layout — до paint, синхронно (измерения DOM); Effect — после paint.

**Почему нельзя hooks в условиях?** Порядок вызовов hooks должен быть стабилен между render’ами.

**Prop drilling?** Прокидывание props через уровни без нужды → Context / composition / store.

**CSR vs SSR?** SEO, TTFB, секреты на сервере, интерактивность.

**Что такое hydration mismatch?** См. §17.

**Context каждый render?** Новый object в `value={{…}}` без мемо → потребители обновятся. Иногда ок (редко меняющийся language).

**Query staleTime 0?** Рефетч часто при mount/focus — defaults TanStack.

**Server Component нельзя useState?** Да; вынеси island с `"use client"`.

**middleware vs getServerSideProps auth?** Middleware — рано, на edge/net; не замена проверкам в API.

---

## 21. Карта шагов Signal Shelf → теория (без ответов)

| Шаг | Тренируешь | Разделы гайда | Где смотреть аналог в Kendala |
|-----|------------|---------------|-------------------------------|
| 1 Список | map, props, key | §3–5 | `menu?.map`, QR_MENU_DAYS.map |
| 2 Фильтры | useState, filter | §6, §18 | admin search/status |
| 3 Create form | controlled inputs | §7 | customerInfo onChange |
| 4 CRUD memory | immutable update | §6 | orderDays filter/map |
| 5 Persist | useEffect + storage | §8 | admin_active_tab localStorage |
| 6 Custom hook | extract | §11 | useOrders / useIsMobile |
| 7 Detail | useParams, find | §13 | — |
| 8 Edit | reuse form + mode | §4 EditPage props | — |
| 9 Query | async cache | §14 | ручной loadBanner как «до Query» |
| 10 Context | Provider | §12 | LanguageProvider |
| 11 UX states | pending/empty/error | §18 | menuLoading, toasts |
| 12 Deploy | README | — | Vercel env lesson |

---

## 22. Что обязательно добавить на втором Next-пете

Чтобы файл + полка + Kendala-чтение сложились в «готов к работе Next»:

1. Одна **Server Component** страница с `async` fetch (не всё `"use client"`).
2. Один **Client** виджет с state внутри.
3. `loading.tsx` / `error.tsx` или `Suspense`.
4. Мутация: Server Action **или** Route Handler + revalidate.
5. Env: серверные секреты **без** `NEXT_PUBLIC_`.
6. Базовый deploy (Vercel) и понимание bake-in публичных env.

Голосовой чат (проект 3) — WebRTC и очередь; React/Next там уже должны быть «руками», не первым знакомством.

---

## 23. Чистый JS, который постоянно нужен в React

Без этого «хуки не спасут»:

- `map` / `filter` / `find` / `some` / `reduce`
- spread / rest, деструктуризация
- optional chaining `?.`, nullish `??`
- `Promise`, `async/await`, `AbortController` (на будущее)
- модули `import`/`export`
- иммутабельные обновления: `[...arr]`, `{...obj}`

Примеры иммутабельности из Kendala уже в §6.

---

## 24. Анти-паттерны (сверяй код)

1. Effect «скопировать props в state» без нужды.
2. `key={index}` в динамических списках.
3. Мутация state.
4. Fetch без отмены/игнора устаревшего ответа.
5. Гигантский Context value на каждый чих.
6. Вся логика в одном `page.tsx` на 1000 строк — Kendala order page показывает боль роста; вынос в `lib/dessert.ts` — правильное направление.
7. Секреты в `NEXT_PUBLIC_*`.

---

## 25. Как пользоваться этим файлом на практике

1. Перед шагом N полки — прочитай строку таблицы §21 + соответствующий раздел.
2. После своего PR-не-PR решения — сравни с паттерном Kendala (не копипаст заказа еды в полку).
3. Раз в неделю — §20 вслух без подглядывания.
4. Перед вторым петом — §§16–17 целиком.

---

## Приложение A. Точки входа файлов

**signal-shelf**

- `src/main.tsx` — mount + StrictMode  
- `src/App.tsx` — Router  
- `src/components/AppShell.tsx`, `ShelfCard.tsx`  
- `src/pages/*` — твои шаги  
- `src/data/types.ts`, `mockItems.ts`  
- `LEARNING.md` — чеклист шагов  

**kendala-foodservice**

- `app/layout.tsx` — RSC layout, cookies → providers  
- `app/page.tsx` — заказ (client)  
- `app/menu/page.tsx` — QR  
- `app/admin/page.tsx` — админка  
- `components/orders-provider.tsx`, `language-provider.tsx`  
- `hooks/use-toast.ts`, `use-mobile.tsx`  
- `lib/api.ts`, `lib/dessert.ts`, `lib/qr-menu.ts`  
- `middleware.ts`  
- `app/api/**/route.ts`  

---

## Приложение B. Глоссарий одной строкой

- **Island** — клиентский интерактивный кусок среди серверного дерева.  
- **Revalidation** — обновить закэшированные серверные данные.  
- **Hydration** — оживление SSR HTML.  
- **stale** — данные в кэше Query устарели.  
- **Matcher** — какие пути трогает middleware.  
- **Bake-in** — значение env попало в клиентский бандл на build.

---

*Конец ядра гайда. Ниже — углублённые мини-лекции (тот же уровень «теория + 2–3 примера»), без спойлеров решений Signal Shelf.*

---

## 26. Иммутабельные обновления — тренировочный разбор

React сравнивает state по ссылке для объектов/массивов. Мутация «тихо» ломает обновления или даёт баги.

**Удаление элемента (Kendala — день из заказа):**

```tsx
setOrderDays(orderDays.filter((_, index) => index !== existingIndex))
```

**Обновление одного дня в массиве (паттерн map):**

```tsx
orderDays.map((od) =>
  /* если тот день — вернуть новый объект, иначе od */
)
```

**Удаление id из selectedDishes:**

```tsx
newDishes = currentDishes.filter((id) => id !== dishId)
```

**Объект формы:**

```tsx
setCustomerInfo((prev) => ({ ...prev, phone: value.replace(/\D/g, "") }))
```

На шагах 4–5 полки те же приёмы для массива `ShelfItem[]`.

---

## 27. `ReactNode`, элементы, компоненты

- **Component** — функция/класс.
- **Element** — то, что вернул JSX (`{ type, props }`).
- **ReactNode** — то, что можно передать в children: element | string | number | null | boolean | array…

```tsx
children: React.ReactNode
title?: React.ReactNode  // в toast — можно строку или <b>…
```

---

## 28. Подъём состояния и «кто владеет данными»

В Kendala меню «владеет» `OrdersProvider`, страница заказа **читает/пишет** через `useOrders()`:

```tsx
const { menu, setMenu, isMaintenanceMode, isBannerVisible, banner } = useOrders()
```

Локально на странице — только то, что относится к черновику заказа (`orderDays`, `customerInfo`).  
На полке позже: список items скорее в hook/context наверху, а не копией на каждой странице.

---

## 29. Навигационные компоненты: Link vs NavLink vs `<a>`

```tsx
// Полная перезагрузка — обычный <a href> (редко нужно в SPA)
// SPA-переход:
<Link to="/">← К полке</Link>
<NavLink to="/" end>Полка</NavLink>  // получает active-класс
```

Next:

```tsx
import Link from "next/link"
<Link href={`/menu`}>…</Link>
```

`end` у NavLink: активен только точный `/`, не все дочерние пути.

---

## 30. Работа с URL query (идея, Kendala)

На заказе QR-день читается из query (`parseOrderDayParam` + `window.location.search` / searchParams).  
Паттерн: URL — источник истины для shareable state (вкладка дня, id, фильтры).  
На полке фильтры можно держать в state; вынос в query — бонус, не обязателен шагами.

---

## 31. Ошибки границ и null UI

```tsx
if (!initialized) {
  return null // или <Spinner/>
}
```

в Provider — пока нет токена/первичной загрузки, детей не показывают.  
Альтернативы: skeleton, `loading.tsx` в Next. На собесе: Error Boundary (классовый / `error.tsx` в App Router) ловит ошибки **рендера**, не async в event handler.

---

## 32. Работа с файлами и бинарным UI (расширение кругозора)

Админка Kendala: `bannerFile: File | null`, upload в Dropbox API.  
Теория: controlled не для `File` так же, как для string — обычно `onChange` → `e.target.files[0]` в state, превью через `URL.createObjectURL` (revoke в cleanup).  
К полке не относится; к Next-пету с upload — да.

---

## 33. i18n через Context (мини-архитектура)

```tsx
const t = (key: string): string => {
  return translations[language][key] || key
}
```

Плюс токены `{orderStartTime}` в строках.  
Собес: i18n можно через библиотеки (`next-intl`); идея та же — словарь + текущая локаль в контексте.

---

## 34. Тестирование чистой логики (зачем vitest в Kendala)

`lib/dessert.test.ts`, `menu-excel.test.ts` — без React Testing Library.  
Правило: вынес расчёт → покрыл тестом. UI тестируй отдельно.  
Для полки на старте необязательно; для собеса — «как бы тестировал calculateTotal».

---

## 35. Этика учебного проекта

- Не проси агента закрыть шаг за тебя — ломается смысл LEARNING.
- Этот файл — **теория и чужие боевые паттерны**, не ключи к TODO в ListPage.
- Ревью шага — после твоего «шаг N готов».

---

## 36. Правила хуков (Rules of Hooks) — разбор до собеса

### 36.1. Два правила

1. Только на верхнем уровне функции-компонента или custom hook (не в циклах, условиях, вложенных функциях).
2. Только из React-функций (компонент / hook), не из обычных util.

Почему: React хранит hooks в **упорядоченном списке** на fiber-узле. Вызов №3 на этом render должен быть тем же hook, что и вызов №3 на прошлом. Условный `useState` сдвигает индексы → хаос.

### 36.2. Что можно условно

Условно — **логику внутри** hook и **ранний return JSX после всех hooks**:

```tsx
// OK: все hooks вызваны всегда
const { menu } = useOrders()
const [tab, setTab] = useState(/* … */)
useEffect(() => { /* … */ }, [/* … */])

if (menuLoading) return <p>Загрузка…</p>
return <main>…</main>
```

Плохо:

```tsx
if ( Cond) {
  useEffect(() => {}) // нельзя
}
```

### 36.3. Custom hook = те же правила

`useOrders` / `useLanguage` / будущий `useShelfItems` обязаны вызывать `useContext`/`useState` безусловно. Ранний `throw`, если нет Provider — после вызова `useContext`, это ок:

```tsx
const context = useContext(OrdersContext)
if (context === undefined) {
  throw new Error("useOrders must be used within a OrdersProvider")
}
```

---

## 37. Reconciliation и `key` — подробнее

### 37.1. Алгоритм на пальцах

На одном уровне дерева React идёт по детям слева направо:

- Тот же `type` (например `div` или `ShelfCard`) + тот же `key` → **обновить** props, сохранить state экземпляра.
- Другой `type` → размонтировать старое, смонтировать новое (state сбрасывается).
- Список: `key` помогает сопоставить «этот item уехал на другую позицию», а не «удалили и создали заново».

### 37.2. Три примера ключей из проектов

```tsx
// 1) Стабильный бизнес-id
key={tag}

// 2) Составной ключ, когда одного дня мало (preload + cache bust id)
key={`preload-${d.day}-${img.dlId}`}

// 3) Remount по design: смена key сбрасывает внутренний state PhoneInput
key={phoneInputKey}
```

### 37.3. Антипаттерн index

```tsx
items.map((item, i) => <Row key={i} item={item} />)
```

Удалил первый элемент → бывший второй получил `key={0}` → React думает, что это «тот же» ряд, и может оставить в инпутах текст от другого item. На шаге 4 полки с delete это критично: ключ = `item.id`.

---

## 38. Batching, transitions, отложенный UI (ориентир мидла)

### 38.1. Automatic batching (React 18+)

Несколько `setState` в одном event handler → один re-render. То же после `await` в большинстве случаев.

### 38.2. `useTransition` / `startTransition`

Помечает обновление как **не срочное**: ввод в поиск остаётся snappy, тяжёлый фильтр списка — с `isPending`.  
В Kendala/полке пока нет — знать формулировку на собесе: « concurrent rendering: срочный update не блокируется долгим».

### 38.3. `useDeferredValue`

Отложенная копия value для тяжёлого child. Похожая идея: искать по `deferredQuery`, а input держать на актуальном `query`.

### 38.4. `useOptimistic` (React 19)

Оптимистичный UI до ответа сервера. На шаге 9+ полки можно упомянуть, внедрять не обязательно.

---

## 39. Внешний store без Redux: разбор `useToast`

Идея: модульный `memoryState` + `listeners` + `dispatch`/`reducer` — как крошечный Redux.

```tsx
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])

  return { ...state, toast, dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }) }
}
```

**Зачем это в гайде:** на собесе «зачем Redux, если есть Context?» — ответ: для частых обновлений и middleware; для тостов внешний store избегает Context re-render всего дерева.  
**Связь с полкой:** шаг 10 Context для редких prefs — ок; для списка items на каждое нажатие — подумай о hook + Query, а не о гигантском Context.

Третий пример «store-like»: `OrdersProvider` — это Context-store с async методами (`getOrders`, `loadBanner`).

---

## 40. Route Handlers Next — контракт HTTP

```ts
// app/api/orders/add/route.ts (идея; секреты в репо — отдельный code smell)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // …сборка payload, fetch во внешний API, notify
    return NextResponse.json(/* … */)
  } catch {
    return NextResponse.json({ error: "…" }, { status: 500 })
  }
}
```

Клиент (`lib/api.ts`) инкапсулирует URL и типы `ApiResponse<T>`.  
На втором пете: либо такой Handler, либо Server Action — оба валидны; Action удобнее для форм с progressive enhancement.

**Собес:** отличие Route Handler от `pages/api` — App Router file conventions; оба живут на сервере, не в браузерном бандле (если не импортировать случайно в client).

---

## 41. Admin QR tab — `useCallback` + loading machine

```tsx
const [slots, setSlots] = useState<DaySlot[]>(emptySlots)
const [loading, setLoading] = useState(true)

const refresh = useCallback(async () => {
  // fetch dropbox → разложить по day slots
}, [/* deps */])

useEffect(() => {
  void refresh()
}, [refresh])
```

Паттерны:
- локальная машина состояний слота (`uploading: boolean` на каждом дне);
- refresh как единая точка правды;
- toast на ошибках.

Для полки шаг 11 — те же оси: loading / empty / error, только для items.

---

## 42. Controlled form целиком — учебная схема (не код шага 3)

Теория «как выглядит голова», без привязки к полям полки:

```text
state: { title, url, note, tagsText, status }
view:  input value={state.title} onChange → set title
submit: validate → build entity → add(entity) → navigate('/')
edit:   при mount/эффект по id → заполнить state из item
```

Четыре опоры:
1. Один источник истины (state).
2. `preventDefault` на submit.
3. Валидация до side effect.
4. Режим `create | edit` через props (каркас `EditPage` уже задаёт `mode`).

Три живых образца **полей** в Kendala (имя / офис / компания) — см. `setCustomerInfo` в `app/page.tsx`; плюс телефон через отдельный handler с нормализацией цифр.

---

## 43. Derived data: filter/find в render

**find по типу блюда:**

```ts
const byType = dayMenu.dishes.find((d) => {
  const t = (d.type || "").toLowerCase().trim()
  return t === "dessert" || t === "десерт"
})
```

**Группировка без state:**

```ts
export function getLunchDishGroups(dayMenu: DayMenu) {
  const lunch = dayMenu.dishes.slice(0, LUNCH_DISH_SLOTS)
  return {
    salads: lunch.slice(0, 2),
    soups: lunch.slice(2, 4),
    mains: lunch.slice(4, 6),
    drinks: lunch.slice(6, 8),
  }
}
```

**Статус → CSS-класс (полка, готово):**

```tsx
const statusClass = `shelf-card__status shelf-card__status--${item.status}`
```

Шаг 2/7 полки: фильтр списка и `items.find(i => i.id === id)` — те же приёмы; пишешь сам.

---

## 44. Побочные эффекты vs события

| Триггер | Куда писать |
|---------|-------------|
| Клик «Сохранить» | onSubmit / onClick → вызов API |
| «При монтировании загрузи меню» | useEffect или Query |
| «При каждом изменении items пиши storage» | useEffect([items]) или запись в том же add/remove |
| «При смене URLhit метрики» | useEffect([pathname]) |

Правило React Docs: если можно рассчитать во время render — не effect. Если реакция на **действие пользователя** — чаще event handler, не effect.

---

## 45. Портал / overlay (модалка афиши)

QR-афиша — `fixed inset-0 z-[100]` поверх страницы. Теория: иногда нужны **React portals** (`createPortal`) в `document.body`, чтобы избежать `overflow: hidden` предков.  
Dialog/Modal из UI-кита Kendala обычно уже на Radix portal. На собесе: portal рендерит детей в другой DOM-узел, сохраняя React-контекст.

Пример семантики:

```tsx
role="dialog"
aria-modal="true"
aria-label="Афиша AZURE"
```

---

## 46. Env, билд, CORS — теория из боли Kendala

1. `NEXT_PUBLIC_API_URL` попадает в клиентский бандл **на build**.
2. Сменил значение на хостинге → без rebuild клиент может звать старый origin.
3. Если фронт на Vercel, API на другом домене — CORS настраивается на API; «починить CORS фронтом» нельзя магически.
4. Middleware читает cookies на edge — не путать с `localStorage` (его middleware не видит).

Для Vite-полки: `import.meta.env.VITE_*` — та же идея публичных переменных.

---

## 47. Сравнение роутеров одной таблицей

| Тема | React Router (полка) | Next App Router (Kendala) |
|------|----------------------|---------------------------|
| Объявление | `<Route>` в JSX | файлы в `app/` |
| Layout | `AppShell` children | `layout.tsx` вложенностью |
| Link | `react-router-dom` | `next/link` |
| Params | `useParams()` | `props.params` (server) / `useParams` (client) |
| Code split | manual lazy | file-based / automatic |
| Data | сам / Query | fetch на сервере, cache, actions |

---

## 48. Каркас полного ответа на собесе «расскажите про hooks»

Шаблон устного ответа (2 минуты):

1. Hooks — API состояния и эффектов в функциях.
2. `useState` — локальный state, иммутабельные обновления.
3. `useEffect` — синхронизация с внешним миром + cleanup.
4. `useRef` — DOM и мутабельный ящик без render.
5. `useMemo`/`useCallback` — стабилизация/кэш по deps, не по привычке.
6. Custom hooks — переиспользование логики (`useOrders`, `useIsMobile`).
7. Правила порядка вызовов.
8. Пример из опыта: «в foodservice меню в Context, черновик заказа в page state; QR — preload картинок с cancelled flag в effect».

---

## 49. Каркас ответа «чем Next лучше CRA/Vite для продукта»

1. SSR/RSC → SEO и быстрый first paint для контента.
2. Файловый роутинг и layouts.
3. Route Handlers / Server Actions рядом с UI.
4. Оптимизации image/font/script.
5. Middleware для auth gate.
Минусы: сложнее модель Server/Client; больше магии cache; пет Signal Shelf на Vite — правильный **первый** шаг без этой сложности.

---

## 50. Чеклист самопроверки перед откликом на React/Next

- [ ] Могу с нуля написать controlled form и список с filter.
- [ ] Объясняю key, Strict Mode, stale closure.
- [ ] Писал custom hook с persist или fetch.
- [ ] Понимаю Context limitations.
- [ ] Поднимал Query или могу объяснить, зачем он вместо effect-fetch.
- [ ] В Next: что значит `"use client"`, зачем async layout, что такое middleware.
- [ ] Есть 1–2 проекта в портфолио: полка (React) + foodservice или второй Next-пет.
- [ ] Могу разобрать кусок своего кода 10 минут без паники.

---

## 51. Рекомендуемый порядок чтения этого файла

**Неделя Signal Shelf 1–4:** §§2–7, 23, 26, 42–43.  
**Шаги 5–8:** §§8–11, 13, 28, 37.  
**Шаги 9–11:** §§12, 14, 18, 39, 41.  
**Параллельно «смотрю Kendala»:** §§16–17, 40, 46–47.  
**Перед собесами:** §§20, 36, 38, 48–50.  
**Перед вторым петом:** §22 + §§16–17 повтор.

---

*Файл: `signal-shelf/TEORIA-React-Next.md`. Обновляй по мере второго пета (допиши свои Server Component примеры).*
