import { addDays, format } from 'date-fns'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type {
  HouseholdState,
  InstanceOverride,
  Job,
  MealType,
  Person,
  ShoppingCategory,
} from './types'
import { completionKey } from './types'

type SeedPeople = [gina: Person, trish: Person, brad: Person, jack: Person, bella: Person]

function seedPeople(): SeedPeople {
  const gina: Person = { id: uuid(), name: 'Gina', role: 'helper', color: '#0ea5e9' }
  const trish: Person = { id: uuid(), name: 'Trish', role: 'family', color: '#a855f7' }
  const brad: Person = { id: uuid(), name: 'Brad', role: 'family', color: '#f97316' }
  const jack: Person = { id: uuid(), name: 'Jack', role: 'family', color: '#22c55e' }
  const bella: Person = { id: uuid(), name: 'Bella', role: 'family', color: '#ec4899' }
  return [gina, trish, brad, jack, bella]
}

function seedJobs([gina, trish, brad]: SeedPeople): Job[] {
  const base = (
    partial: Partial<Job> &
      Pick<Job, 'title' | 'category' | 'durationMinutes' | 'priority' | 'assignedPersonId'>,
  ): Job => ({
    id: uuid(),
    notes: '',
    recurrence: 'none',
    weekday: null,
    dueDate: null,
    time: null,
    archived: false,
    createdAt: new Date().toISOString(),
    ...partial,
  })

  return [
    base({
      title: 'Vacuum & mop downstairs',
      category: 'cleaning',
      durationMinutes: 45,
      priority: 'medium',
      recurrence: 'weekly',
      weekday: 1, // Monday
      assignedPersonId: gina.id,
    }),
    base({
      title: 'Laundry — wash & fold',
      category: 'laundry',
      durationMinutes: 60,
      priority: 'medium',
      recurrence: 'weekly',
      weekday: 3, // Wednesday
      assignedPersonId: gina.id,
    }),
    base({
      title: 'Grocery run',
      category: 'errands',
      durationMinutes: 60,
      priority: 'high',
      recurrence: 'weekly',
      weekday: 6, // Saturday
      notes: 'Usually Trish or Brad — reassign per week from the Schedule tab if it swaps.',
      assignedPersonId: trish.id,
    }),
    base({
      title: 'Kids bedtime routine',
      category: 'kids',
      durationMinutes: 30,
      priority: 'high',
      recurrence: 'daily',
      time: '19:00',
      notes: 'Usually Trish or Brad — reassign per day from the Schedule tab if it swaps.',
      assignedPersonId: trish.id,
    }),
    base({
      title: 'Cook dinner',
      category: 'cooking',
      durationMinutes: 45,
      priority: 'high',
      recurrence: 'daily',
      time: '18:00',
      assignedPersonId: gina.id,
    }),
    base({
      title: 'Fix leaking kitchen tap',
      category: 'maintenance',
      durationMinutes: 30,
      priority: 'low',
      recurrence: 'none',
      dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      assignedPersonId: brad.id,
    }),
    base({
      title: 'Pay bills',
      category: 'other',
      durationMinutes: 15,
      priority: 'medium',
      recurrence: 'weekly',
      weekday: 2, // Tuesday
      time: '09:00',
      assignedPersonId: trish.id,
    }),
    base({
      title: 'Walk Snoop Dog (morning)',
      category: 'pets',
      durationMinutes: 20,
      priority: 'high',
      recurrence: 'daily',
      time: '07:00',
      assignedPersonId: gina.id,
    }),
    base({
      title: 'Walk Snoop Dog (afternoon)',
      category: 'pets',
      durationMinutes: 20,
      priority: 'high',
      recurrence: 'daily',
      time: '13:00',
      assignedPersonId: gina.id,
    }),
    base({
      title: 'Walk Snoop Dog (evening)',
      category: 'pets',
      durationMinutes: 20,
      priority: 'high',
      recurrence: 'daily',
      time: '19:30',
      assignedPersonId: gina.id,
    }),
    base({
      title: 'Feed Yupi Hamster',
      category: 'pets',
      durationMinutes: 5,
      priority: 'medium',
      recurrence: 'daily',
      assignedPersonId: brad.id,
    }),
    base({
      title: 'Plan tomorrow',
      notes: 'Sit down and think through what tomorrow needs: school runs, activities, meals, pickups.',
      category: 'other',
      durationMinutes: 15,
      priority: 'medium',
      recurrence: 'daily',
      time: '19:45',
      assignedPersonId: gina.id,
    }),
  ]
}

