import { useMemo, useState } from 'react'
import { useHousehold } from '../store'
import { Button, Card } from './ui'
import { SHOPPING_CATEGORIES } from '../lib/constants'
import type { ShoppingCategory } from '../types'

export function ShoppingListView() {
  const items = useHousehold((s) => s.shoppingList)
  const addItem = useHousehold((s) => s.addShoppingItem)
  const toggleItem = useHousehold((s) => s.toggleShoppingItem)
  const removeItem = useHousehold((s) => s.removeShoppingItem)
  const clearChecked = useHousehold((s) => s.clearCheckedShoppingItems)

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState<ShoppingCategory>('other')

  const submit = () => {
    if (!name.trim()) return
    addItem({ name: name.trim(), quantity: quantity.trim(), category })
    setName('')
    setQuantity('')
  }

  const grouped = useMemo(() => {
    const map = new Map<ShoppingCategory, typeof items>()
    for (const c of SHOPPING_CATEGORIES) map.set(c.value, [])
    for (const item of items) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category)!.push(item)
    }
    return map
  }, [items])

  const checkedCount = items.filter((i) => i.checked).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Shopping list</h2>
          <p className="text-xs text-slate-500">
            {items.length === 0 ? 'Nothing on the list.' : `${items.length - checkedCount} to buy`}
          </p>
        </div>
        {checkedCount > 0 && (
          <Button variant="secondary" onClick={clearChecked}>
            Clear checked ({checkedCount})
          </Button>
        )}
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Item"
            className="min-w-32 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Qty (optional)"
            className="w-28 rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
          >
            {SHOPPING_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
          <Button onClick={submit}>Add</Button>
        </div>
      </Card>

      <div className="space-y-3">
        {SHOPPING_CATEGORIES.map((c) => {
          const list = grouped.get(c.value) ?? []
          if (list.length === 0) return null
          return (
            <Card key={c.value} className="p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {c.emoji} {c.label}
              </h3>
              <ul className="space-y-1">
                {list.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 text-sm dark:border-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                      className="h-4 w-4"
                    />
                    <span className={item.checked ? 'flex-1 text-slate-400 line-through' : 'flex-1'}>
                      {item.name}
                      {item.quantity && <span className="text-slate-400"> · {item.quantity}</span>}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-slate-400 hover:text-red-500"
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
        {items.length === 0 && (
          <Card className="p-6 text-center text-sm text-slate-400">
            Add items above — they'll group by category automatically.
          </Card>
        )}
      </div>
    </div>
  )
}
