export type Role = 'helper' | 'family'

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday

export interface AvailabilityWindow {
  id: string
  day: Weekday
  start: string // "HH:mm"
  end: string // "HH:mm"
}

export interface Person {
  id: string
  name: string
  role: Role
  color: string
  availability: AvailabilityWindow[]
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
  /** Date (yyyy-MM-dd) by which the job (or its first occurrence) should be done. Optional. */
  dueDate: string | null
  recurrence: Recurrence
  /** Person ids allowed to do this job. Empty array = anyone (helper or family). */
  eligiblePersonIds: string[]
  /** If set, this person is locked in and the optimizer won't reassign. */
  lockedPersonId: string | null
  archived: boolean
  createdAt: string
}

export interface ScheduledSlot {
  id: string
  jobId: string
  /** yyyy-MM-dd, the specific day this occurrence falls on */
  date: string
  personId: string
  start: string // ISO datetime
  end: string // ISO datetime
}

export interface HouseholdState {
  people: Person[]
  jobs: Job[]
  schedule: ScheduledSlot[]
  /** key = `${jobId}__${date}` */
  completions: Record<string, boolean>
  lastOptimizedAt: string | null
}

export const completionKey = (jobId: string, date: string) => `${jobId}__${date}`
