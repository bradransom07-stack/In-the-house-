import { useMemo, useState } from 'react'
import { useHousehold } from '../store'
import { Badge, Button, Card, PersonDot } from './ui'
import { categoryMeta, priorityMeta } from '../lib/constants'
import { durationLabel, formatDateLabel, horizonDates } from '../lib/dates'
import { optimizeSchedule, type OptimizeResult } from '../lib/schedule'
import { completionKey } from '../types'

const HORIZON_DAYS = 7

export function WeekView() {
  const people = useHousehold((s) => s.people)
  const jobs = useHousehold((s) => s.jobs)
  const schedule = useHousehold((s) => s.schedule)
  const completions = useHousehold((s) => s.completions)
  const setSchedule = useHousehold((s) => s.setSchedule)
  const reassignSlot = useHousehold((s) => s.reassignSlot)
  const rescheduleSlot = useHousehold((s) => s.rescheduleSlot)
  const removeSlot = useHousehold((s) => s.removeSlot)
  const toggleCompletion = useHousehold((s) => s.toggleCompletion)

  const [unscheduled, setUnscheduled] = useState<OptimizeResult['unscheduled']>([])

  const dates = useMemo(() => horizonDates(HORIZON_DAYS), [])

  const runOptimize = () => {
    const result = optimizeSchedule(people, jobs, completions, HORIZON_DAYS)
    setSchedule(result.slots)
    setUnscheduled(result.unscheduled)
  }

  const jobById = (id: string) => jobs.find((j) => j.id === id)

  const workload = useMemo(() => {
    const jobsById = new Map(jobs.map((j) => [j.id, j]))
    const totals = new Map<string, number>(people.map((p) => [p.id, 0]))
    for (const slot of schedule) {
      const job = jobsById.get(slot.jobId)
      if (!job) continue
      totals.set(slot.personId, (totals.get(slot.personId) ?? 0) + job.durationMinutes)
    }
    return totals
  }, [schedule, people, jobs])

  const maxLoad = Math.max(1, ...Array.from(workload.values()))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">7-day schedule</h2>
          <p className="text-xs text-slate-500">
            Fits jobs into everyone's free time, prioritizing by deadline and importance, then balances load.
          </p>
        </div>
        <Button onClick={runOptimize}>Optimize schedule</Button>
      </div>

      {people.length > 0 && (
        <Card className="p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Workload this week
          </p>
          <div className="space-y-1.5">
            {people.map((p) => {
              const mins = workload.get(p.id) ?? 0
              return (
                <div key={p.id} className="flex items-center gap-2 text-xs">
                  <PersonDot color={p.color} />
                  <span className="w-24 shrink-0 text-slate-600 dark:text-slate-300">{p.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(mins / maxLoad) * 100}%`, background: p.color }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-slate-500">{durationLabel(mins)}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {unscheduled.length > 0 && (
        <Card className="border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-900/20">
          <p className="mb-1 font-medium text-amber-800 dark:text-amber-300">
            {unscheduled.length} job{unscheduled.length === 1 ? '' : 's'} couldn't be fit in — no free
            slots for eligible people:
          </p>
          <ul className="list-inside list-disc text-amber-700 dark:text-amber-300">
            {unscheduled.map((u, i) => (
              <li key={i}>
                {u.title} <span className="text-amber-500">(by {u.date})</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="space-y-3">
        {dates.map((date) => {
          const slots = schedule
            .filter((sl) => sl.date === date)
            .sort((a, b) => a.start.localeCompare(b.start))
          return (
            <Card key={date} className="p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {formatDateLabel(date)}
              </h3>
              {slots.length === 0 ? (
                <p className="text-xs text-slate-300 dark:text-slate-600">Nothing scheduled</p>
              ) : (
                <ul className="space-y-1.5">
                  {slots.map((slot) => {
                    const job = jobById(slot.jobId)
                    if (!job) return null
                    const person = people.find((p) => p.id === slot.personId)
                    const done = !!completions[completionKey(job.id, slot.date)]
                    const cat = categoryMeta(job.category)
                    const pri = priorityMeta(job.priority)
                    return (
                      <li
                        key={slot.id}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 text-sm dark:border-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => toggleCompletion(job.id, slot.date)}
                          className="h-4 w-4"
                        />
                        <input
                          type="time"
                          value={slot.start.slice(11, 16)}
                          onChange={(e) => e.target.value && rescheduleSlot(slot.id, e.target.value)}
                          className="w-[5.5rem] shrink-0 rounded border border-slate-300 bg-transparent px-1 py-0.5 text-xs dark:border-slate-600"
                        />
                        <span
                          className={done ? 'flex-1 truncate line-through text-slate-400' : 'flex-1 truncate'}
                        >
                          {cat.emoji} {job.title}
                        </span>
                        <Badge className={pri.classes}>{pri.label}</Badge>
                        <select
                          value={slot.personId}
                          onChange={(e) => reassignSlot(slot.id, e.target.value)}
                          className="rounded border border-slate-300 bg-transparent px-1.5 py-0.5 text-xs dark:border-slate-600"
                        >
                          {people.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        {person && <PersonDot color={person.color} />}
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="text-xs text-slate-400 hover:text-red-500"
                        >
                          remove
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
