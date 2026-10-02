import { mockItems } from "../data/mockItems";
import type { ShelfItem } from "../data/types";
import { useState, useEffect } from "react";

const KEY = 'shelf-card-items';

function readStorage(): ShelfItem[] {
    try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...mockItems]
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...mockItems]
    return parsed as ShelfItem[];
    } catch (e) {
    return [...mockItems];
    }

}

export function useShelfItems() {

    const [items, setItems] = useState<ShelfItem[]>(() => readStorage());

    useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
    }, [items])

    const addItem = (item: ShelfItem) => setItems(prev => [item, ...prev])
    const deleteItem = (id: string) => setItems(prev => prev.filter((item) => item.id !== id))

    return { items, addItem, deleteItem }
}