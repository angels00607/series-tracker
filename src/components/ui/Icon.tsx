export type IconName = 'home' | 'library' | 'calendar' | 'stats' | 'settings';

const paths: Record<IconName, string> = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9',
  library: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H8a1.5 1.5 0 0 1 1.5 1.5v15L4 19M20 5.5A1.5 1.5 0 0 0 18.5 4H16a1.5 1.5 0 0 0-1.5 1.5v15l6-1.5M9.5 4.2 14.5 5.6a1.5 1.5 0 0 1 1.06 1.84l-3.7 13.9',
  calendar: 'M4 9.5h16M7 3v3.5M17 3v3.5M6 5.5h12A1.5 1.5 0 0 1 19.5 7v12a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V7A1.5 1.5 0 0 1 6 5.5Z',
  stats: 'M5 20V10.5M12 20V4M19 20v-6.5',
  settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5c0 .61-.07 1.2-.2 1.77l1.94 1.5-1.94 3.36-2.28-.77a7.7 7.7 0 0 1-1.53.89L15.6 21H8.4l-.39-2.25a7.7 7.7 0 0 1-1.53-.89l-2.28.77-1.94-3.36 1.94-1.5A6.9 6.9 0 0 1 4 12c0-.61.07-1.2.2-1.77L2.26 8.73 4.2 5.37l2.28.77c.47-.36.98-.66 1.53-.89L8.4 3h7.2l.39 2.25c.55.23 1.06.53 1.53.89l2.28-.77 1.94 3.36-1.94 1.5c.13.57.2 1.16.2 1.77Z',
};

export function Icon({ name, active = false, className = '' }: { name: IconName; active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.1 : 1.7} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${className}`} aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
