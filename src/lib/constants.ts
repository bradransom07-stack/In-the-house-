import type { JobCategory, MealType, Priority, ShoppingCategory } from '../types'

export const CATEGORIES: { value: JobCategory; label: string; emoji: string }[] = [
  { value: 'cleaning', label: 'Cleaning', emoji: '🧹' },
  { value: 'cooking', label: 'Cooking', emoji: '🍳' },
  { value: 'laundry', label: 'Laundry', emoji: '🧺' },
  { value: 'errands', label: 'Errands', emoji: '🛒' },
  { value: 'kids', label: 'Kids', emoji: '🧒' },
  { value: 'maintenance', label: 'Maintenance', emoji: '🔧' },
  { value: 'pets', label: 'Pets', emoji: '🐾' },
  { value: 'other', label: 'Other', emoji: '📌' },
]

export const categoryMeta = (c: JobCategory) => CATEGORIES.find((x) => x.value === c) ?? CATEGORIES[7]

export const PRIORITIES: { value: Priority; label: string; classes: string }[] = [
  { value: 'high', label: 'High', classes: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  {
    value: 'medium',
    label: 'Medium',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    value: 'low',
    label: 'Low',
    classes: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
]

export const priorityMeta = (p: Priority) => PRIORITIES.find((x) => x.value === p) ?? PRIORITIES[1]

export const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🥣' },
  { value: 'lunch', label: 'Lunch', emoji: '🥪' },
  { value: 'dinner', label: 'Dinner', emoji: '🍽️' },
]

export const SHOPPING_CATEGORIES: { value: ShoppingCategory; label: string; emoji: string }[] = [
  { value: 'produce', label: 'Produce', emoji: '🥦' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'meat', label: 'Meat & fish', emoji: '🥩' },
  { value: 'bakery', label: 'Bakery', emoji: '🍞' },
  { value: 'pantry', label: 'Pantry', emoji: '🥫' },
  { value: 'household', label: 'Household', emoji: '🧻' },
  { value: 'other', label: 'Other', emoji: '📦' },
]

export const PERSON_COLORS = [
  '#0ea5e9',
  '#a855f7',
  '#f97316',
  '#22c55e',
  '#ec4899',
  '#eab308',
  '#6366f1',
  '#14b8a6',
]
