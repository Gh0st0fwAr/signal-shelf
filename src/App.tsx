import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DetailPage } from './pages/DetailPage'
import { EditPage } from './pages/EditPage'
import { ListPage } from './pages/ListPage'
import { useShelfItems } from './hooks/useShelfItems'
import './styles/layout.css'
import './styles/shelf.css'


export default function App() {
  
  const { items, addItem, deleteItem } = useShelfItems()
  
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<ListPage items={items} onDelete={deleteItem} />} />
          <Route path="/new" element={<EditPage mode='create' onAdd={addItem} />} />
          <Route path="/item/:id" element={<DetailPage />} />
          <Route path="/item/:id/edit" element={<EditPage mode="edit" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
