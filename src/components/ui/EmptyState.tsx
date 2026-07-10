import { Link } from 'react-router-dom';

export function EmptyState({ title, text, actionTo, actionLabel }: { title: string; text: string; actionTo?: string; actionLabel?: string }) {
  return (
    <div className="rounded-2xl bg-card p-8 text-center shadow-card">
      <h2 className="text-xl font-bold text-text">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-soft">{text}</p>
      {actionTo && actionLabel ? <Link to={actionTo} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-strong">{actionLabel}</Link> : null}
    </div>
  );
}
