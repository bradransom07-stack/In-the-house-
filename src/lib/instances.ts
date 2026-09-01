import { getDay } from 'date-fns'
import type { InstanceOverride, Job, Weekday } from '../types'
import { completionKey } from '../types'

export interface JobInstance {
  job: Job
  /** yyyy-MM-dd */
  date: string
  personId: string
  /** "HH:mm", or null if untimed */
  time: string | null
  skipped: boolean
}

/**
 * Deterministically projects each job's recurrence onto the given dates,
 * applying any per-occurrence overrides. Every job that recurs on a date
 * produces exactly one instance — there's no fitting or failure state,
 * since assignment is always explicit (the job's default, or an override).
 */
export function buildInstances(
  jobs: Job[],
  overrides: Record<string, InstanceOverride>,
  dates: string[],
): JobInstance[] {
  const instances: JobInstance[] = []

  for (const job of jobs) {
    if (job.archived) continue

    for (const date of dates) {
      const weekday = getDay(new Date(date + 'T00:00:00')) as Weekday
      const occurs =
        job.recurrence === 'daily'
          ? true
          : job.recurrence === 'weekly'
            ? job.weekday === weekday
            : job.dueDate === date
      if (!occurs) continue

      const override = overrides[completionKey(job.id, date)]

      instances.push({
        job,
        date,
        personId: override?.personId ?? job.assignedPersonId,
        time: override && 'time' in override ? (override.time ?? null) : job.time,
        skipped: override?.skipped ?? false,
      })
    }
  }

  return instances.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    if (a.time && b.time) return a.time.localeCompare(b.time)
    if (a.time) return -1
    if (b.time) return 1
    return 0
  })
}
