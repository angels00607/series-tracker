import type { Episode, SearchResult, Season, Series } from '../types';
import { stripHtml } from '../utils/html';

const API_URL = 'https://api.tvmaze.com';

interface TvMazeShow {
  id: number;
  name: string;
  image: { medium?: string; original?: string } | null;
  summary: string | null;
  genres: string[];
  status: string;
}

interface TvMazeEpisode {
  id: number;
  name: string;
  season: number;
  number: number | null;
  airdate: string | null;
  runtime: number | null;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) throw new Error(`TVMaze a répondu avec le code ${response.status}.`);
  return response.json() as Promise<T>;
}

function toSearchResult(show: TvMazeShow): SearchResult {
  return {
    id: show.id,
    title: show.name,
    poster: show.image?.medium || show.image?.original || null,
    summary: stripHtml(show.summary),
    genres: show.genres || [],
    status: show.status,
  };
}

function toEpisode(episode: TvMazeEpisode): Episode {
  return {
    id: episode.id,
    season: episode.season,
    number: episode.number || 0,
    title: episode.name,
    airdate: episode.airdate,
    runtime: episode.runtime,
  };
}

function groupSeasons(episodes: Episode[]): Season[] {
  const seasons = new Map<number, Episode[]>();
  episodes.forEach((episode) => seasons.set(episode.season, [...(seasons.get(episode.season) || []), episode]));
  return Array.from(seasons.entries())
    .sort(([a], [b]) => a - b)
    .map(([number, seasonEpisodes]) => ({ number, episodes: seasonEpisodes.sort((a, b) => a.number - b.number) }));
}

export async function searchSeries(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await request<Array<{ show: TvMazeShow }>>(`/search/shows?q=${encodeURIComponent(query.trim())}`);
  return data.map(({ show }) => toSearchResult(show));
}

export async function getSeriesDetails(id: number): Promise<Series> {
  const [show, rawEpisodes] = await Promise.all([request<TvMazeShow>(`/shows/${id}`), request<TvMazeEpisode[]>(`/shows/${id}/episodes`)]);
  const episodes = rawEpisodes.map(toEpisode).sort((a, b) => a.season - b.season || a.number - b.number);
  return { ...toSearchResult(show), seasons: groupSeasons(episodes), episodes };
}
