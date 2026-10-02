import { Link, useParams } from 'react-router-dom'

/**
 * Оболочка детали. Логику (найти item по id) подключишь на шаге 7.
 */
export function DetailPage() {
  const { id } = useParams()

  return (
    <article className="panel">
      <div className="todo-banner">
        <strong>Шаг 7.</strong> Найди элемент по <code>id</code> и заполни панель. Сейчас — заглушка.
      </div>
      <p className="shell__eyebrow">Signal · detail</p>
      <h2 className="panel__title">Материал #{id}</h2>
      <p className="panel__muted">
        Здесь будет title, note, tags, status и ссылка наружу — когда дойдёшь до роутинга детали.
      </p>
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
