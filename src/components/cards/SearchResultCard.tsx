import type { SearchResult } from '../../types';
import { Poster } from '../common/Poster';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function SearchResultCard({ result, disabled, onAdd }: { result: SearchResult; disabled: boolean; onAdd: () => void }) {
  return (
    <article className="mobile-card flex gap-3 rounded-2xl bg-card p-3 shadow-card">
      <Poster src={result.poster} title={result.title} className="h-28 w-20 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-black text-text">{result.title}</h3><Badge>{result.status}</Badge></div>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-text-soft">{result.summary || 'Aucun résumé disponible.'}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{result.genres.slice(0, 3).map((genre) => <Badge key={genre}>{genre}</Badge>)}</div>
        <Button className="mt-3" disabled={disabled} onClick={onAdd}>{disabled ? 'Déjà ajoutée' : 'Ajouter'}</Button>
      </div>
    </article>
  );
}
