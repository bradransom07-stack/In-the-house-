import { addDays, differenceInCalendarDays, format, getDay } from 'date-fns'
import { v4 as uuid } from 'uuid'
import type { Job, Person, ScheduledSlot, Weekday } from '../types'
import { completionKey } from '../types'

const priorityWeight: Record<Job['priority'], number> = { high: 3, medium: 2, low: 1 }

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const toHHmm = (mins: number) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

interface JobInstance {
  job: Job
  /** yyyy-MM-dd */
  date: string
  /** the latest date (yyyy-MM-dd) this instance may be scheduled by; equal to date unless the job has flexible one-off scheduling */
  earliestDate: string
  deadlineDate: string
}

function expandInstances(jobs: Job[], horizonDates: string[], today: string): JobInstance[] {
  const instances: JobInstance[] = []
  const horizonSet = new Set(horizonDates)
  const lastHorizonDate = horizonDates[horizonDates.length - 1]

  for (const job of jobs) {
    if (job.archived) continue

    if (job.recurrence === 'daily') {
      for (const date of horizonDates) {
        instances.push({ job, date, earliestDate: date, deadlineDate: date })
      }
      continue
    }

    if (job.recurrence === 'weekly') {
      const anchor = job.dueDate ?? today
      const anchorWeekday = getDay(new Date(anchor + 'T00:00:00')) as Weekday
      for (const date of horizonDates) {
        if ((getDay(new Date(date + 'T00:00:00')) as Weekday) === anchorWeekday) {
          instances.push({ job, date, earliestDate: date, deadlineDate: date })
        }
      }
      continue
    }

    // recurrence === 'none': a single occurrence, flexible between today and its due date (or end of horizon)
    const deadline = job.dueDate && horizonSet.has(job.dueDate) ? job.dueDate : lastHorizonDate
    const earliest = today
    instances.push({ job, date: deadline, earliestDate: earliest, deadlineDate: deadline })
  }

  return instances
}

function urgencyScore(inst: JobInstance, today: string): number {
  const daysUntilDue = differenceInCalendarDays(
    new Date(inst.deadlineDate + 'T00:00:00'),
    new Date(today + 'T00:00:00'),
  )
  return priorityWeight[inst.job.priority] * 1000 - daysUntilDue
}

interface FreeInterval {
  start: number // minutes from midnight
  end: number
}

type Availability = Map<string, Map<string, FreeInterval[]>> // personId -> date -> intervals

function buildAvailability(people: Person[], horizonDates: string[]): Availability {
  const avail: Availability = new Map()
  for (const person of people) {
    const byDate = new Map<string, FreeInterval[]>()
    for (const date of horizonDates) {
      const weekday = getDay(new Date(date + 'T00:00:00')) as Weekday
      const windows = person.availability
        .filter((w) => w.day === weekday)
        .map((w) => ({ start: toMinutes(w.start), end: toMinutes(w.end) }))
        .sort((a, b) => a.start - b.start)
      byDate.set(date, windows)
    }
    avail.set(person.id, byDate)
  }
  return avail
}

function allocate(intervals: FreeInterval[], durationMinutes: number): FreeInterval | null {
  for (const iv of intervals) {
    if (iv.end - iv.start >= durationMinutes) {
      const used = { start: iv.start, end: iv.start + durationMinutes }
      iv.start += durationMinutes
      return used
    }
  }
  return null
}

export interface OptimizeResult {
  slots: ScheduledSlot[]
  unscheduled: { jobId: string; title: string; date: string }[]
}

export function optimizeSchedule(
  people: Person[],
  jobs: Job[],
  completions: Record<string, boolean>,
  horizonDays = 7,
  startDate: Date = new Date(),
): OptimizeResult {
  const today = format(startDate, 'yyyy-MM-dd')
  const horizonDates = Array.from({ length: horizonDays }, (_, i) => format(addDays(startDate, i), 'yyyy-MM-dd'))

  const activeJobs = jobs.filter((j) => !j.archived)
  const rawInstances = expandInstances(activeJobs, horizonDates, today).filter(
    (inst) => !completions[completionKey(inst.job.id, inst.date)],
  )

  const sorted = [...rawInstances].sort((a, b) => urgencyScore(b, today) - urgencyScore(a, today))

  const availability = buildAvailability(people, horizonDates)
  const load = new Map<string, number>(people.map((p) => [p.id, 0]))
  const personById = new Map(people.map((p) => [p.id, p]))

  const slots: ScheduledSlot[] = []
  const unscheduled: OptimizeResult['unscheduled'] = []

  for (const inst of sorted) {
    const eligibleIds = inst.job.lockedPersonId
      ? [inst.job.lockedPersonId]
      : inst.job.eligiblePersonIds.length > 0
        ? inst.job.eligiblePersonIds
        : people.map((p) => p.id)

    const candidateDates = horizonDates.filter(
      (d) => d >= inst.earliestDate && d <= inst.deadlineDate,
    )

    // Earliest date wins; within a date, prefer the least-loaded eligible person, then earliest slot.
    let best: { personId: string; date: string; start: number } | null = null

    for (const date of candidateDates) {
      for (const personId of eligibleIds) {
        if (!personById.has(personId)) continue
        const intervals = availability.get(personId)?.get(date) ?? []
        const fits = intervals.find((iv) => iv.end - iv.start >= inst.job.durationMinutes)
        if (!fits) continue
        const currentLoad = load.get(personId) ?? 0
        if (
          !best ||
          currentLoad < (load.get(best.personId) ?? 0) ||
          (currentLoad === (load.get(best.personId) ?? 0) && fits.start < best.start)
        ) {
          best = { personId, date, start: fits.start }
        }
      }
      if (best) break
    }

    if (!best) {
      unscheduled.push({ jobId: inst.job.id, title: inst.job.title, date: inst.date })
      continue
    }

    const intervals = availability.get(best.personId)!.get(best.date)!
    const used = allocate(intervals, inst.job.durationMinutes)
    if (!used) {
      unscheduled.push({ jobId: inst.job.id, title: inst.job.title, date: inst.date })
      continue
    }

    load.set(best.personId, (load.get(best.personId) ?? 0) + inst.job.durationMinutes)

    slots.push({
      id: uuid(),
      jobId: inst.job.id,
      date: best.date,
      personId: best.personId,
      start: `${best.date}T${toHHmm(used.start)}:00`,
      end: `${best.date}T${toHHmm(used.end)}:00`,
    })
  }

  slots.sort((a, b) => a.start.localeCompare(b.start))

  return { slots, unscheduled }
}
