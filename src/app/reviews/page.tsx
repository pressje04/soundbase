'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useUser from '@/hooks/useUser';
import ReviewForm from '@/components/ReviewForm';

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();

  const preselectedAlbumId = searchParams.get('albumId');
  const [albumId, setAlbumId] = useState(preselectedAlbumId || '');
  const [albums, setAlbums] = useState<any[]>([]);
  const [albumMeta, setAlbumMeta] = useState<{
    albumName: string;
    artistName: string;
    releaseYear: string;
    imageUrl: string;
  } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/signup');
  }, [loading, user, router]);

  useEffect(() => {
    if (!preselectedAlbumId) {
      fetch('/api/albums')
        .then((res) => res.json())
        .then(setAlbums)
        .catch(console.error);
    }
  }, [preselectedAlbumId]);

  useEffect(() => {
    async function fetchAlbumDetails() {
      if (!albumId) return;

      try {
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        const albumRes = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const album = await albumRes.json();

        setAlbumMeta({
          albumName: album.name,
          artistName: album.artistName.map((a: any) => a.name).join(', '),
          releaseYear: album.release_date.slice(0, 4),
          imageUrl: album.images?.[0]?.url || '',
        });
      } catch (err) {
        console.error('Error fetching album details:', err);
      }
    }

    fetchAlbumDetails();
  }, [albumId]);

  if (loading) {
    return <div className="text-white text-center p-10">Checking authentication...</div>;
  }

  if (!user) return null;

  const handleSubmit = async ({
    score,
    text,
    albumName,
    artistName,
    releaseYear,
    imageUrl,
  }: {
    score: number;
    text: string;
    albumName: string;
    artistName: string;
    releaseYear: string;
    imageUrl: string;
  }) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        albumId,
        rating: score,
        text,
        albumName,
        artistName,
        releaseYear,
        imageUrl,
      }),
    });

    if (res.ok) {
      router.push(`/albums/${albumId}`);
    } else {
      const err = await res.json();
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl">
        {!albumId && (
          <div className="mb-6">
            <label className="block mb-2 text-lg font-semibold">Select an album</label>
            <select
              value={albumId}
              onChange={(e) => setAlbumId(e.target.value)}
              className="w-full p-2 text-black rounded"
            >
              <option value="">-- Choose an album --</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {albumId && albumMeta && (
          <ReviewForm
            userId={user.id}
            onClose={() => router.push(`/albums/${albumId}`)}
            onSubmit={handleSubmit}
            albumName={albumMeta.albumName}
            artistName={albumMeta.artistName}
            releaseYear={albumMeta.releaseYear}
            imageUrl={albumMeta.imageUrl}
          />
        )}
      </div>
    </div>
  );
}
