import { Link, useNavigate, useParams } from 'react-router-dom';
import { EpisodeRow } from '../components/cards/EpisodeRow';
import { Poster } from '../components/common/Poster';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';
import { routes } from '../constants/routes';
import { useLibrary } from '../hooks/useLibrary';
import { formatDate } from '../utils/date';
import { getProgress, getTotalEpisodes, getWatchedCount } from '../utils/progress';

export function SeriesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { library, toggleEpisode, markSeasonWatched, markSeriesWatched, resetSeriesProgress, removeSeries } = useLibrary();
  const series = library.find((item) => item.id === Number(id));
  if (!series) return <EmptyState title="Série introuvable" text="Cette série n’est pas dans ta bibliothèque." actionTo={routes.library} actionLabel="Retour à la bibliothèque" />;
  const selectedSeries = series;
  const watchedIds = new Set(selectedSeries.watchedEpisodes.map((episode) => episode.episodeId));
  const progress = getProgress(selectedSeries);

  function onRemove() {
    if (window.confirm('Supprimer cette série de ta bibliothèque ?')) {
      removeSeries(selectedSeries.id);
      navigate(routes.library);
    }
  }

  return (
    <div className="space-y-6">
      <Link to={routes.library} className="text-sm font-bold text-primary">← Bibliothèque</Link>
      <section className="mobile-card grid gap-5 rounded-2xl bg-card p-5 shadow-card lg:grid-cols-[14rem_1fr]">
        <Poster src={selectedSeries.poster} title={selectedSeries.title} className="mx-auto aspect-[2/3] w-full max-w-52 rounded-2xl lg:max-w-none" />
        <div className="space-y-4">
          <div><h2 className="mobile-title text-3xl font-black text-text">{selectedSeries.title}</h2><div className="mt-2 flex flex-wrap gap-1.5"><Badge>{selectedSeries.status}</Badge>{selectedSeries.genres.map((genre) => <Badge key={genre}>{genre}</Badge>)}</div></div>
          <p className="max-w-3xl text-sm leading-6 text-text-soft">{selectedSeries.summary || 'Aucun résumé disponible.'}</p>
          <div className="max-w-xl space-y-1.5"><div className="flex justify-between text-sm font-semibold text-text-soft"><span>{getWatchedCount(selectedSeries)} / {getTotalEpisodes(selectedSeries)} épisodes vus</span><span>{progress}%</span></div><ProgressBar value={progress} /></div>
          <div className="mobile-button-stack flex flex-wrap gap-2.5 max-[430px]:grid"><Button onClick={() => markSeriesWatched(selectedSeries.id)}>Tout marquer vu</Button><Button variant="secondary" onClick={() => resetSeriesProgress(selectedSeries.id)}>Réinitialiser</Button><Button variant="danger" onClick={onRemove}>Supprimer</Button></div>
        </div>
      </section>
      <section className="space-y-4">
        {selectedSeries.seasons.map((season) => (
          <div key={season.number} className="mobile-card rounded-2xl bg-card p-4 shadow-card">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-black text-text">Saison {season.number}</h3><p className="text-xs text-text-soft">{season.episodes.filter((episode) => watchedIds.has(episode.id)).length} / {season.episodes.length} épisodes vus</p></div><Button variant="secondary" onClick={() => markSeasonWatched(selectedSeries.id, season.number)}>Marquer la saison vue</Button></div>
            <div className="space-y-2">{season.episodes.map((episode) => <EpisodeRow key={episode.id} episode={episode} watched={watchedIds.has(episode.id)} onToggle={() => toggleEpisode(selectedSeries.id, episode)} />)}</div>
          </div>
        ))}
      </section>
      <p className="text-center text-xs text-text-soft">Dernière mise à jour locale : {formatDate(selectedSeries.addedAt)}</p>
    </div>
  );
}
