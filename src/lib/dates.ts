import { addDays, format } from 'date-fns'

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEKDAY_LABELS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export const todayISO = () => format(new Date(), 'yyyy-MM-dd')

export const horizonDates = (days: number, from: Date = new Date()) =>
  Array.from({ length: days }, (_, i) => format(addDays(from, i), 'yyyy-MM-dd'))

export const formatDateLabel = (iso: string) => {
  const d = new Date(iso + 'T00:00:00')
  return format(d, 'EEE d MMM')
}

/** Formats a plain "HH:mm" string (e.g. from Job.time) as "6:00pm". */
export const formatHHmm = (hhmm: string) => {
  const [h, m] = hhmm.split(':')
  const hour = Number(h)
  const suffix = hour >= 12 ? 'pm' : 'am'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${m}${suffix}`
}

export const durationLabel = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

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
