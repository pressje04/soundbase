'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useUser from '@/hooks/useUser';
import ReviewForm from '@/components/ReviewForm';

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser(); // ✅ destructure new loading state

  const preselectedAlbumId = searchParams.get('albumId');
  const [albumId, setAlbumId] = useState(preselectedAlbumId || '');
  const [albums, setAlbums] = useState<any[]>([]);

  // ⛔️ Don't redirect until loading completes
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/signup'); // prevent back loop
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!preselectedAlbumId) {
      fetch('/api/albums')
        .then((res) => res.json())
        .then(setAlbums)
        .catch(console.error);
    }
  }, [preselectedAlbumId]);

  // ⏳ Show loading message while checking auth
  if (loading) {
    return <div className="text-white text-center p-10">Checking authentication...</div>;
  }

  // ❌ If unauthenticated, do not render anything
  if (!user) return null;

  const handleSubmit = async (score: number, comment: string) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        albumId,
        rating: score,
        comment,
        userId: user.id,
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

        {albumId && (
          <ReviewForm
            userId={user.id}
            onClose={() => router.push(`/albums/${albumId}`)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
