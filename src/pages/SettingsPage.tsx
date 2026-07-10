import { ChangeEvent, useState } from 'react';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useLibrary } from '../hooks/useLibrary';
import { getRemoteFile, saveRemoteFile, testConnection } from '../services/githubSyncService';
import { downloadJson, forgetGitHubToken, loadGitHubConfig, readJsonFile, saveGitHubConfig } from '../services/storageService';
import type { GitHubSyncConfig } from '../types';

export function SettingsPage() {
  const { data, replaceData, refreshFromTvMaze, resetAll } = useLibrary();
  const [config, setConfig] = useState<GitHubSyncConfig>(() => loadGitHubConfig());
  const [message, setMessage] = useState<{ tone: 'info' | 'error' | 'success' | 'warning'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function updateConfig(key: keyof GitHubSyncConfig, value: string | boolean) {
    const next = { ...config, [key]: value };
    setConfig(next);
    saveGitHubConfig(next);
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = await readJsonFile(file);
      if (window.confirm('Remplacer les données locales par ce fichier JSON ?')) {
        replaceData(imported);
        setMessage({ tone: 'success', text: 'Import terminé.' });
      }
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Import impossible.' });
    } finally {
      event.target.value = '';
    }
  }

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    setMessage(null);
    try { await action(); setMessage({ tone: 'success', text: success }); } catch (error) { setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Action impossible.' }); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-8">
      <div><h2 className="mobile-title text-3xl font-black text-text">Paramètres & sauvegarde</h2><p className="mt-2 text-sm text-text-soft">À chaque ouverture, l'app récupère silencieusement le fichier publié sur GitHub Pages pour retrouver ta bibliothèque sur n'importe quel appareil. Le stockage local sert de cache hors ligne, puis le fichier publié le plus récent remet les appareils à jour.</p></div>
      {message ? <Alert tone={message.tone}>{message.text}</Alert> : null}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="mobile-card rounded-2xl bg-card p-5 shadow-card"><h3 className="text-lg font-black text-text">Données locales</h3><p className="mt-2 text-sm leading-6 text-text-soft">Tes données sont mises en cache automatiquement dans ce navigateur.</p><div className="mobile-button-stack mt-4 flex flex-wrap gap-2.5 max-[430px]:grid"><Button onClick={() => downloadJson(data)}>Exporter JSON</Button><label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-lavender/60 px-4 py-2.5 text-center text-sm font-semibold leading-tight text-text transition hover:bg-lavender">Importer JSON<input type="file" accept="application/json" className="hidden" onChange={importFile} /></label><Button variant="danger" onClick={() => { if (window.confirm('Réinitialiser toutes les données locales ?')) resetAll(); }}>Reset complet</Button></div></div>
        <div className="mobile-card rounded-2xl border border-accent/30 bg-accent/10 p-5 text-text shadow-card"><h3 className="text-lg font-black">Sécurité du token GitHub</h3><p className="mt-2 text-sm leading-6 text-text-soft">Un token personnel donne accès au dépôt configuré. Utilise un token avec les permissions minimales, idéalement limité au dépôt choisi. Le token n'est mémorisé dans ce navigateur que si tu coches l'option dédiée : sans quoi il n'est utilisé qu'en mémoire, pour l'action en cours.</p></div>
      </section>
      <section className="mobile-card rounded-2xl bg-card p-5 shadow-card">
        <h3 className="text-lg font-black text-text">Épisodes TVMaze</h3>
        <p className="mt-1 text-sm text-text-soft">Le rafraîchissement des épisodes est manuel. Il contacte TVMaze pour mettre à jour les séries déjà présentes, sans modifier tes épisodes vus/non vus.</p>
        <div className="mobile-button-stack mt-4 flex flex-wrap gap-2.5 max-[430px]:grid">
          <Button disabled={busy || !data.library.length} onClick={() => run(refreshFromTvMaze, 'Épisodes mis à jour depuis TVMaze.')}>Rafraîchir les épisodes</Button>
        </div>
      </section>
      <section className="mobile-card rounded-2xl bg-card p-5 shadow-card">
        <h3 className="text-lg font-black text-text">Sauvegarde GitHub</h3>
        <p className="mt-1 text-sm text-text-soft">La lecture est automatique (ci-dessus). L'envoi vers GitHub reste une action manuelle et explicite, comme dans DLV Guide.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input label="Nom d'utilisateur" value={config.username} onChange={(event) => updateConfig('username', event.target.value)} />
          <Input label="Repository" value={config.repository} onChange={(event) => updateConfig('repository', event.target.value)} />
          <Input label="Branche" value={config.branch} onChange={(event) => updateConfig('branch', event.target.value)} />
          <Input label="Chemin du fichier JSON" value={config.filePath} onChange={(event) => updateConfig('filePath', event.target.value)} />
          <Input label="Token GitHub personnel" type="password" value={config.token || ''} onChange={(event) => updateConfig('token', event.target.value)} />
          <label className="flex items-center gap-3 rounded-2xl bg-lavender/30 px-4 py-3 text-sm font-semibold text-text"><input type="checkbox" checked={config.rememberToken} onChange={(event) => updateConfig('rememberToken', event.target.checked)} />Mémoriser le token sur cet appareil</label>
        </div>
        <div className="mobile-button-stack mt-5 flex flex-wrap gap-2.5 max-[430px]:grid">
          <Button disabled={busy} variant="secondary" onClick={() => run(() => testConnection(config), 'Connexion GitHub validée.')}>Tester la connexion</Button>
          <Button disabled={busy} onClick={() => run(async () => { if (!window.confirm('Écraser le fichier GitHub existant avec les données locales ?')) return; saveGitHubConfig(config); await saveRemoteFile(config, data); }, 'Sauvegarde envoyée. GitHub Pages va republier le fichier, puis les autres appareils le récupéreront à l’ouverture.')}>Sauvegarder sur GitHub</Button>
          <Button disabled={busy} variant="secondary" onClick={() => run(async () => { if (!window.confirm('Remplacer les données locales par les données GitHub ?')) return; const remote = await getRemoteFile(config); replaceData(remote.data); }, 'Données GitHub chargées.')}>Forcer le rechargement</Button>
          <Button variant="ghost" onClick={() => { forgetGitHubToken(); setConfig((current) => ({ ...current, token: '', rememberToken: false })); setMessage({ tone: 'success', text: 'Token supprimé de ce navigateur.' }); }}>Supprimer le token enregistré</Button>
        </div>
      </section>
    </div>
  );
}
