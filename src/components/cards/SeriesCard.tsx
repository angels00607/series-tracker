import { Link } from 'react-router-dom';
import type { LibrarySeries } from '../../types';
import { getProgress, getTotalEpisodes, getWatchedCount } from '../../utils/progress';
import { Poster } from '../common/Poster';

export function SeriesCard({ series, onRemove }: { series: LibrarySeries; onRemove: (id: number) => void }) {
  const progress = getProgress(series);
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      <Link to={`/series/${series.id}`} className="block">
        <div className="relative">
          <Poster src={series.poster} title={series.title} className="aspect-[2/3] w-full" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
            <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="space-y-0.5 p-2">
          <p className="line-clamp-1 text-[13px] font-bold leading-tight text-text">{series.title}</p>
          <p className="text-[11px] font-medium text-text-soft">{getWatchedCount(series)}/{getTotalEpisodes(series)} · {progress}%</p>
        </div>
      </Link>
      <button
        type="button"
        onClick={(event) => { event.preventDefault(); onRemove(series.id); }}
        aria-label={`Retirer ${series.title}`}
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-text/45 text-sm leading-none text-white backdrop-blur transition hover:bg-text/70"
      >
        ×
      </button>
    </article>
  );
}
