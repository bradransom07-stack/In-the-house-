import { useMemo } from 'react'
import { useHousehold } from '../store'
import { Badge, Card, PersonDot } from './ui'
import { categoryMeta, priorityMeta, MEAL_TYPES } from '../lib/constants'
import { formatTime, todayISO, WEEKDAY_LABELS_LONG, durationLabel } from '../lib/dates'
import { completionKey } from '../types'
import { getDay } from 'date-fns'

export function TodayView() {
  const people = useHousehold((s) => s.people)
  const jobs = useHousehold((s) => s.jobs)
  const schedule = useHousehold((s) => s.schedule)
  const completions = useHousehold((s) => s.completions)
  const toggleCompletion = useHousehold((s) => s.toggleCompletion)
  const meals = useHousehold((s) => s.meals)

  const today = todayISO()
  const weekdayLabel = WEEKDAY_LABELS_LONG[getDay(new Date())]
  const todaysMeals = MEAL_TYPES.map((mt) => ({
    ...mt,
    entry: meals.find((m) => m.date === today && m.mealType === mt.value),
  })).filter((m) => m.entry)

  const todaysSlots = useMemo(
    () => schedule.filter((sl) => sl.date === today).sort((a, b) => a.start.localeCompare(b.start)),
    [schedule, today],
  )

  const byPerson = useMemo(() => {
    const map = new Map<string, typeof todaysSlots>()
    for (const p of people) map.set(p.id, [])
    for (const slot of todaysSlots) {
      if (!map.has(slot.personId)) map.set(slot.personId, [])
      map.get(slot.personId)!.push(slot)
    }
    return map
  }, [todaysSlots, people])

  const jobById = (id: string) => jobs.find((j) => j.id === id)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{weekdayLabel}</h2>
        <p className="text-sm text-slate-500">
          {todaysSlots.length === 0
            ? 'Nothing scheduled for today yet — head to the Schedule tab and optimize.'
            : `${todaysSlots.length} job${todaysSlots.length === 1 ? '' : 's'} planned today`}
        </p>
      </div>

      {todaysMeals.length > 0 && (
        <Card className="p-3">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {todaysMeals.map((m) => (
              <span key={m.value}>
                <span className="text-slate-400">
                  {m.emoji} {m.label}:
                </span>{' '}
                <span className="font-medium text-slate-800 dark:text-slate-100">{m.entry!.title}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {people.map((person) => {
          const slots = byPerson.get(person.id) ?? []
          return (
            <Card key={person.id} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <PersonDot color={person.color} />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{person.name}</h3>
                <span className="text-xs text-slate-400">
                  {slots.reduce((sum, sl) => sum + (jobById(sl.jobId)?.durationMinutes ?? 0), 0) > 0 &&
                    durationLabel(slots.reduce((sum, sl) => sum + (jobById(sl.jobId)?.durationMinutes ?? 0), 0))}
                </span>
              </div>
              {slots.length === 0 ? (
                <p className="text-xs text-slate-400">Nothing scheduled.</p>
              ) : (
                <ul className="space-y-1.5">
                  {slots.map((slot) => {
                    const job = jobById(slot.jobId)
                    if (!job) return null
                    const done = !!completions[completionKey(job.id, slot.date)]
                    const cat = categoryMeta(job.category)
                    const pri = priorityMeta(job.priority)
                    return (
                      <li
                        key={slot.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 text-sm dark:border-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => toggleCompletion(job.id, slot.date)}
                          className="h-4 w-4"
                        />
                        <span className="w-14 shrink-0 text-xs text-slate-400">{formatTime(slot.start)}</span>
                        <span className={done ? 'flex-1 truncate line-through text-slate-400' : 'flex-1 truncate'}>
                          {cat.emoji} {job.title}
                        </span>
                        <Badge className={pri.classes}>{pri.label}</Badge>
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
