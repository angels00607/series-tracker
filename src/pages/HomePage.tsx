import { Link } from 'react-router-dom';
import { SeriesCard } from '../components/cards/SeriesCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { routes } from '../constants/routes';
import { useLibrary } from '../hooks/useLibrary';
import { buildCalendar } from '../services/calendarService';
import { calculateStats } from '../services/statsService';
import { formatDate } from '../utils/date';
import { getProgress } from '../utils/progress';

export function HomePage() {
  const { library, removeSeries } = useLibrary();
  const stats = calculateStats(library);
  const calendar = buildCalendar(library);
  const nextToWatch = library.flatMap((series) => series.episodes.filter((episode) => !series.watchedEpisodes.some((watched) => watched.episodeId === episode.id)).map((episode) => ({ series, episode }))).sort((a, b) => a.series.id - b.series.id || a.episode.season - b.episode.season || a.episode.number - b.episode.number)[0];
  const activeSeries = library.filter((series) => getProgress(series) > 0 && getProgress(series) < 100).slice(0, 6);
  const upcoming = [...calendar.today, ...calendar.week, ...calendar.month, ...calendar.later].slice(0, 5);

  if (!library.length) return <EmptyState title="Ton journal est prêt" text="Recherche une première série et ajoute-la à ta bibliothèque pour commencer ton suivi." actionTo={routes.library} actionLabel="Explorer les séries" />;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Séries', stats.totalSeries],
          ['Terminées', stats.completedSeries],
          ['Épisodes vus', stats.watchedEpisodes],
          ['Restants', stats.remainingEpisodes],
        ].map(([label, value]) => <div key={label} className="rounded-2xl bg-card p-4 shadow-card"><p className="text-xs font-semibold text-text-soft">{label}</p><p className="mt-1 text-2xl font-black text-text">{value}</p></div>)}
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <h2 className="text-lg font-black text-text">Prochain épisode à regarder</h2>
          {nextToWatch ? <div className="mt-3 rounded-xl bg-lavender/25 p-4"><p className="text-sm font-semibold text-secondary">{nextToWatch.series.title}</p><p className="mt-1 text-lg font-black text-text">S{nextToWatch.episode.season}E{nextToWatch.episode.number} · {nextToWatch.episode.title}</p><p className="mt-1 text-sm text-text-soft">{formatDate(nextToWatch.episode.airdate)}</p><Link to={`/series/${nextToWatch.series.id}`}><Button className="mt-3">Ouvrir la série</Button></Link></div> : <p className="mt-3 text-sm text-text-soft">Tout est à jour.</p>}
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <h2 className="text-lg font-black text-text">À venir</h2>
          <div className="mt-3 space-y-2">{upcoming.length ? upcoming.map((item) => <div key={item.episode.id} className="rounded-xl bg-background p-3 text-sm"><p className="font-bold text-text">{item.seriesTitle}</p><p className="text-text-soft">S{item.episode.season}E{item.episode.number} · {formatDate(item.episode.airdate)}</p></div>) : <p className="text-sm text-text-soft">Aucun épisode futur connu pour ta bibliothèque.</p>}</div>
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between gap-4"><h2 className="text-lg font-black text-text">Séries en cours</h2><Link to={routes.library} className="text-sm font-bold text-primary">Bibliothèque</Link></div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">{(activeSeries.length ? activeSeries : library.slice(0, 6)).map((series) => <SeriesCard key={series.id} series={series} onRemove={removeSeries} />)}</div>
      </section>
    </div>
  );
}
