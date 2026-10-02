import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type { ShelfItem, ShelfStatus } from '../data/types'

type EditPageProps = {
  mode: 'create' | 'edit',
  onAdd?: (item: ShelfItem) => void
}

/** Значения полей формы (UI). tags — строка, в ShelfItem станет string[]. */
type FormValues = {
  title: string
  url: string
  note: string
  tagsText: string
  status: ShelfStatus
}

function parseTags(text: string): string[] {
  return text
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Шаг 3: create-форма на react-hook-form.
 * Edit по id — шаг 8 (пока те же поля, без загрузки item).
 */
export function EditPage({ mode, onAdd }: EditPageProps) {
  const pageTitle = mode === 'create' ? 'Новый сигнал' : 'Редактирование'
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      url: '',
      note: '',
      tagsText: '',
      status: 'to-read',
    },
  })

  const onSubmit = (data: FormValues) => {
    // шаг 3: собираем item и логируем; add в полку — шаг 4
    const item: ShelfItem = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      url: data.url.trim(),
      note: data.note.trim(),
      tags: parseTags(data.tagsText),
      status: data.status,
      createdAt: new Date().toISOString(),
    }
    // console.log(item)
    reset();
    onAdd(item);
    navigate('/');
  }

  return (
    <section className="panel">
      <div className="todo-banner">
        <strong>{mode === 'create' ? 'Шаг 3' : 'Шаг 8'}.</strong> Форма на react-hook-form.
        Save → смотри Console (добавление на полку — шаг 4).
      </div>
      <h2 className="panel__title">{pageTitle}</h2>
      <p className="panel__muted">Controlled через RHF (<code>register</code>), не ручной useState.</p>

      <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            placeholder="Название материала"
            {...register('title', {
              required: 'Укажи название',
              validate: (v) => v.trim().length > 0 || 'Укажи название',
            })}
          />
          {errors.title ? <p className="field__error">{errors.title.message}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="url">URL</label>
          <input
            id="url"
            placeholder="https://…"
            {...register('url', {
              required: 'Укажи URL',
              validate: (v) => isHttpUrl(v.trim()) || 'Нужен адрес http:// или https://',
            })}
          />
          {errors.url ? <p className="field__error">{errors.url.message}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="note">Note</label>
          <textarea
            id="note"
            placeholder="Коротко, зачем сохранил"
            {...register('note', {
              required: 'Укажи заметку',
              validate: (v) => v.trim().length > 0 || 'Укажи заметку',
            })}
          />
          {errors.note ? <p className="field__error">{errors.note.message}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="tagsText">Tags</label>
          <input
            id="tagsText"
            placeholder="react, hooks"
            {...register('tagsText', {
              required: 'Нужен хотя бы один тег',
              validate: (v) => parseTags(v).length > 0 || 'Нужен хотя бы один тег',
            })}
          />
          {errors.tagsText ? <p className="field__error">{errors.tagsText.message}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" {...register('status', { required: true })}>
            <option value="to-read">To read</option>
            <option value="reading">Reading</option>
            <option value="done">Done</option>
          </select>
          {errors.status ? <p className="field__error">{errors.status.message}</p> : null}
        </div>

        <div className="form-actions">
          <button className="btn btn--primary" type="submit">
            Сохранить
          </button>
          <Link className="btn" to="/">
            Отмена
          </Link>
        </div>
      </form>
    </section>
  )
}
