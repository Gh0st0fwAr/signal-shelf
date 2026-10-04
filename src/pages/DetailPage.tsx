import { Link, useParams } from 'react-router-dom'
import type { ShelfItem } from '../data/types'

type DetailPageProps = {
  items: ShelfItem[]
}
/**
 * Оболочка детали. Логику (найти item по id) подключишь на шаге 7.
 */
export function DetailPage({ items }: DetailPageProps) {
  const { id } = useParams()
  const item = items.find(item => item.id === id)
  if (!item) {
    return (
      <article className="panel">
        <h2 className="panel__title">Не найдено</h2>
        <Link className="btn" to="/">← К полке</Link>
      </article>
    )
  }
  // console.log(item)

  return (
    <article className="panel">
      {/* <div className="todo-banner">
        <strong>Шаг 7.</strong> Найди элемент по <code>id</code> и заполни панель. Сейчас — заглушка.
      </div> */}
      <p className="shell__eyebrow">Signal · detail</p>
      {/* <h2 className="panel__title">Материал #{id}</h2> */}
      <p className="panel__title">{item.title}</p>
      <p className="panel__note">{item.note}</p>
      {item.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}
      <p className="panel__status">{item.status}</p>
      
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
