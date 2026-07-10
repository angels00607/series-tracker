import type { Episode, LibrarySeries } from '../types';
import { isThisMonth, isThisWeek, isToday } from '../utils/date';

export interface CalendarEpisode {
  seriesId: number;
  seriesTitle: string;
  episode: Episode;
}

export interface CalendarSections {
  today: CalendarEpisode[];
  week: CalendarEpisode[];
  month: CalendarEpisode[];
  later: CalendarEpisode[];
}

export function buildCalendar(library: LibrarySeries[]): CalendarSections {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const upcoming = library
    .flatMap((series) =>
      series.episodes
        .filter((episode) => episode.airdate && new Date(episode.airdate).getTime() >= todayStart)
        .map((episode) => ({ seriesId: series.id, seriesTitle: series.title, episode })),
    )
    .sort((a, b) => new Date(a.episode.airdate || '').getTime() - new Date(b.episode.airdate || '').getTime());
  return {
    today: upcoming.filter((item) => item.episode.airdate && isToday(item.episode.airdate)),
    week: upcoming.filter((item) => item.episode.airdate && !isToday(item.episode.airdate) && isThisWeek(item.episode.airdate)),
    month: upcoming.filter((item) => item.episode.airdate && !isThisWeek(item.episode.airdate) && isThisMonth(item.episode.airdate)),
    later: upcoming.filter((item) => item.episode.airdate && !isThisMonth(item.episode.airdate)),
  };
}
