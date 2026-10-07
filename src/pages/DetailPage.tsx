import { Link, useParams } from 'react-router-dom'
import type { ShelfItem } from '../data/types'

type DetailPageProps = {
  items: ShelfItem[]
  isPending: boolean
  isError: boolean
  error: Error | null
  onRefetch: () => void
}

export function DetailPage({
  items,
  isPending,
  isError,
  error,
  onRefetch,
}: DetailPageProps) {
  const { id } = useParams()

  if (isError) {
    return (
      <article className="panel">
        <h2 className="panel__title">Не удалось загрузить</h2>
        <p>{error?.message ?? 'Неизвестная ошибка'}</p>
        <button type="button" className="btn btn--primary" onClick={() => onRefetch()}>
          Повторить
        </button>
        <Link className="btn" to="/">
          ← К полке
        </Link>
      </article>
    )
  }

  if (isPending) {
    return (
      <article className="panel">
        <h2 className="panel__title">Загрузка…</h2>
      </article>
    )
  }

  const item = items.find((entry) => entry.id === id)

  if (!item) {
    return (
      <article className="panel">
        <h2 className="panel__title">Не найдено</h2>
        <Link className="btn" to="/">
          ← К полке
        </Link>
      </article>
    )
  }

  return (
    <article className="panel">
      <p className="shell__eyebrow">Signal · detail</p>
      <h2 className="panel__title">{item.title}</h2>
      <p className="panel__note">{item.note}</p>
      {item.tags.map((tag) => (
        <span className="tag" key={tag}>
          {tag}
        </span>
      ))}
      <p className="panel__status">{item.status}</p>
      <a className="btn" href={item.url} target="_blank" rel="noreferrer">
        {item.url}
      </a>

      <div className="detail-actions">
        <Link className="btn" to="/">
          ← К полке
        </Link>
        <Link className="btn btn--primary" to={`/item/${id}/edit`}>
          Редактировать
        </Link>
      </div>
    </article>
  )
}
