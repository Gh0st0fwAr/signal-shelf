import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useUiPrefs } from '../App'

type AppShellProps = {
  children: ReactNode
  tagline?: string
}

export function AppShell({
  children,
  tagline = 'Личная полка материалов — React + TypeScript',
}: AppShellProps) {
  const { density, accent, setDensity, setAccent } = useUiPrefs()

  return (
    <div className="shell" data-accent={accent} data-density={density}>
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
          <button className="btn" onClick={() => setDensity(density === 'comfortable' ? 'compact' : 'comfortable')}>Size</button>
          <button className="btn" onClick={() => setAccent(accent === 'warm' ? 'cool' : 'warm')}>Accent</button>
        </nav>
      </header>
      <main className="shell__main">{children}</main>
    </div>
  )
}
