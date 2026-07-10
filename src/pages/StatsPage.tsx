import { EmptyState } from '../components/ui/EmptyState';
import { routes } from '../constants/routes';
import { useLibrary } from '../hooks/useLibrary';
import { calculateStats } from '../services/statsService';

function hours(minutes: number): string {
  return `${Math.floor(minutes / 60)} h ${(minutes % 60).toString().padStart(2, '0')}`;
}

export function StatsPage() {
  const { library } = useLibrary();
  const stats = calculateStats(library);
  const cards = [['Séries dans la bibliothèque', stats.totalSeries], ['Séries terminées', stats.completedSeries], ['Séries en cours', stats.activeSeries], ['Épisodes vus', stats.watchedEpisodes], ['Épisodes restants', stats.remainingEpisodes], ['Temps de visionnage', hours(stats.watchedMinutes)], ['Vus ce mois', stats.watchedThisMonth]];
  if (!library.length) return <EmptyState title="Pas encore de statistiques" text="Ajoute une série puis marque quelques épisodes comme vus." actionTo={routes.library} actionLabel="Ouvrir la bibliothèque" />;
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black text-text">Statistiques</h2><p className="mt-1 text-sm text-text-soft">Calculées à partir des épisodes marqués comme vus.</p></div>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="rounded-2xl bg-card p-4 shadow-card"><p className="text-xs font-semibold text-text-soft">{label}</p><p className="mt-1 text-2xl font-black text-text">{value}</p></div>)}</section>
      <section className="rounded-2xl bg-card p-5 shadow-card"><h3 className="text-lg font-black text-text">Genres les plus regardés</h3><div className="mt-4 space-y-3">{stats.topGenres.length ? stats.topGenres.map((item) => <div key={item.genre}><div className="mb-1.5 flex justify-between text-sm font-semibold text-text-soft"><span>{item.genre}</span><span>{item.count}</span></div><div className="h-1.5 rounded-full bg-lavender/50"><div className="h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min(item.count * 12, 100)}%` }} /></div></div>) : <p className="text-sm text-text-soft">Aucun genre disponible pour le moment.</p>}</div></section>
    </div>
  );
}
