import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
  /** Краткий подзаголовок под брендом */
  tagline?: string
}

export function AppShell({
  children,
  tagline = 'Личная полка материалов — pet на React + TypeScript',
}: AppShellProps) {
  return (
    <div className="shell">
      <header className="shell__top">
        <div className="shell__brand">
          <p className="shell__eyebrow">Portfolio pet</p>
          <h1 className="shell__title">Signal Shelf</h1>
          <p className="shell__tagline">{tagline}</p>
        </div>
        <nav className="shell__nav" aria-label="Основная">
          <NavLink to="/" end>
            Полка
          </NavLink>
          <NavLink to="/new">Добавить</NavLink>
          <Link className="btn btn--primary" to="/new">
            + Новый сигнал
          </Link>
        </nav>
      </header>
      <main className="shell__main">{children}</main>
    </div>
  )
}
