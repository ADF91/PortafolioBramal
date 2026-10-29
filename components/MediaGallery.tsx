'use client';

import { useState } from 'react';
import { mediaUrl } from '@/lib/media';
import type { MediaItem } from '@/lib/types';

export default function MediaGallery({ items, title }: { items: MediaItem[]; title: string }) {
  const [index, setIndex] = useState(0);
  if (!items.length) return null;
  const current = items[Math.min(index, items.length - 1)];

  return (
    <div className="gallery">
      <div className="gallery-stage">
        {current.kind === 'video' ? (
          <video
            key={current.src}
            src={mediaUrl(current.src)}
            poster={mediaUrl(current.poster) || undefined}
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(current.src)} alt={current.caption || title} />
        )}
      </div>
      {current.caption && <p className="gallery-caption">{current.caption}</p>}
      {items.length > 1 && (
        <div className="gallery-thumbs">
          {items.map((m, i) => (
            <button
              key={`${m.src}-${i}`}
              className={`gallery-thumb${i === index ? ' active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Ver ${m.kind === 'video' ? 'video' : 'imagen'} ${i + 1}`}
            >
              {m.kind === 'video' && !m.poster ? (
                <video src={`${mediaUrl(m.src)}#t=0.5`} muted preload="metadata" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(m.kind === 'video' ? m.poster : m.src)} alt="" loading="lazy" />
              )}
              {m.kind === 'video' && <span className="play">▶</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
