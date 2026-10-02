export type ShelfStatus = 'to-read' | 'reading' | 'done'

export type ShelfItem = {
  id: string
  title: string
  url?: string
  note?: string
  tags: string[]
  status: ShelfStatus
  createdAt: string
}
