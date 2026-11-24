/** Extrae el id de video y, si es completo, el id de la lista de un enlace de YouTube. */
export function parseYouTube(url: string) {
  try {
    const u = new URL(url.trim());
    const list = u.searchParams.get('list');
    let videoId = u.searchParams.get('v') ?? '';
    if (!videoId && u.hostname.includes('youtu.be')) videoId = u.pathname.slice(1);
    if (!videoId && u.pathname.startsWith('/shorts/')) videoId = u.pathname.split('/')[2] ?? '';
    if (!videoId && u.pathname.startsWith('/live/')) videoId = u.pathname.split('/')[2] ?? '';
    // Ids de lista: letras, números, «-» y «_» (YouTube tiene listas con ids cortos, como PLbBQjGvksi1Y).
    const listId = list && /^[A-Za-z0-9_-]{10,}$/.test(list) ? list : undefined;
    if (!videoId && !listId) return null;
    return { videoId, listId };
  } catch {
    return null;
  }
}

/** Dirección de la consulta pública de YouTube (oEmbed) que da el título y la miniatura de un video o una playlist. */
export function urlOEmbed(url: string) {
  const yt = parseYouTube(url);
  if (!yt) return null;
  const canonica = yt.listId && !yt.videoId ? `https://www.youtube.com/playlist?list=${yt.listId}` : url.trim();
  return `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(canonica)}`;
}
