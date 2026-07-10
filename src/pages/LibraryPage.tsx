import { FormEvent, useMemo, useState } from 'react';
import { SeriesCard } from '../components/cards/SeriesCard';
import { SearchResultCard } from '../components/cards/SearchResultCard';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input, Select } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { useLibrary } from '../hooks/useLibrary';
import { getSeriesDetails, searchSeries } from '../services/tvmazeService';
import type { SearchResult } from '../types';
import { getProgress } from '../utils/progress';

type Filter = 'all' | 'active' | 'completed' | 'not-started';

export function LibraryPage() {
  const { library, addSeries, removeSeries } = useLibrary();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const filteredLibrary = useMemo(() => library.filter((series) => {
    const progress = getProgress(series);
    if (filter === 'active') return progress > 0 && progress < 100;
    if (filter === 'completed') return progress === 100;
    if (filter === 'not-started') return progress === 0;
    return true;
  }), [filter, library]);

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try { setResults(await searchSeries(query)); } catch (searchError) { setError(searchError instanceof Error ? searchError.message : 'Recherche impossible.'); } finally { setLoading(false); }
  }

  async function onAdd(result: SearchResult) {
    setLoading(true);
    setError('');
    try { addSeries(await getSeriesDetails(result.id)); } catch (addError) { setError(addError instanceof Error ? addError.message : 'Impossible d’ajouter la série.'); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-card p-5 shadow-card">
        <h2 className="text-lg font-black text-text">Rechercher une série</h2>
        <form onSubmit={onSearch} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><Input label="Titre" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="The Bear, Fleabag, Gilmore Girls..." /><Button className="self-end" disabled={loading || !query.trim()}>Rechercher</Button></form>
        {error ? <div className="mt-4"><Alert tone="error">{error}</Alert></div> : null}
        {loading ? <div className="mt-4"><Loader /></div> : null}
        {results.length ? <div className="mt-4 grid gap-3 lg:grid-cols-2">{results.map((result) => <SearchResultCard key={result.id} result={result} disabled={library.some((series) => series.id === result.id)} onAdd={() => onAdd(result)} />)}</div> : null}
      </section>
      <section>
        <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_14rem] sm:items-end"><div><h2 className="text-lg font-black text-text">Bibliothèque</h2><p className="mt-0.5 text-sm text-text-soft">{library.length} série(s) ajoutée(s)</p></div><Select label="Filtre" value={filter} onChange={(event) => setFilter(event.target.value as Filter)}><option value="all">Toutes</option><option value="active">En cours</option><option value="completed">Terminées</option><option value="not-started">Non commencées</option></Select></div>
        {filteredLibrary.length ? <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">{filteredLibrary.map((series) => <SeriesCard key={series.id} series={series} onRemove={removeSeries} />)}</div> : <EmptyState title="Aucune série ici" text="Change le filtre ou ajoute une nouvelle série depuis la recherche." />}
      </section>
    </div>
  );
}
