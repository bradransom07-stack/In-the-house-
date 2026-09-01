import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type {
  AvailabilityWindow,
  HouseholdState,
  Job,
  MealType,
  Person,
  ScheduledSlot,
  ShoppingCategory,
} from './types'
import { completionKey } from './types'

const win = (day: AvailabilityWindow['day'], start: string, end: string): AvailabilityWindow => ({
  id: uuid(),
  day,
  start,
  end,
})

type SeedPeople = [gina: Person, trish: Person, brad: Person, jack: Person, bella: Person]

function seedPeople(): SeedPeople {
  const gina: Person = {
    id: uuid(),
    name: 'Gina',
    role: 'helper',
    color: '#0ea5e9',
    // An ad hoc day from 5:30am to ~7pm — quiet mid-day rest once everyone's
    // out, minus the specific fixed commitments we know about: Thursday's
    // 8-9am late-start school run, and Tuesday's 2:20-3:20pm Bella pickup.
    availability: [
      win(1, '05:30', '19:00'), // Mon
      win(2, '05:30', '14:20'), // Tue (part 1) — before Bella's pickup
      win(2, '15:20', '19:00'), // Tue (part 2) — after Bella's pickup
      win(3, '05:30', '19:00'), // Wed
      win(4, '05:30', '08:00'), // Thu (part 1) — before the late-start school run
      win(4, '09:00', '19:00'), // Thu (part 2) — after the late-start school run
      win(5, '05:30', '19:00'), // Fri
    ],
  }
  const trish: Person = {
    id: uuid(),
    name: 'Trish',
    role: 'family',
    color: '#a855f7',
    availability: [0, 6].map((d) => win(d as AvailabilityWindow['day'], '10:00', '12:00')),
  }
  const brad: Person = {
    id: uuid(),
    name: 'Brad',
    role: 'family',
    color: '#f97316',
    availability: [0, 1, 2, 3, 4, 5, 6].map((d) => win(d as AvailabilityWindow['day'], '19:00', '20:30')),
  }
  // Jack and Bella start with no availability set — add windows in the People tab
  // once you've decided which chores are age-appropriate for them.
  const jack: Person = {
    id: uuid(),
    name: 'Jack',
    role: 'family',
    color: '#22c55e',
    availability: [],
  }
  const bella: Person = {
    id: uuid(),
    name: 'Bella',
    role: 'family',
    color: '#ec4899',
    availability: [],
  }
  return [gina, trish, brad, jack, bella]
}

function seedJobs([gina, trish, brad, jack, bella]: SeedPeople): Job[] {
  const base = (partial: Partial<Job> & Pick<Job, 'title' | 'category' | 'durationMinutes' | 'priority'>): Job => ({
    id: uuid(),
    notes: '',
    dueDate: null,
    recurrence: 'none',
    eligiblePersonIds: [],
    lockedPersonId: null,
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
      lockedPersonId: gina.id,
    }),
    base({
      title: 'Laundry — wash & fold',
      category: 'laundry',
      durationMinutes: 60,
      priority: 'medium',
      recurrence: 'weekly',
      lockedPersonId: gina.id,
    }),
    base({
      title: 'Grocery run',
      category: 'errands',
      durationMinutes: 60,
      priority: 'high',
      recurrence: 'weekly',
      eligiblePersonIds: [trish.id, brad.id],
    }),
    base({
      title: 'Kids bedtime routine',
      category: 'kids',
      durationMinutes: 30,
      priority: 'high',
      recurrence: 'daily',
      eligiblePersonIds: [trish.id, brad.id],
    }),
    base({
      title: 'Cook dinner',
      category: 'cooking',
      durationMinutes: 45,
      priority: 'high',
      recurrence: 'daily',
      lockedPersonId: gina.id,
    }),
    base({
      title: 'Fix leaking kitchen tap',
      category: 'maintenance',
      durationMinutes: 30,
      priority: 'low',
    }),
    base({
      title: 'Pay bills',
      category: 'other',
      durationMinutes: 15,
      priority: 'medium',
      recurrence: 'weekly',
      lockedPersonId: trish.id,
    }),
    base({
      title: 'Walk Snoop Dog (morning)',
      category: 'pets',
      durationMinutes: 20,
      priority: 'high',
      recurrence: 'daily',
      lockedPersonId: gina.id,
    }),
    base({
      title: 'Walk Snoop Dog (afternoon)',
      category: 'pets',
      durationMinutes: 20,
      priority: 'high',
      recurrence: 'daily',
      lockedPersonId: gina.id,
    }),
    base({
      title: 'Walk Snoop Dog (evening)',
      category: 'pets',
      durationMinutes: 20,
      priority: 'high',
      recurrence: 'daily',
      lockedPersonId: gina.id,
    }),
    base({
      title: 'Feed Yupi Hamster',
      category: 'pets',
      durationMinutes: 5,
      priority: 'medium',
      recurrence: 'daily',
      eligiblePersonIds: [trish.id, brad.id, jack.id, bella.id],
    }),
    base({
      title: "Plan tomorrow",
      notes: 'Sit down and think through what tomorrow needs: school runs, activities, meals, pickups.',
      category: 'other',
      durationMinutes: 15,
      priority: 'medium',
      recurrence: 'daily',
      lockedPersonId: gina.id,
    }),
  ]
}

