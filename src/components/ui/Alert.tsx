export function Alert({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'error' | 'success' | 'warning' }) {
  const classes = {
    info: 'border-primary/15 bg-periwinkle/20 text-primary-strong',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }[tone];
  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${classes}`}>{children}</div>;
}
