'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import SearchAlbumCard from '@/components/SearchAlbumCard';

export default function SearchPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    setAlbums(data.albums?.items || []);
    setArtists(data.artists?.items || []);
  };

  return (
    <div className="pt-24 text-white">
      <Navbar />

      <div className="text-center px-4">
        <h1 className="text-3xl font-bold mb-4">
          All Music, At Your Fingertips
        </h1>

        {/* Centered search bar */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Albums Section */}
      {albums.length > 0 && (
        <div className="px-4">
          <h2 className="text-2xl mt-8 mb-4 font-semibold">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from(
              new Map(
                albums.map((a) => [
                  `${a.name}-${a.artists.map((ar: any) => ar.name).join(',')}`,
                  a,
                ])
              ).values()
            ).map((album) => (
              <SearchAlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>
      )}

      {/* Artists Section */}
      {artists.length > 0 && (
        <div className="px-4">
          <h2 className="text-2xl mt-12 mb-4 font-semibold">Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="bg-gray-800 p-3 rounded text-center hover:bg-gray-700 transition"
              >
                {artist.images?.[0] && (
                  <Image
                    src={artist.images[0].url}
                    alt={artist.name}
                    width={200}
                    height={200}
                    className="rounded-full mx-auto"
                  />
                )}
                <p className="mt-2 font-semibold">{artist.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