interface HouseholdActions {
  addPerson: (p: Omit<Person, 'id' | 'availability'>) => void
  updatePerson: (id: string, patch: Partial<Omit<Person, 'id'>>) => void
  removePerson: (id: string) => void
  addAvailability: (personId: string, w: Omit<AvailabilityWindow, 'id'>) => void
  removeAvailability: (personId: string, windowId: string) => void

  addJob: (j: Omit<Job, 'id' | 'createdAt' | 'archived'>) => void
  updateJob: (id: string, patch: Partial<Omit<Job, 'id'>>) => void
  removeJob: (id: string) => void

  setSchedule: (slots: ScheduledSlot[]) => void
  reassignSlot: (slotId: string, personId: string) => void
  removeSlot: (slotId: string) => void

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
      schedule: [],
      completions: {},
      lastOptimizedAt: null,
      meals: [],
      shoppingList: [],

      addPerson: (p) =>
        set((s) => ({
          people: [...s.people, { ...p, id: uuid(), availability: [] }],
        })),
      updatePerson: (id, patch) =>
        set((s) => ({
          people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePerson: (id) =>
        set((s) => ({
          people: s.people.filter((p) => p.id !== id),
          jobs: s.jobs.map((j) => ({
            ...j,
            eligiblePersonIds: j.eligiblePersonIds.filter((pid) => pid !== id),
            lockedPersonId: j.lockedPersonId === id ? null : j.lockedPersonId,
          })),
          schedule: s.schedule.filter((sl) => sl.personId !== id),
        })),
      addAvailability: (personId, w) =>
        set((s) => ({
          people: s.people.map((p) =>
            p.id === personId
              ? { ...p, availability: [...p.availability, { ...w, id: uuid() }] }
              : p,
          ),
        })),
      removeAvailability: (personId, windowId) =>
        set((s) => ({
          people: s.people.map((p) =>
            p.id === personId
              ? { ...p, availability: p.availability.filter((w) => w.id !== windowId) }
              : p,
          ),
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
          schedule: s.schedule.filter((sl) => sl.jobId !== id),
        })),

      setSchedule: (slots) => set({ schedule: slots, lastOptimizedAt: new Date().toISOString() }),
      reassignSlot: (slotId, personId) =>
        set((s) => ({
          schedule: s.schedule.map((sl) => (sl.id === slotId ? { ...sl, personId } : sl)),
        })),
      removeSlot: (slotId) =>
        set((s) => ({ schedule: s.schedule.filter((sl) => sl.id !== slotId) })),

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
    { name: 'in-the-house-store' },
  ),
)
