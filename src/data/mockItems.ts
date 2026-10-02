import type { ShelfItem } from './types'

/** Стартовые данные для шагов 1–4. Позже заменишь на storage/query. */
export const mockItems: ShelfItem[] = [
  {
    id: '1',
    title: 'React Docs — Describing the UI',
    url: 'https://react.dev/learn/describing-the-ui',
    note: 'Официальный путь: компоненты, JSX, props.',
    tags: ['react', 'docs'],
    status: 'reading',
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'You Might Not Need an Effect',
    url: 'https://react.dev/learn/you-might-not-need-an-effect',
    note: 'Антипаттерны useEffect — must-read перед шагом 5.',
    tags: ['react', 'hooks'],
    status: 'to-read',
    createdAt: '2026-09-02T12:00:00.000Z',
  },
  {
    id: '3',
    title: 'TanStack Query — Important Defaults',
    url: 'https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults',
    note: 'Почему staleTime и cache важны.',
    tags: ['react-query', 'data'],
    status: 'to-read',
    createdAt: '2026-09-03T09:30:00.000Z',
  },
  {
    id: '4',
    title: 'Vue → React: composables vs hooks',
    note: 'Свои заметки после bridge-курса.',
    tags: ['notes', 'vue'],
    status: 'done',
    createdAt: '2026-08-28T18:00:00.000Z',
  },
  {
    id: '5',
    title: 'CSS for Designers Who Hate CSS — layout notes',
    note: 'В Signal Shelf вёрстку делает наставник; тебе — логика.',
    tags: ['css', 'meta'],
    status: 'done',
    createdAt: '2026-08-20T14:00:00.000Z',
  },
]
