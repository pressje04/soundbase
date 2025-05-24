'use client';

import {useState} from 'react';
import SearchBar from '@/components/SearchBar';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchPage() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [artists, setArtists] = useState<any[]>([]);

    const handleSearch = async (query:string) => {
        const res = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query}),
        });

        const data = await res.json();
        setAlbums(data.albums?.items || []);
        setArtists(data.artists?.items || []);
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-4">Search Soundbase</h1>
            <SearchBar onSearch={handleSearch}/>

            {/*Albums Logic*/}
            {albums.length > 0 && (
                <>
                    <h2 className="text-2xl mt-8 mb-4 font-semibold">Albums</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {albums.map(album => (
                            <Link href={`/albums/${album.id}`} key={album.id}>
                                <div className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition">
                                    <Image
                                        src={album.images?.[0]?.url || ''}
                                        alt={album.name}
                                        width={200}
                                        height={200}
                                        className="rounded"
                                    />
                                    <p className="mt-2 font-semibold">{album.name}</p>
                                    <p className="text-sm text-gray-400">{album.artists?.[0]?.name}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}

            {/*Artist Logic*/}
            {artists.length > 0 && (
        <>
            <h2 className="text-2xl mt-12 mb-4 font-semibold">Artists</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {artists.map(artist => (
                    <div key={artist.id} className="bg-gray-800 p-3 rounded text-center hover:bg-gray-700 transition">
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
        </>
      )}
        </div>
    )
}