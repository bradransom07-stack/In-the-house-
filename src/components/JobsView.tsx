import { useState } from 'react'
import { useHousehold } from '../store'
import { Badge, Button, Card } from './ui'
import { categoryMeta, priorityMeta } from '../lib/constants'
import { durationLabel, formatHHmm, WEEKDAY_LABELS } from '../lib/dates'
import { JobFormModal } from './JobFormModal'
import type { Job } from '../types'

export function JobsView() {
  const jobs = useHousehold((s) => s.jobs)
  const people = useHousehold((s) => s.people)
  const removeJob = useHousehold((s) => s.removeJob)
  const [editing, setEditing] = useState<Job | 'new' | null>(null)

  const personName = (id: string) => people.find((p) => p.id === id)?.name

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Jobs <span className="text-slate-400">({jobs.length})</span>
        </h2>
        <Button onClick={() => setEditing('new')}>+ New job</Button>
      </div>

      {jobs.length === 0 && (
        <Card className="p-6 text-center text-sm text-slate-400">
          No jobs yet. Add chores, errands, or recurring tasks for the helper and family.
        </Card>
      )}

      <div className="space-y-2">
        {jobs.map((job) => {
          const cat = categoryMeta(job.category)
          const pri = priorityMeta(job.priority)
          return (
            <Card key={job.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  <span className="truncate font-medium text-slate-800 dark:text-slate-100">{job.title}</span>
                  <Badge className={pri.classes}>{pri.label}</Badge>
                  {job.recurrence !== 'none' && (
                    <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                      {job.recurrence}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{durationLabel(job.durationMinutes)}</span>
                  {job.recurrence === 'weekly' && job.weekday !== null && (
                    <span>Every {WEEKDAY_LABELS[job.weekday]}</span>
                  )}
                  {job.recurrence === 'none' && (
                    <span>{job.dueDate ? `On ${job.dueDate}` : 'No date set'}</span>
                  )}
                  {job.time && <span>{formatHHmm(job.time)}</span>}
                  <span>Assigned to {personName(job.assignedPersonId) ?? 'nobody (removed)'}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" onClick={() => setEditing(job)}>
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => removeJob(job.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {editing && (
        <JobFormModal job={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
