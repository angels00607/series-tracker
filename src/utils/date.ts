const dayMs = 24 * 60 * 60 * 1000;

export function formatDate(value: string | null): string {
  if (!value) return 'Date inconnue';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
}

export function isToday(value: string): boolean {
  return new Date(value).toDateString() === new Date().toDateString();
}

export function isThisWeek(value: string): boolean {
  const now = new Date();
  const diff = new Date(value).getTime() - now.getTime();
  return diff >= 0 && diff <= 7 * dayMs;
}

export function isThisMonth(value: string): boolean {
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getTime() >= now.getTime();
}

export function isSameMonth(value: string, base = new Date()): boolean {
  const date = new Date(value);
  return date.getFullYear() === base.getFullYear() && date.getMonth() === base.getMonth();
}
