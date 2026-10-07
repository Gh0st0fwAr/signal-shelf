import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useContext } from 'react'
import { AppShell } from './components/AppShell'
import { DetailPage } from './pages/DetailPage'
import { EditPage } from './pages/EditPage'
import { ListPage } from './pages/ListPage'
import { useShelfItems } from './hooks/useShelfItems'
import { UiPrefsContext } from './main'
import './styles/layout.css'
import './styles/shelf.css'

export function useUiPrefs() {
  const ctx = useContext(UiPrefsContext)
  if (ctx == null) {
    throw new Error('useUiPrefs must be used within UiPrefsProvider')
  }
  return ctx
}

export default function App() {
  const {
    items,
    isPending,
    isError,
    error,
    addItem,
    deleteItem,
    updateItem,
    refetch,
  } = useShelfItems()

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell>
        <Routes>
          <Route
            path="/"
            element={
              <ListPage
                items={items}
                isPending={isPending}
                isError={isError}
                error={error}
                onRefetch={refetch}
                onDelete={deleteItem}
              />
            }
          />
          <Route path="/new" element={<EditPage mode="create" onAdd={addItem} />} />
          <Route
            path="/item/:id"
            element={
              <DetailPage
                items={items}
                isPending={isPending}
                isError={isError}
                error={error}
                onRefetch={refetch}
              />
            }
          />
          <Route
            path="/item/:id/edit"
            element={
              <EditPage
                mode="edit"
                items={items}
                isPending={isPending}
                isError={isError}
                error={error}
                onRefetch={refetch}
                onUpdate={updateItem}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
