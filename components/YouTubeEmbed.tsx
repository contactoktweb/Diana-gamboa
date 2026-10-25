'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

/* Carga el reproductor de YouTube solo al pulsar, para que el portal sea rápido. */
export default function YouTubeEmbed({ videoId, listId, title }: { videoId: string; listId?: string; title: string }) {
  const [play, setPlay] = useState(false);
  const src = `https://www.youtube-nocookie.com/embed/${listId ? `videoseries?list=${listId}&` : `${videoId}?`}autoplay=1&rel=0`;
  return <div className="video">
    {play
      ? <iframe src={src} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      : <button type="button" className="video-poster" onClick={() => setPlay(true)} aria-label={`Reproducir: ${title}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" loading="lazy" />
        <span className="video-play"><Play size={30} fill="currentColor" aria-hidden="true" /></span>
      </button>}
  </div>;
}
