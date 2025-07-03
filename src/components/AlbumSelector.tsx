'use client';

import { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';

type Album = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
};

export default function AlbumSelector({ onSelect }: { onSelect: (album: Album) => void }) {
  const [query, setQuery] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);

  const fetchAlbums = debounce(async (q: string) => {
    if (!q) return;
    const res = await fetch(`/api/spotify/search?query=${encodeURIComponent(q)}`);
    const data = await res.json();
    setAlbums(data.albums || []);
  }, 300);

  useEffect(() => {
    fetchAlbums(query);
    return () => fetchAlbums.cancel();
  }, [query]);

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search albums..."
        className="w-full p-2 border border-gray-300 rounded"
      />
      <div className="mt-2 max-h-60 overflow-y-auto">
        {albums.map((album) => (
          <div
            key={album.id}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
            onClick={() => {
              onSelect(album);
              setQuery(''); 
              setAlbums([]);   
            }}
          >
            <img src={album.images[0]?.url} className="w-10 h-10 rounded" alt="" />
            <div>
              <div className="font-semibold">{album.name}</div>
              <div className="text-sm text-gray-500">{album.artists.map(a => a.name).join(', ')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
