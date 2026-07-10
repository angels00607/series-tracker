export function Loader({ label = 'Chargement...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-sm text-text-soft shadow-card">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {label}
    </div>
  );
}
