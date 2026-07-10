import type { LibrarySeries, Stats } from '../types';
import { isSameMonth } from '../utils/date';
import { isSeriesCompleted } from '../utils/progress';

export function calculateStats(library: LibrarySeries[]): Stats {
  const watchedEpisodes = library.flatMap((series) =>
    series.watchedEpisodes.map((watched) => ({ watched, series, episode: series.episodes.find((episode) => episode.id === watched.episodeId) })),
  );
  const genreCounts = new Map<string, number>();
  watchedEpisodes.forEach(({ series }) => series.genres.forEach((genre) => genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1)));
  return {
    totalSeries: library.length,
    completedSeries: library.filter(isSeriesCompleted).length,
    activeSeries: library.filter((series) => series.watchedEpisodes.length > 0 && !isSeriesCompleted(series)).length,
    watchedEpisodes: new Set(watchedEpisodes.map((item) => item.watched.episodeId)).size,
    remainingEpisodes: library.reduce((total, series) => total + Math.max(series.episodes.length - series.watchedEpisodes.length, 0), 0),
    watchedMinutes: watchedEpisodes.reduce((total, item) => total + (item.episode?.runtime || 0), 0),
    watchedThisMonth: watchedEpisodes.filter((item) => isSameMonth(item.watched.watchedAt)).length,
    topGenres: Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([genre, count]) => ({ genre, count })),
  };
}
