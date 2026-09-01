import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import clsx from 'clsx'

export function Button({
  variant = 'primary',
  className,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }
>) {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
    secondary:
      'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-500',
    ghost: 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100',
  }
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        styles[variant],
        className,
      )}
      {...props}
    />
  )
}

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Badge({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      {children}
    </span>
  )
}

export function PersonDot({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
}
