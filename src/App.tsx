import { useState } from 'react'
import clsx from 'clsx'
import { TodayView } from './components/TodayView'
import { WeekView } from './components/WeekView'
import { JobsView } from './components/JobsView'
import { PeopleView } from './components/PeopleView'
import { MealPlanView } from './components/MealPlanView'
import { ShoppingListView } from './components/ShoppingListView'

type Tab = 'today' | 'schedule' | 'jobs' | 'people' | 'meals' | 'shopping'

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'people', label: 'People' },
  { id: 'meals', label: 'Meals' },
  { id: 'shopping', label: 'Shopping' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="min-h-svh bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-xl font-bold">In The House</h1>
          <p className="text-xs text-slate-500">Household jobs, tracked and scheduled for helper & family</p>
        </div>
        <nav className="mx-auto flex max-w-4xl flex-wrap gap-1 px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'rounded-t-lg px-3 py-2 text-sm font-medium transition-colors',
                tab === t.id
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {tab === 'today' && <TodayView />}
        {tab === 'schedule' && <WeekView />}
        {tab === 'jobs' && <JobsView />}
        {tab === 'people' && <PeopleView />}
        {tab === 'meals' && <MealPlanView />}
        {tab === 'shopping' && <ShoppingListView />}
      </main>
    </div>
  )
}
