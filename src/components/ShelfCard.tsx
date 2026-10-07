import { Link } from 'react-router-dom'
import type { ShelfItem, ShelfStatus } from '../data/types'

const STATUS_LABEL: Record<ShelfStatus, string> = {
  'to-read': 'To read',
  reading: 'Reading',
  done: 'Done',
}

type ShelfCardProps = {
  item: ShelfItem
  onDelete?: (id: string) => void
}

export function ShelfCard({ item, onDelete }: ShelfCardProps) {
  const statusClass = `shelf-card__status shelf-card__status--${item.status}`
  return (
    <Link className="shelf-card" to={`/item/${item.id}`}>
      <div className="shelf-card__meta">
        <span className={statusClass}>{STATUS_LABEL[item.status]}</span>
        <button
          type="button"
          className="shelf-card__delete"
          onClickCapture={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete?.(item.id)
          }}
        >
          Удалить
        </button>
      </div>
      <h2 className="shelf-card__title">{item.title}</h2>
      {item.note ? (
        <p className="shelf-card__note">{item.note}</p>
      ) : (
        <p className="shelf-card__note">Без заметки</p>
      )}
      <div className="shelf-card__tags">
        {item.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
