import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { routes } from '../constants/routes';
import { useLibrary } from '../hooks/useLibrary';
import { buildCalendar, type CalendarEpisode } from '../services/calendarService';
import { formatDate } from '../utils/date';

function Section({ title, items }: { title: string; items: CalendarEpisode[] }) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-card">
      <h2 className="text-base font-black text-text">{title}</h2>
      <div className="mt-3 space-y-2">{items.length ? items.map((item) => <Link key={item.episode.id} to={`/series/${item.seriesId}`} className="block rounded-xl bg-background p-3 transition hover:bg-lavender/25"><p className="text-sm font-bold text-text">{item.seriesTitle}</p><p className="mt-0.5 text-xs text-text-soft">S{item.episode.season}E{item.episode.number} · {item.episode.title}</p><p className="mt-0.5 text-xs font-semibold text-primary">{formatDate(item.episode.airdate)}</p></Link>) : <p className="text-sm text-text-soft">Aucun épisode dans cette section.</p>}</div>
    </section>
  );
}

export function CalendarPage() {
  const { library } = useLibrary();
  const calendar = buildCalendar(library);
  if (!library.length) return <EmptyState title="Calendrier vide" text="Ajoute des séries à ta bibliothèque pour afficher les prochains épisodes." actionTo={routes.library} actionLabel="Ajouter une série" />;
  return <div className="space-y-5"><div><h2 className="text-2xl font-black text-text">Calendrier</h2><p className="mt-1 text-sm text-text-soft">Uniquement les épisodes futurs des séries de ta bibliothèque.</p></div><div className="grid gap-4 lg:grid-cols-2"><Section title="Aujourd’hui" items={calendar.today} /><Section title="Cette semaine" items={calendar.week} /><Section title="Ce mois" items={calendar.month} /><Section title="À venir" items={calendar.later} /></div></div>;
}
