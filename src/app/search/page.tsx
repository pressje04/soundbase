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
  const [users, setUsers] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'albums' | 'artists' | 'users'>('albums');
  const [hasSearched, setHasSearched] = useState(false); // ✅ NEW: tracks if a search has occurred
  const [lastQuery, setLastQuery] = useState(''); // ✅ NEW: remember last query for tab switching

  // ✅ Handles search for albums/artists or users based on active tab
  const handleSearch = async (query: string, tabOverride?: 'albums' | 'artists' | 'users') => {
    const currentTab = tabOverride || activeTab;
    setHasSearched(true);
    setLastQuery(query);

    if (currentTab === 'users') {
      const res = await fetch(`/api/search/users?query=${query}`);
      const data = await res.json();
      setUsers(data || []);
      return;
    }

    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    const rawAlbums = data.albums?.items || [];

    // ✅ De-duplicate albums by name/artist, prefer explicit versions
    const albumMap = new Map();
    rawAlbums.forEach((album: any) => {
      const key = `${album.name.toLowerCase()}-${album.artists.map((ar: any) => ar.name.toLowerCase()).join(',')}`;
      const existing = albumMap.get(key);
      if (!existing || (album.explicit && !existing.explicit)) {
        albumMap.set(key, album);
      }
    });

    setAlbums(Array.from(albumMap.values()));
    setArtists(data.artists?.items || []);
  };

  // ✅ Handles tab switching and triggers search for new tab using last query
  const handleTabChange = (tab: 'albums' | 'artists' | 'users') => {
    setActiveTab(tab);
    setAlbums([]);
    setArtists([]);
    setUsers([]);
    if (lastQuery) {
      handleSearch(lastQuery, tab);
    }
  };

  return (
    <div className="pt-32 text-white">
      <Navbar />

      <div className="text-center px-4">
        <h1 className="text-3xl font-bold mb-4">
          All Music - At Your Fingertips
        </h1>

        {/* Centered search bar */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* ✅ Tab bar appears only after a search */}
      {hasSearched && (
        <div className="flex justify-center mb-6 space-x-6 text-lg font-medium border-b border-gray-600">
          {['albums', 'artists', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as 'albums' | 'artists' | 'users')}
              className={`pb-2 ${
                activeTab === tab ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Albums Section */}
      {activeTab === 'albums' && albums.length > 0 && (
        <div className="px-4">
          <h2 className="text-2xl mt-8 mb-4 font-semibold">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {albums.map((album) => (
              <SearchAlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>
      )}

      {/* Artists Section */}
      {activeTab === 'artists' && artists.length > 0 && (
        <div className="px-4">
          <h2 className="text-2xl mt-12 mb-4 font-semibold">Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="bg-gray-800 p-3 rounded text-center hover:bg-gray-700 transition"
              >
                <Link href={`/artists/${artist.id}`} className="hover:text-gray-300">
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
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Section */}
      {activeTab === 'users' && users.length > 0 && (
        <div className="px-4">
          <h2 className="text-2xl mt-12 mb-4 font-semibold">Users</h2>
          <div className="space-y-4">
            {users.map((user) => (
              <Link key={user.id} href={`/profile/${user.id}`} className="block hover:bg-gray-800 rounded p-3 transition">
                <div className="flex items-center space-x-4">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.username}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
                  {user.firstName?.charAt(0) ?? 'A'}
                  </div>
                )}

                  <div>
                    <p className="text-white font-semibold">@{user.username}</p>
                    <p className="text-gray-400 text-sm">{user.firstName}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
