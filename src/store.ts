import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type {
  AvailabilityWindow,
  HouseholdState,
  Job,
  Person,
  ScheduledSlot,
} from './types'
import { completionKey } from './types'

const win = (day: AvailabilityWindow['day'], start: string, end: string): AvailabilityWindow => ({
  id: uuid(),
  day,
  start,
  end,
})

function seedPeople(): [Person, Person, Person] {
  const helper: Person = {
    id: uuid(),
    name: 'Helper',
    role: 'helper',
    color: '#0ea5e9',
    availability: [1, 2, 3, 4, 5].map((d) => win(d as AvailabilityWindow['day'], '09:00', '15:00')),
  }
  const parent1: Person = {
    id: uuid(),
    name: 'Parent 1',
    role: 'family',
    color: '#a855f7',
    availability: [0, 6].map((d) => win(d as AvailabilityWindow['day'], '10:00', '12:00')),
  }
  const parent2: Person = {
    id: uuid(),
    name: 'Parent 2',
    role: 'family',
    color: '#f97316',
    availability: [0, 1, 2, 3, 4, 5, 6].map((d) => win(d as AvailabilityWindow['day'], '19:00', '20:30')),
  }
  return [helper, parent1, parent2]
}

function seedJobs([helper, parent1, parent2]: [Person, Person, Person]): Job[] {
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
      lockedPersonId: helper.id,
    }),
    base({
      title: 'Laundry — wash & fold',
      category: 'laundry',
      durationMinutes: 60,
      priority: 'medium',
      recurrence: 'weekly',
      lockedPersonId: helper.id,
    }),
    base({
      title: 'Grocery run',
      category: 'errands',
      durationMinutes: 60,
      priority: 'high',
      recurrence: 'weekly',
      eligiblePersonIds: [parent1.id, parent2.id],
    }),
    base({
      title: 'Kids bedtime routine',
      category: 'kids',
      durationMinutes: 30,
      priority: 'high',
      recurrence: 'daily',
      eligiblePersonIds: [parent1.id, parent2.id],
    }),
    base({
      title: 'Cook dinner',
      category: 'cooking',
      durationMinutes: 45,
      priority: 'high',
      recurrence: 'daily',
    }),
    base({
      title: 'Fix leaking kitchen tap',
      category: 'maintenance',
      durationMinutes: 30,
      priority: 'low',
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
    }),
    { name: 'in-the-house-store' },
  ),
)
