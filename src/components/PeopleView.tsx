import { useState } from 'react'
import { useHousehold } from '../store'
import { Button, Card, PersonDot } from './ui'
import { PERSON_COLORS } from '../lib/constants'
import type { Role } from '../types'

export function PeopleView() {
  const people = useHousehold((s) => s.people)
  const jobs = useHousehold((s) => s.jobs)
  const addPerson = useHousehold((s) => s.addPerson)
  const updatePerson = useHousehold((s) => s.updatePerson)
  const removePerson = useHousehold((s) => s.removePerson)

  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<Role>('family')

  const submit = () => {
    if (!newName.trim()) return
    const color = PERSON_COLORS[people.length % PERSON_COLORS.length]
    addPerson({ name: newName.trim(), role: newRole, color })
    setNewName('')
  }

  const jobCount = (personId: string) => jobs.filter((j) => !j.archived && j.assignedPersonId === personId).length

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

      <div className="grid gap-3 sm:grid-cols-2">
        {people.map((person) => (
          <Card key={person.id} className="flex items-center justify-between gap-2 p-4">
            <div className="flex items-center gap-2">
              <PersonDot color={person.color} />
              <input
                value={person.name}
                onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                className="w-28 rounded border-none bg-transparent text-sm font-semibold text-slate-800 focus:bg-slate-100 focus:outline-none dark:text-slate-100 dark:focus:bg-slate-700"
              />
              <select
                value={person.role}
                onChange={(e) => updatePerson(person.id, { role: e.target.value as Role })}
                className="rounded border border-slate-200 bg-transparent px-1.5 py-0.5 text-xs text-slate-500 dark:border-slate-600"
              >
                <option value="family">Family</option>
                <option value="helper">Helper</option>
              </select>
              <span className="text-xs text-slate-400">
                {jobCount(person.id)} job{jobCount(person.id) === 1 ? '' : 's'}
              </span>
            </div>
            <button onClick={() => removePerson(person.id)} className="text-xs text-slate-400 hover:text-red-500">
              Remove
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
