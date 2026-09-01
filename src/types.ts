export type Role = 'helper' | 'family'

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday

export interface Person {
  id: string
  name: string
  role: Role
  color: string
}

export type Priority = 'low' | 'medium' | 'high'

export type Recurrence = 'none' | 'daily' | 'weekly'

export type JobCategory =
  | 'cleaning'
  | 'cooking'
  | 'laundry'
  | 'errands'
  | 'kids'
  | 'maintenance'
  | 'pets'
  | 'other'

export interface Job {
  id: string
  title: string
  notes: string
  category: JobCategory
  durationMinutes: number
  priority: Priority
  recurrence: Recurrence
  /** For 'weekly' jobs: which weekday it happens. Unused otherwise. */
  weekday: Weekday | null
  /** For 'none' (one-off) jobs: the specific date (yyyy-MM-dd) it happens. Unused otherwise. */
  dueDate: string | null
  /** Optional fixed time ("HH:mm"). If unset, it's just an untimed to-do for that day. */
  time: string | null
  /** Who's responsible by default — always required, no more "eligible pool". */
  assignedPersonId: string
  archived: boolean
  createdAt: string
}

/** A one-off exception to a job's default assignee/time/occurrence, keyed by jobId+date. */
export interface InstanceOverride {
  personId?: string
  /** Overrides the job's default time for this occurrence. null clears it (untimed). */
  time?: string | null
  /** Hides this occurrence entirely, e.g. "skip laundry this week". */
  skipped?: boolean
}

export type MealType = 'breakfast' | 'lunch' | 'dinner'

export interface MealPlanEntry {
  id: string
  /** yyyy-MM-dd */
  date: string
  mealType: MealType
  title: string
  notes: string
}

export type ShoppingCategory = 'produce' | 'dairy' | 'meat' | 'bakery' | 'pantry' | 'household' | 'other'

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  category: ShoppingCategory
  checked: boolean
  addedAt: string
}

export interface HouseholdState {
  people: Person[]
  jobs: Job[]
  /** key = `${jobId}__${date}` */
  overrides: Record<string, InstanceOverride>
  /** key = `${jobId}__${date}` */
  completions: Record<string, boolean>
  meals: MealPlanEntry[]
  shoppingList: ShoppingItem[]
}

export const completionKey = (jobId: string, date: string) => `${jobId}__${date}`
