import { useMemo } from 'react'
import { useHousehold } from '../store'
import { Badge, Card, PersonDot } from './ui'
import { categoryMeta, priorityMeta } from '../lib/constants'
import { durationLabel, formatDateLabel, horizonDates } from '../lib/dates'
import { buildInstances } from '../lib/instances'
import { completionKey } from '../types'

const HORIZON_DAYS = 7

export function WeekView() {
  const people = useHousehold((s) => s.people)
  const jobs = useHousehold((s) => s.jobs)
  const overrides = useHousehold((s) => s.overrides)
  const completions = useHousehold((s) => s.completions)
  const setInstanceOverride = useHousehold((s) => s.setInstanceOverride)
  const clearInstanceOverride = useHousehold((s) => s.clearInstanceOverride)
  const toggleCompletion = useHousehold((s) => s.toggleCompletion)

  const dates = useMemo(() => horizonDates(HORIZON_DAYS), [])
  const instances = useMemo(() => buildInstances(jobs, overrides, dates), [jobs, overrides, dates])

  const workload = useMemo(() => {
    const totals = new Map<string, number>(people.map((p) => [p.id, 0]))
    for (const inst of instances) {
      if (inst.skipped) continue
      totals.set(inst.personId, (totals.get(inst.personId) ?? 0) + inst.job.durationMinutes)
    }
    return totals
  }, [instances, people])

  const maxLoad = Math.max(1, ...Array.from(workload.values()))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">7-day schedule</h2>
        <p className="text-xs text-slate-500">
          Every job's default day/time/person, straight from the Jobs tab. Adjust any single
          occurrence here without changing the default.
        </p>
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

      <div className="space-y-3">
        {dates.map((date) => {
          const dayInstances = instances.filter((inst) => inst.date === date)
          return (
            <Card key={date} className="p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {formatDateLabel(date)}
              </h3>
              {dayInstances.length === 0 ? (
                <p className="text-xs text-slate-300 dark:text-slate-600">Nothing today</p>
              ) : (
                <ul className="space-y-1.5">
                  {dayInstances.map((inst) => {
                    const job = inst.job
                    const person = people.find((p) => p.id === inst.personId)
                    const done = !!completions[completionKey(job.id, inst.date)]
                    const hasOverride = completionKey(job.id, inst.date) in overrides
                    const cat = categoryMeta(job.category)
                    const pri = priorityMeta(job.priority)
                    return (
                      <li
                        key={`${job.id}-${inst.date}`}
                        className={
                          inst.skipped
                            ? 'flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-200 px-2 py-1.5 text-sm opacity-60 dark:border-slate-700'
                            : 'flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 text-sm dark:border-slate-700'
                        }
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          disabled={inst.skipped}
                          onChange={() => toggleCompletion(job.id, inst.date)}
                          className="h-4 w-4"
                        />
                        <input
                          type="time"
                          value={inst.time ?? ''}
                          onChange={(e) =>
                            setInstanceOverride(job.id, inst.date, { time: e.target.value || null })
                          }
                          className="w-[5.5rem] shrink-0 rounded border border-slate-300 bg-transparent px-1 py-0.5 text-xs dark:border-slate-600"
                        />
                        <span
                          className={
                            done || inst.skipped
                              ? 'flex-1 truncate line-through text-slate-400'
                              : 'flex-1 truncate'
                          }
                        >
                          {cat.emoji} {job.title}
                        </span>
                        <Badge className={pri.classes}>{pri.label}</Badge>
                        <select
                          value={inst.personId}
                          onChange={(e) =>
                            setInstanceOverride(job.id, inst.date, { personId: e.target.value })
                          }
                          className="rounded border border-slate-300 bg-transparent px-1.5 py-0.5 text-xs dark:border-slate-600"
                        >
                          {people.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        {person && <PersonDot color={person.color} />}
                        {inst.skipped ? (
                          <button
                            onClick={() => setInstanceOverride(job.id, inst.date, { skipped: false })}
                            className="text-xs text-slate-400 hover:text-indigo-500"
                          >
                            restore
                          </button>
                        ) : (
                          <button
                            onClick={() => setInstanceOverride(job.id, inst.date, { skipped: true })}
                            className="text-xs text-slate-400 hover:text-red-500"
                          >
                            skip
                          </button>
                        )}
                        {hasOverride && (
                          <button
                            onClick={() => clearInstanceOverride(job.id, inst.date)}
                            className="text-xs text-slate-300 hover:text-slate-500"
                            title="Reset this occurrence back to the job's default"
                          >
                            reset
                          </button>
                        )}
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
