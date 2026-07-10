import { useState } from 'react';

export function Poster({ src, title, className = '' }: { src: string | null; title: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) return <img src={src} alt={`Affiche de ${title}`} onError={() => setFailed(true)} className={`bg-lavender object-cover ${className}`} loading="lazy" />;
  return <div className={`flex items-center justify-center overflow-hidden bg-gradient-to-br from-lavender to-periwinkle p-3 text-center text-sm font-bold text-primary-strong ${className}`}><span className="line-clamp-3">{title}</span></div>;
}
