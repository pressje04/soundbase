'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TopAlbumCarousel() {
  const [albums, setAlbums] = useState<
    { id: string; imageUrl: string; name: string }[]
  >([]);

  useEffect(() => {
    async function fetchAlbums() {
      const res = await fetch('/api/albums/top10');
      const data = await res.json();
      setAlbums(data);
    }
    fetchAlbums();
  }, []);

  if (!albums.length) return null;

  const duplicatedAlbums = [...albums, ...albums]; // create cyclic effect

  return (
    <div className="overflow-hidden mb-12 px-2">
      <div className="flex gap-6 animate-scroll-x-cyclic w-max">
        {duplicatedAlbums.map((album, idx) => (
          <div
            key={`${album.id}-${idx}`} // prevent duplicate key warning
            className="flex-shrink-0 w-32 h-32 relative"
          >
            <Image
              src={album.imageUrl}
              alt={album.name}
              fill
              className="rounded-xl object-cover shadow-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

