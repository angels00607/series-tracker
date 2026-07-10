import { createContext, useEffect, useMemo, useState } from 'react';
import type { Episode, LibrarySeries, Series, UserData } from '../types';
import { clearUserData, emptyUserData, loadPublishedUserData, loadUserData, saveUserData } from '../services/storageService';
import { getSeriesDetails } from '../services/tvmazeService';

interface LibraryContextValue {
  data: UserData;
  library: LibrarySeries[];
  addSeries: (series: Series) => void;
  removeSeries: (seriesId: number) => void;
  toggleEpisode: (seriesId: number, episode: Episode) => void;
  markSeasonWatched: (seriesId: number, seasonNumber: number) => void;
  markSeriesWatched: (seriesId: number) => void;
  resetSeriesProgress: (seriesId: number) => void;
  replaceData: (data: UserData) => void;
  refreshFromTvMaze: () => Promise<void>;
  resetAll: () => void;
}

export const LibraryContext = createContext<LibraryContextValue | null>(null);

function mergePublishedData(current: UserData, published: UserData): UserData {
  const publishedIds = new Set(published.library.map((series) => series.id));
  const publishedRemovedIds = new Set(published.removedIds ?? []);
  const removedIds = Array.from(new Set([...(current.removedIds ?? []), ...(published.removedIds ?? [])]));
  const localOnly = current.library.filter((series) => !publishedIds.has(series.id) && !publishedRemovedIds.has(series.id));

  return {
    ...published,
    library: [...published.library, ...localOnly],
    removedIds,
  };
}

function mergeRefreshedSeries(current: LibrarySeries, refreshed: Series): LibrarySeries {
  return {
    ...refreshed,
    addedAt: current.addedAt,
    watchedEpisodes: current.watchedEpisodes,
  };
}

async function refreshLibraryFromTvMaze(data: UserData): Promise<UserData> {
  if (!data.library.length) return data;

  let changed = false;
  const refreshedById = new Map<number, Series>();

  for (let index = 0; index < data.library.length; index += 4) {
    const batch = data.library.slice(index, index + 4);
    const results = await Promise.allSettled(batch.map((series) => getSeriesDetails(series.id)));
    results.forEach((result) => {
      if (result.status === 'fulfilled') refreshedById.set(result.value.id, result.value);
    });
  }

  const library = data.library.map((series) => {
    const refreshed = refreshedById.get(series.id);
    if (!refreshed) return series;
    const next = mergeRefreshedSeries(series, refreshed);
    if (
      next.title !== series.title ||
      next.status !== series.status ||
      next.poster !== series.poster ||
      next.summary !== series.summary ||
      next.episodes.length !== series.episodes.length ||
      next.seasons.length !== series.seasons.length
    ) changed = true;
    return next;
  });

  return changed ? { ...data, updatedAt: new Date().toISOString(), library } : data;
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<UserData>(() => loadUserData());
  const [readyToPersist, setReadyToPersist] = useState(false);

  // On every boot, pull only the published backup. TVMaze updates stay manual so opening the app
  // remains light and predictable on mobile.
  useEffect(() => {
    let cancelled = false;
    loadPublishedUserData().then((published) => {
      if (cancelled) return;
      if (published) setData((current) => mergePublishedData(current, published));
      setReadyToPersist(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (readyToPersist) saveUserData(data); }, [data, readyToPersist]);

  const value = useMemo<LibraryContextValue>(() => ({
    data,
    library: data.library,
    addSeries: (series) => setData((current) => current.library.some((item) => item.id === series.id) ? current : { ...current, updatedAt: new Date().toISOString(), library: [...current.library, { ...series, addedAt: new Date().toISOString(), watchedEpisodes: [] }], removedIds: (current.removedIds ?? []).filter((id) => id !== series.id) }),
    removeSeries: (seriesId) => setData((current) => ({ ...current, updatedAt: new Date().toISOString(), library: current.library.filter((series) => series.id !== seriesId), removedIds: (current.removedIds ?? []).includes(seriesId) ? current.removedIds : [...(current.removedIds ?? []), seriesId] })),
    toggleEpisode: (seriesId, episode) => setData((current) => ({ ...current, updatedAt: new Date().toISOString(), library: current.library.map((series) => {
      if (series.id !== seriesId) return series;
      const exists = series.watchedEpisodes.some((watched) => watched.episodeId === episode.id);
      return { ...series, watchedEpisodes: exists ? series.watchedEpisodes.filter((watched) => watched.episodeId !== episode.id) : [...series.watchedEpisodes, { episodeId: episode.id, watchedAt: new Date().toISOString() }] };
    }) })),
    markSeasonWatched: (seriesId, seasonNumber) => setData((current) => ({ ...current, updatedAt: new Date().toISOString(), library: current.library.map((series) => {
      if (series.id !== seriesId) return series;
      const watchedIds = new Set(series.watchedEpisodes.map((episode) => episode.episodeId));
      const additions = series.episodes.filter((episode) => episode.season === seasonNumber && !watchedIds.has(episode.id)).map((episode) => ({ episodeId: episode.id, watchedAt: new Date().toISOString() }));
      return { ...series, watchedEpisodes: [...series.watchedEpisodes, ...additions] };
    }) })),
    markSeriesWatched: (seriesId) => setData((current) => ({ ...current, updatedAt: new Date().toISOString(), library: current.library.map((series) => series.id === seriesId ? { ...series, watchedEpisodes: series.episodes.map((episode) => ({ episodeId: episode.id, watchedAt: new Date().toISOString() })) } : series) })),
    resetSeriesProgress: (seriesId) => setData((current) => ({ ...current, updatedAt: new Date().toISOString(), library: current.library.map((series) => series.id === seriesId ? { ...series, watchedEpisodes: [] } : series) })),
    replaceData: (nextData) => setData({ ...nextData, updatedAt: new Date().toISOString() }),
    refreshFromTvMaze: async () => {
      const refreshed = await refreshLibraryFromTvMaze(data);
      setData(refreshed);
    },
    resetAll: () => { clearUserData(); setData(emptyUserData()); },
  }), [data]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}
