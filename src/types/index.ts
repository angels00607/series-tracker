export interface Episode {
  id: number;
  season: number;
  number: number;
  title: string;
  airdate: string | null;
  runtime: number | null;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Series {
  id: number;
  title: string;
  poster: string | null;
  summary: string;
  genres: string[];
  status: string;
  seasons: Season[];
  episodes: Episode[];
}

export interface WatchedEpisode {
  episodeId: number;
  watchedAt: string;
}

export interface LibrarySeries extends Series {
  addedAt: string;
  watchedEpisodes: WatchedEpisode[];
}

export interface UserData {
  version: number;
  updatedAt: string;
  library: LibrarySeries[];
  removedIds?: number[];
}

export interface GitHubSyncConfig {
  username: string;
  repository: string;
  branch: string;
  filePath: string;
  token?: string;
  rememberToken: boolean;
}

export interface Stats {
  totalSeries: number;
  completedSeries: number;
  activeSeries: number;
  watchedEpisodes: number;
  remainingEpisodes: number;
  watchedMinutes: number;
  watchedThisMonth: number;
  topGenres: Array<{ genre: string; count: number }>;
}

export interface SearchResult {
  id: number;
  title: string;
  poster: string | null;
  summary: string;
  genres: string[];
  status: string;
}
