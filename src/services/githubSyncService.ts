import type { GitHubSyncConfig, UserData } from '../types';
import { validateUserData } from './storageService';

interface GitHubFileResponse {
  content: string;
  sha: string;
}

interface NormalizedGitHubSyncConfig extends GitHubSyncConfig {
  token: string;
}

function normalizeConfig(config: GitHubSyncConfig): NormalizedGitHubSyncConfig {
  const normalized = {
    ...config,
    username: config.username.trim(),
    repository: config.repository.trim(),
    branch: config.branch.trim(),
    filePath: config.filePath.trim().replace(/^\/+/, ''),
    token: (config.token || '').trim(),
  };
  if (!normalized.username || !normalized.repository || !normalized.branch || !normalized.filePath || !normalized.token) {
    throw new Error('Complète la configuration GitHub et le token avant de continuer.');
  }
  return normalized;
}

function apiUrl(config: GitHubSyncConfig): string {
  const path = config.filePath.split('/').map((part) => encodeURIComponent(part)).join('/');
  return `https://api.github.com/repos/${encodeURIComponent(config.username)}/${encodeURIComponent(config.repository)}/contents/${path}`;
}

function repoUrl(config: GitHubSyncConfig): string {
  return `https://api.github.com/repos/${encodeURIComponent(config.username)}/${encodeURIComponent(config.repository)}`;
}

function branchUrl(config: GitHubSyncConfig): string {
  return `${repoUrl(config)}/branches/${encodeURIComponent(config.branch)}`;
}

function headers(token: string): HeadersInit {
  return { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' };
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function decodeBase64(value: string): string {
  const binary = atob(value.replace(/\n/g, ''));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

async function handleError(response: Response): Promise<never> {
  if (response.status === 401) throw new Error('Token GitHub invalide ou expiré.');
  if (response.status === 403) throw new Error('GitHub refuse la requête. Vérifie les permissions minimales du token ou la limite API.');
  if (response.status === 404) throw new Error('Dépôt, branche ou fichier introuvable.');
  if (response.status === 409) throw new Error('Conflit GitHub : le fichier a été modifié entre-temps.');
  throw new Error(`Erreur GitHub ${response.status}.`);
}

async function ensureBranchExists(config: NormalizedGitHubSyncConfig): Promise<void> {
  const response = await fetch(branchUrl(config), { headers: headers(config.token) });
  if (response.ok) return;
  if (response.status === 404) {
    throw new Error('Branche GitHub introuvable. Vérifie le champ "Branche" avant de sauvegarder.');
  }
  await handleError(response);
}

export async function getRemoteFile(config: GitHubSyncConfig): Promise<{ data: UserData; sha: string }> {
  const normalized = normalizeConfig(config);
  const response = await fetch(`${apiUrl(normalized)}?ref=${encodeURIComponent(normalized.branch)}`, { headers: headers(normalized.token) });
  if (!response.ok) await handleError(response);
  const file = (await response.json()) as GitHubFileResponse;
  const parsed = JSON.parse(decodeBase64(file.content)) as unknown;
  if (!validateUserData(parsed)) throw new Error('Le fichier GitHub ne correspond pas au format Series Journal.');
  return { data: parsed, sha: file.sha };
}

export async function testConnection(config: GitHubSyncConfig): Promise<void> {
  const normalized = normalizeConfig(config);
  const response = await fetch(repoUrl(normalized), { headers: headers(normalized.token) });
  if (!response.ok) await handleError(response);
  await ensureBranchExists(normalized);
}

export async function saveRemoteFile(config: GitHubSyncConfig, data: UserData): Promise<void> {
  const normalized = normalizeConfig(config);
  await ensureBranchExists(normalized);
  let sha: string | undefined;
  const existing = await fetch(`${apiUrl(normalized)}?ref=${encodeURIComponent(normalized.branch)}`, { headers: headers(normalized.token) });
  if (existing.ok) sha = ((await existing.json()) as GitHubFileResponse).sha;
  else if (existing.status !== 404) await handleError(existing);
  const response = await fetch(apiUrl(normalized), {
    method: 'PUT',
    headers: { ...headers(normalized.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: sha ? 'Update Series Journal data' : 'Create Series Journal data', content: encodeBase64(JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2)), branch: normalized.branch, sha }),
  });
  if (response.status === 404) throw new Error('Sauvegarde impossible : GitHub ne trouve pas ce dépôt avec ce token. Vérifie le compte, le dépôt et les droits d’écriture du token.');
  if (!response.ok) await handleError(response);
}
