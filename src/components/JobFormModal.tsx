import { useState } from 'react'
import { useHousehold } from '../store'
import { Button } from './ui'
import { CATEGORIES } from '../lib/constants'
import { WEEKDAY_LABELS_LONG } from '../lib/dates'
import type { Job, JobCategory, Priority, Recurrence, Weekday } from '../types'

interface Props {
  job?: Job
  onClose: () => void
}

export function JobFormModal({ job, onClose }: Props) {
  const people = useHousehold((s) => s.people)
  const addJob = useHousehold((s) => s.addJob)
  const updateJob = useHousehold((s) => s.updateJob)

  const [title, setTitle] = useState(job?.title ?? '')
  const [notes, setNotes] = useState(job?.notes ?? '')
  const [category, setCategory] = useState<JobCategory>(job?.category ?? 'cleaning')
  const [duration, setDuration] = useState(job?.durationMinutes ?? 30)
  const [priority, setPriority] = useState<Priority>(job?.priority ?? 'medium')
  const [recurrence, setRecurrence] = useState<Recurrence>(job?.recurrence ?? 'none')
  const [weekday, setWeekday] = useState<Weekday>(job?.weekday ?? 1)
  const [dueDate, setDueDate] = useState(job?.dueDate ?? '')
  const [time, setTime] = useState(job?.time ?? '')
  const [assignedPersonId, setAssignedPersonId] = useState(job?.assignedPersonId ?? people[0]?.id ?? '')

  const submit = () => {
    if (!title.trim() || !assignedPersonId) return
    const payload = {
      title: title.trim(),
      notes,
      category,
      durationMinutes: Math.max(5, duration),
      priority,
      recurrence,
      weekday: recurrence === 'weekly' ? weekday : null,
      dueDate: recurrence === 'none' ? dueDate || null : null,
      time: time || null,
      assignedPersonId,
    }
    if (job) {
      updateJob(job.id, payload)
    } else {
      addJob(payload)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          {job ? 'Edit job' : 'New job'}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              placeholder="e.g. Vacuum living room"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as JobCategory)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Duration (min)</label>
              <input
                type="number"
                min={5}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Repeats</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              >
                <option value="none">One-off</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {recurrence === 'weekly' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Which day</label>
                <select
                  value={weekday}
                  onChange={(e) => setWeekday(Number(e.target.value) as Weekday)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                >
                  {WEEKDAY_LABELS_LONG.map((label, d) => (
                    <option key={d} value={d}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {recurrence === 'none' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Time (optional)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Assigned to</label>
            <select
              value={assignedPersonId}
              onChange={(e) => setAssignedPersonId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              This is the default. A single day/week's occurrence can still be reassigned from the
              Schedule tab.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{job ? 'Save' : 'Add job'}</Button>
        </div>
      </div>
    </div>
  )
}
