import { useState } from 'react'
import { useHousehold } from '../store'
import { Button } from './ui'
import { CATEGORIES } from '../lib/constants'
import type { Job, JobCategory, Priority, Recurrence } from '../types'

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
  const [dueDate, setDueDate] = useState(job?.dueDate ?? '')
  const [recurrence, setRecurrence] = useState<Recurrence>(job?.recurrence ?? 'none')
  const [eligible, setEligible] = useState<string[]>(job?.eligiblePersonIds ?? [])
  const [locked, setLocked] = useState<string>(job?.lockedPersonId ?? '')

  const toggleEligible = (id: string) =>
    setEligible((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  const submit = () => {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      notes,
      category,
      durationMinutes: Math.max(5, duration),
      priority,
      dueDate: dueDate || null,
      recurrence,
      eligiblePersonIds: locked ? [] : eligible,
      lockedPersonId: locked || null,
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

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {recurrence === 'none' ? 'Due date (optional)' : 'Anchor date (optional)'}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Lock to a specific person</label>
            <select
              value={locked}
              onChange={(e) => setLocked(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
            >
              <option value="">— Not locked —</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {!locked && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Who's eligible? (none checked = anyone)
              </label>
              <div className="flex flex-wrap gap-2">
                {people.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-1.5 rounded-full border border-slate-300 px-2.5 py-1 text-xs dark:border-slate-600"
                  >
                    <input
                      type="checkbox"
                      checked={eligible.includes(p.id)}
                      onChange={() => toggleEligible(p.id)}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          )}
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
