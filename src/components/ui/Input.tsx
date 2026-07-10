import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
}

export function Input({ label, className = '', ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-text">{label}</span>
      <input className={`min-h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-base text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-sm ${className}`} {...props} />
    </label>
  );
}

export function Select({ label, className = '', ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-text">{label}</span>
      <select className={`min-h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-base text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-sm ${className}`} {...props} />
    </label>
  );
}
