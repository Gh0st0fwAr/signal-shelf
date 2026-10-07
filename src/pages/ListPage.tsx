import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ShelfCard } from '../components/ShelfCard'
import type { ShelfItem, ShelfStatus } from '../data/types'

type StatusFilter = 'all' | ShelfStatus

type ListPageProps = {
  items: ShelfItem[]
  isPending: boolean
  isError: boolean
  error: Error | null
  onDelete: (id: string) => void
  onRefetch: () => void
}

export function ListPage({
  items,
  isPending,
  isError,
  error,
  onDelete,
  onRefetch,
}: ListPageProps) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredItems = items.filter((item) => {
    const cleanQuery = query.toLowerCase().trim()
    const matchesSearch =
      !cleanQuery ||
      item.title.toLowerCase().includes(cleanQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(cleanQuery))
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isError) {
    return (
      <div className="empty">
        <p className="empty__title">Не удалось загрузить полку</p>
        <p>{error?.message ?? 'Неизвестная ошибка'}</p>
        <button type="button" className="btn btn--primary" onClick={() => onRefetch()}>
          Повторить
        </button>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="empty">
        <p className="empty__title">Загрузка полки…</p>
      </div>
    )
  }

  const toolbar = (
    <div className="toolbar">
      <input
        className="toolbar__search"
        placeholder="Введите имя, статус или тег..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="toolbar__chips">
        {(
          [
            ['all', 'All'],
            ['to-read', 'To read'],
            ['reading', 'Reading'],
            ['done', 'Done'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={statusFilter === value ? 'chip is-active' : 'chip'}
            onClick={() => setStatusFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )

  if (items.length === 0) {
    return (
      <>
        {toolbar}
        <div className="empty">
          <p className="empty__title">Полка пуста</p>
          <p>Добавь первый материал — и он появится здесь.</p>
          <Link className="btn btn--primary" to="/new">
            Добавить
          </Link>
        </div>
      </>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <>
        {toolbar}
        <div className="empty">
          <p className="empty__title">Ничего не найдено</p>
          <p>Сбрось поиск или выбери другой статус.</p>
        </div>
      </>
    )
  }

  return (
    <>
      {toolbar}
      <div className="shelf-grid">
        {filteredItems.map((item) => (
          <ShelfCard key={item.id} item={item} onDelete={onDelete} />
        ))}
      </div>
    </>
  )
}
