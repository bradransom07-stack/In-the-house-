import { useMemo, useState } from 'react'
import { useHousehold } from '../store'
import { Card } from './ui'
import { formatDateLabel, horizonDates } from '../lib/dates'
import { MEAL_TYPES } from '../lib/constants'
import type { MealType } from '../types'

const HORIZON_DAYS = 7

export function MealPlanView() {
  const dates = useMemo(() => horizonDates(HORIZON_DAYS), [])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Meal plan</h2>
        <p className="text-xs text-slate-500">
          Plan the week's meals. "Cook dinner" on the Today tab will show whatever you put here.
        </p>
      </div>

      <div className="space-y-2">
        {dates.map((date) => (
          <Card key={date} className="p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {formatDateLabel(date)}
            </h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {MEAL_TYPES.map((mt) => (
                <MealCell key={mt.value} date={date} mealType={mt.value} />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function MealCell({ date, mealType }: { date: string; mealType: MealType }) {
  const entry = useHousehold((s) => s.meals.find((m) => m.date === date && m.mealType === mealType))
  const setMeal = useHousehold((s) => s.setMeal)
  const meta = MEAL_TYPES.find((m) => m.value === mealType)!

  const [value, setValue] = useState(entry?.title ?? '')

  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-xs text-slate-400">
        {meta.emoji} {meta.label}
      </span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (value !== (entry?.title ?? '')) setMeal(date, mealType, value)
        }}
        placeholder="Not planned"
        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
      />
    </label>
  )
}
