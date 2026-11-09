/** Extrae el id de video y, si es completo, el id de la lista de un enlace de YouTube. */
export function parseYouTube(url: string) {
  try {
    const u = new URL(url.trim());
    const list = u.searchParams.get('list');
    let videoId = u.searchParams.get('v') ?? '';
    if (!videoId && u.hostname.includes('youtu.be')) videoId = u.pathname.slice(1);
    if (!videoId && u.pathname.startsWith('/shorts/')) videoId = u.pathname.split('/')[2] ?? '';
    if (!videoId && u.pathname.startsWith('/live/')) videoId = u.pathname.split('/')[2] ?? '';
    // Los ids de lista válidos tienen 34 caracteres; los recortados se ignoran.
    const listId = list && list.length >= 24 ? list : undefined;
    if (!videoId && !listId) return null;
    return { videoId, listId };
  } catch {
    return null;
  }
}
