import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-soft hover:bg-primary-strong',
  secondary: 'bg-lavender/50 text-text hover:bg-lavender/80',
  ghost: 'bg-transparent text-primary hover:bg-primary/10',
  danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return <button className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2.5 text-center text-sm font-semibold leading-tight transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props} />;
}
