import type { Episode } from '../../types';
import { formatDate } from '../../utils/date';

export function EpisodeRow({ episode, watched, onToggle }: { episode: Episode; watched: boolean; onToggle: () => void }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 transition ${watched ? 'bg-lavender/30' : 'bg-background hover:bg-lavender/20'}`}>
      <input type="checkbox" checked={watched} onChange={onToggle} className="h-5 w-5 shrink-0 rounded border-primary/30 text-primary focus:ring-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-text">S{episode.season.toString().padStart(2, '0')}E{episode.number.toString().padStart(2, '0')} · {episode.title}</p>
        <p className="mt-0.5 text-xs text-text-soft">{formatDate(episode.airdate)} · {episode.runtime ? `${episode.runtime} min` : 'Durée inconnue'}</p>
      </div>
    </label>
  );
}
