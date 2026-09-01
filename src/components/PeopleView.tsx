import { useState } from 'react'
import { useHousehold } from '../store'
import { Button, Card, PersonDot } from './ui'
import { WEEKDAY_LABELS } from '../lib/dates'
import { PERSON_COLORS } from '../lib/constants'
import type { Role, Weekday } from '../types'

export function PeopleView() {
  const people = useHousehold((s) => s.people)
  const addPerson = useHousehold((s) => s.addPerson)
  const removePerson = useHousehold((s) => s.removePerson)

  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<Role>('family')

  const submit = () => {
    if (!newName.trim()) return
    const color = PERSON_COLORS[people.length % PERSON_COLORS.length]
    addPerson({ name: newName.trim(), role: newRole, color })
    setNewName('')
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Add a person</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Name"
            className="min-w-40 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as Role)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="family">Family</option>
            <option value="helper">Helper</option>
          </select>
          <Button onClick={submit}>Add</Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {people.map((p) => (
          <PersonCard key={p.id} personId={p.id} onRemove={() => removePerson(p.id)} />
        ))}
      </div>
    </div>
  )
}

function PersonCard({ personId, onRemove }: { personId: string; onRemove: () => void }) {
  const person = useHousehold((s) => s.people.find((p) => p.id === personId))
  const addAvailability = useHousehold((s) => s.addAvailability)
  const removeAvailability = useHousehold((s) => s.removeAvailability)
  const updatePerson = useHousehold((s) => s.updatePerson)

  const [day, setDay] = useState<Weekday>(1)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')

  if (!person) return null

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <PersonDot color={person.color} />
          <input
            value={person.name}
            onChange={(e) => updatePerson(person.id, { name: e.target.value })}
            className="w-32 rounded border-none bg-transparent text-sm font-semibold text-slate-800 focus:bg-slate-100 focus:outline-none dark:text-slate-100 dark:focus:bg-slate-700"
          />
          <select
            value={person.role}
            onChange={(e) => updatePerson(person.id, { role: e.target.value as Role })}
            className="rounded border border-slate-200 bg-transparent px-1.5 py-0.5 text-xs text-slate-500 dark:border-slate-600"
          >
            <option value="family">Family</option>
            <option value="helper">Helper</option>
          </select>
        </div>
        <button onClick={onRemove} className="text-xs text-slate-400 hover:text-red-500">
          Remove
        </button>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
          Weekly availability
        </p>
        <div className="space-y-1">
          {WEEKDAY_LABELS.map((label, d) => {
            const windows = person.availability.filter((w) => w.day === d)
            if (windows.length === 0) return null
            return (
              <div key={d} className="flex flex-wrap items-center gap-1 text-xs">
                <span className="w-8 shrink-0 font-medium text-slate-500">{label}</span>
                {windows.map((w) => (
                  <span
                    key={w.id}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  >
                    {w.start}–{w.end}
                    <button
                      onClick={() => removeAvailability(person.id, w.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )
          })}
          {person.availability.length === 0 && (
            <p className="text-xs text-slate-400">No availability set — won't be scheduled.</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-700">
        <select
          value={day}
          onChange={(e) => setDay(Number(e.target.value) as Weekday)}
          className="rounded border border-slate-300 px-1.5 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
        >
          {WEEKDAY_LABELS.map((label, d) => (
            <option key={d} value={d}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="rounded border border-slate-300 px-1.5 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
        />
        <span className="text-xs text-slate-400">to</span>
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="rounded border border-slate-300 px-1.5 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
        />
        <Button
          variant="secondary"
          className="px-2 py-1 text-xs"
          onClick={() => start < end && addAvailability(person.id, { day, start, end })}
        >
          + Add window
        </Button>
      </div>
    </Card>
  )
}
