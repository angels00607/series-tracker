export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-periwinkle/40 px-2.5 py-1 text-[11px] font-semibold text-primary-strong">{children}</span>;
}
