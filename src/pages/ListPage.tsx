/**
 * STEP 1 — твоя зона.
 * Импортируй mockItems и ShelfCard, отрисуй сетку через .map().
 * Не правь CSS и не меняй AppShell.
 */
import { mockItems } from '../data/mockItems';
import { ShelfCard } from '../components/ShelfCard';
import { useState } from 'react';
import type { ShelfItem, ShelfStatus } from '../data/types';

type StatusFilterF = 'all' | ShelfStatus;
type ListPageProps = {
  items: ShelfItem[]
  onDelete: (id: string) => void
}
export function ListPage({ items, onDelete }: ListPageProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterF>('all');
  const filteredItems = items.filter(item => {
    const cleanQuery = query.toLowerCase().trim();
  
    const matchesSearch =
      !cleanQuery ||
      item.title.toLowerCase().includes(cleanQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(cleanQuery));
    
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
    
      return matchesSearch && matchesStatus;
    });

  return (
    <>
      <div className="todo-banner">
        <strong>Шаг 1.</strong> Отрисуй карточки из <code>mockItems</code> через{' '}
        <code>ShelfCard</code>. Пока список пуст — это нормально.
      </div>

      <div className="toolbar">
        <input
          className="toolbar__search"
          placeholder="Введите имя, статус или тег..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="toolbar__chips">
          <button onClick={() => setStatusFilter('all')} type="button" className={statusFilter === 'all' ? 'chip is-active' : 'chip'}>
            All
          </button>
          <button onClick={() => setStatusFilter('to-read')} type="button" className={statusFilter === 'to-read' ? 'chip is-active' : 'chip'}>
            To read
          </button>
          <button onClick={() => setStatusFilter('reading')} type="button" className={statusFilter === 'reading' ? 'chip is-active' : 'chip'}>
            Reading
          </button>
          <button onClick={() => setStatusFilter('done')} type="button" className={statusFilter === 'done' ? 'chip is-active' : 'chip'}>
            Done
          </button>
        </div>
      </div>

      {/* TODO(step-1): замени empty на <div className="shelf-grid">…</div> */}
      {filteredItems.length === 0 ? (
        <div className="empty">
          <p className="empty__title">Ничего не найдено</p>
          <p>Сбрось поиск или выбери другой статус.</p>
        </div>
      ) : (
        <div className="shelf-grid">
          {filteredItems.map((item) => (
            <ShelfCard key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  )
}