interface HouseholdActions {
  addPerson: (p: Omit<Person, 'id'>) => void
  updatePerson: (id: string, patch: Partial<Omit<Person, 'id'>>) => void
  removePerson: (id: string) => void

  addJob: (j: Omit<Job, 'id' | 'createdAt' | 'archived'>) => void
  updateJob: (id: string, patch: Partial<Omit<Job, 'id'>>) => void
  removeJob: (id: string) => void

  /** Sets a one-off override (person/time/skip) for a single occurrence of a job. */
  setInstanceOverride: (jobId: string, date: string, patch: InstanceOverride) => void
  clearInstanceOverride: (jobId: string, date: string) => void

  toggleCompletion: (jobId: string, date: string) => void

  /** Upserts the meal for a date+mealType; clearing both title and notes removes the entry. */
  setMeal: (date: string, mealType: MealType, title: string, notes?: string) => void
  removeMeal: (id: string) => void

  addShoppingItem: (item: { name: string; quantity?: string; category?: ShoppingCategory }) => void
  toggleShoppingItem: (id: string) => void
  removeShoppingItem: (id: string) => void
  clearCheckedShoppingItems: () => void
}

export type HouseholdStore = HouseholdState & HouseholdActions

const initialPeople = seedPeople()

export const useHousehold = create<HouseholdStore>()(
  persist(
    (set) => ({
      people: initialPeople,
      jobs: seedJobs(initialPeople),
      overrides: {},
      completions: {},
      meals: [],
      shoppingList: [],

      addPerson: (p) => set((s) => ({ people: [...s.people, { ...p, id: uuid() }] })),
      updatePerson: (id, patch) =>
        set((s) => ({
          people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePerson: (id) =>
        set((s) => ({
          people: s.people.filter((p) => p.id !== id),
        })),

      addJob: (j) =>
        set((s) => ({
          jobs: [
            ...s.jobs,
            { ...j, id: uuid(), createdAt: new Date().toISOString(), archived: false },
          ],
        })),
      updateJob: (id, patch) =>
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
        })),
      removeJob: (id) =>
        set((s) => ({
          jobs: s.jobs.filter((j) => j.id !== id),
          overrides: Object.fromEntries(
            Object.entries(s.overrides).filter(([key]) => !key.startsWith(`${id}__`)),
          ),
        })),

      setInstanceOverride: (jobId, date, patch) =>
        set((s) => {
          const key = completionKey(jobId, date)
          return { overrides: { ...s.overrides, [key]: { ...s.overrides[key], ...patch } } }
        }),
      clearInstanceOverride: (jobId, date) =>
        set((s) => {
          const key = completionKey(jobId, date)
          if (!(key in s.overrides)) return {}
          const rest = { ...s.overrides }
          delete rest[key]
          return { overrides: rest }
        }),

      toggleCompletion: (jobId, date) =>
        set((s) => {
          const key = completionKey(jobId, date)
          return { completions: { ...s.completions, [key]: !s.completions[key] } }
        }),

      setMeal: (date, mealType, title, notes = '') =>
        set((s) => {
          const existing = s.meals.find((m) => m.date === date && m.mealType === mealType)
          if (!title.trim() && !notes.trim()) {
            return { meals: existing ? s.meals.filter((m) => m.id !== existing.id) : s.meals }
          }
          if (existing) {
            return {
              meals: s.meals.map((m) => (m.id === existing.id ? { ...m, title, notes } : m)),
            }
          }
          return { meals: [...s.meals, { id: uuid(), date, mealType, title, notes }] }
        }),
      removeMeal: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),

      addShoppingItem: ({ name, quantity = '', category = 'other' }) =>
        set((s) => ({
          shoppingList: [
            ...s.shoppingList,
            { id: uuid(), name, quantity, category, checked: false, addedAt: new Date().toISOString() },
          ],
        })),
      toggleShoppingItem: (id) =>
        set((s) => ({
          shoppingList: s.shoppingList.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
        })),
      removeShoppingItem: (id) =>
        set((s) => ({ shoppingList: s.shoppingList.filter((i) => i.id !== id) })),
      clearCheckedShoppingItems: () =>
        set((s) => ({ shoppingList: s.shoppingList.filter((i) => !i.checked) })),
    }),
    // Bumped from 'in-the-house-store': the job/schedule shape changed (no more
    // availability windows or optimizer output), so old persisted data can't be reused.
    { name: 'in-the-house-store-v2' },
  ),
)
