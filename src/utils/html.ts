export function stripHtml(value: string | null | undefined): string {
  if (!value) return '';
  const parser = new DOMParser();
  return parser.parseFromString(value, 'text/html').body.textContent?.trim() || '';
}
