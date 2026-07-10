import type { Episode, GitHubSyncConfig, LibrarySeries, Season, UserData, WatchedEpisode } from '../types';

const DATA_KEY = 'series-tracker:user-data';
const GITHUB_CONFIG_KEY = 'series-tracker:github-config';
const GITHUB_TOKEN_KEY = 'series-tracker:github-token';
const PUBLISHED_DATA_FILE = 'series-tracker-data.json';

export const emptyUserData = (): UserData => ({ version: 1, updatedAt: new Date().toISOString(), library: [], removedIds: [] });

export function validateUserData(value: unknown): value is UserData {
  if (!value || typeof value !== 'object') return false;
  const data = value as UserData;
  return typeof data.version === 'number' && typeof data.updatedAt === 'string' && Array.isArray(data.library);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function normalizeEpisode(value: unknown): Episode | null {
  if (!isRecord(value) || typeof value.id !== 'number') return null;
  return {
    id: value.id,
    season: typeof value.season === 'number' ? value.season : 0,
    number: typeof value.number === 'number' ? value.number : 0,
    title: typeof value.title === 'string' ? value.title : '',
    airdate: typeof value.airdate === 'string' ? value.airdate : null,
    runtime: typeof value.runtime === 'number' ? value.runtime : null,
  };
}

function normalizeWatchedEpisode(value: unknown): WatchedEpisode | null {
  if (!isRecord(value) || typeof value.episodeId !== 'number') return null;
  return {
    episodeId: value.episodeId,
    watchedAt: typeof value.watchedAt === 'string' ? value.watchedAt : new Date().toISOString(),
  };
}

function buildSeasons(episodes: Episode[], existingSeasons: unknown): Season[] {
  if (Array.isArray(existingSeasons)) {
    const seasons = existingSeasons
      .map((season) => {
        if (!isRecord(season) || typeof season.number !== 'number') return null;
        const seasonEpisodes = Array.isArray(season.episodes) ? season.episodes.map(normalizeEpisode).filter((episode): episode is Episode => Boolean(episode)) : episodes.filter((episode) => episode.season === season.number);
        return { number: season.number, episodes: seasonEpisodes };
      })
      .filter((season): season is Season => Boolean(season));
    if (seasons.length) return seasons;
  }

  const bySeason = new Map<number, Episode[]>();
  episodes.forEach((episode) => bySeason.set(episode.season, [...(bySeason.get(episode.season) || []), episode]));
  return Array.from(bySeason.entries())
    .sort(([left], [right]) => left - right)
    .map(([number, seasonEpisodes]) => ({ number, episodes: seasonEpisodes.sort((left, right) => left.number - right.number) }));
}

function normalizeSeries(value: unknown): LibrarySeries | null {
  if (!isRecord(value) || typeof value.id !== 'number') return null;
  const episodes = Array.isArray(value.episodes) ? value.episodes.map(normalizeEpisode).filter((episode): episode is Episode => Boolean(episode)) : [];
  const watchedEpisodes = Array.isArray(value.watchedEpisodes) ? value.watchedEpisodes.map(normalizeWatchedEpisode).filter((episode): episode is WatchedEpisode => Boolean(episode)) : [];

  return {
    id: value.id,
    title: typeof value.title === 'string' ? value.title : 'Série sans titre',
    poster: typeof value.poster === 'string' ? value.poster : null,
    summary: typeof value.summary === 'string' ? value.summary : '',
    genres: Array.isArray(value.genres) ? value.genres.filter((genre): genre is string => typeof genre === 'string') : [],
    status: typeof value.status === 'string' ? value.status : 'Unknown',
    seasons: buildSeasons(episodes, value.seasons),
    episodes,
    addedAt: typeof value.addedAt === 'string' ? value.addedAt : new Date().toISOString(),
    watchedEpisodes,
  };
}

function withDefaults(data: UserData): UserData {
  return {
    ...data,
    library: data.library.map(normalizeSeries).filter((series): series is LibrarySeries => Boolean(series)),
    removedIds: Array.isArray(data.removedIds) ? data.removedIds.filter((id): id is number => typeof id === 'number') : [],
  };
}

export function loadUserData(): UserData {
  const raw = localStorage.getItem(DATA_KEY);
  if (!raw) return emptyUserData();
  try {
    const parsed = JSON.parse(raw) as unknown;
    return validateUserData(parsed) ? withDefaults(parsed) : emptyUserData();
  } catch {
    return emptyUserData();
  }
}

export function hasLocalUserData(): boolean {
  return localStorage.getItem(DATA_KEY) !== null;
}

/**
 * Fetches the data file published alongside the app on GitHub Pages (same mechanism as DLV Guide:
 * a plain, unauthenticated static read, no token needed). Used to bootstrap/merge the library on
 * any device, independently of the manual GitHub push flow below.
 */
export async function loadPublishedUserData(): Promise<UserData | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const url = `${import.meta.env.BASE_URL}${PUBLISHED_DATA_FILE}?v=${Date.now()}`;
    const response = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' }, signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const parsed = (await response.json()) as unknown;
    return validateUserData(parsed) ? withDefaults(parsed) : null;
  } catch {
    return null;
  }
}

export function saveUserData(data: UserData): void {
  localStorage.setItem(DATA_KEY, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
}

export function clearUserData(): void {
  localStorage.removeItem(DATA_KEY);
}

export function downloadJson(data: UserData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `series-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function readJsonFile(file: File): Promise<UserData> {
  const parsed = JSON.parse(await file.text()) as unknown;
  if (!validateUserData(parsed)) throw new Error('Le fichier importé ne correspond pas au format attendu.');
  return withDefaults(parsed);
}

export function loadGitHubConfig(): GitHubSyncConfig {
  const fallback: GitHubSyncConfig = { username: 'angels00607', repository: 'series-tracker', branch: 'main', filePath: PUBLISHED_DATA_FILE, rememberToken: false };
  const token = localStorage.getItem(GITHUB_TOKEN_KEY) || undefined;
  const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
  if (!raw) return { ...fallback, token, rememberToken: Boolean(token) };
  try {
    return { ...fallback, ...(JSON.parse(raw) as GitHubSyncConfig), token };
  } catch {
    return { ...fallback, token, rememberToken: Boolean(token) };
  }
}

export function saveGitHubConfig(config: GitHubSyncConfig): void {
  const { token, ...safeConfig } = config;
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(safeConfig));
  if (config.rememberToken && token) localStorage.setItem(GITHUB_TOKEN_KEY, token);
  else localStorage.removeItem(GITHUB_TOKEN_KEY);
}

export function forgetGitHubToken(): void {
  localStorage.removeItem(GITHUB_TOKEN_KEY);
}
