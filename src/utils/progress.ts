import type { LibrarySeries } from '../types';

export function getWatchedCount(series: LibrarySeries): number {
  return series.watchedEpisodes.length;
}

export function getTotalEpisodes(series: LibrarySeries): number {
  return series.episodes.length;
}

export function getProgress(series: LibrarySeries): number {
  const total = getTotalEpisodes(series);
  return total === 0 ? 0 : Math.round((getWatchedCount(series) / total) * 100);
}

export function isSeriesCompleted(series: LibrarySeries): boolean {
  return getTotalEpisodes(series) > 0 && getWatchedCount(series) >= getTotalEpisodes(series);
}
