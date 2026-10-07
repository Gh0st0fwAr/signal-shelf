import { mockItems } from '../data/mockItems'
import type { ShelfItem } from '../data/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const KEY = 'shelf-card-items'

function readStorage(): ShelfItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return [...mockItems]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [...mockItems]
    return parsed as ShelfItem[]
  } catch {
    return [...mockItems]
  }
}

function writeStorage(items: ShelfItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items))
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function useShelfItems() {
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['shelf-items'],
    queryFn: async () => {
      await sleep(500)
      return readStorage()
    },
  })

  const onAddMutation = useMutation({
    mutationFn: async (item: ShelfItem) => {
      await sleep(500)
      const current = readStorage()
      const next = [item, ...current]
      writeStorage(next)
      return item
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shelf-items'] })
    },
  })

  const onDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await sleep(500)
      const current = readStorage()
      const next = current.filter((item) => item.id !== id)
      writeStorage(next)
      return id
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shelf-items'] })
    },
  })

  const onUpdateMutation = useMutation({
    mutationFn: async (item: ShelfItem) => {
      await sleep(500)
      const current = readStorage()
      const next = current.map((i) => (i.id === item.id ? item : i))
      writeStorage(next)
      return item
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shelf-items'] })
    },
  })

  const addItem = (item: ShelfItem) => onAddMutation.mutate(item)
  const deleteItem = (id: string) => onDeleteMutation.mutate(id)
  const updateItem = (next: ShelfItem) => onUpdateMutation.mutate(next)

  return {
    items: data ?? [],
    isPending,
    isError,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    addItem,
    deleteItem,
    updateItem,
    refetch,
  }
}
