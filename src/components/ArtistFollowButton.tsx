// app/components/FollowArtistButton.tsx
'use client';

import { useEffect, useState } from 'react';

export default function FollowArtistButton({ artistId }: { artistId: string }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // check if following
    const checkFollow = async () => {
      try {
        const res = await fetch(`/api/artist/is-following?id=${artistId}`);
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      } catch (err) {
        console.error('Error checking follow status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkFollow();
  }, [artistId]);

  const handleToggleFollow = async () => {
    try {
      const res = await fetch(`/api/artist/${isFollowing ? 'unfollow' : 'follow'}`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId }),
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      console.error('Follow/unfollow error:', err);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <button
      onClick={handleToggleFollow}
      className={`mt-4 px-4 py-2 rounded text-white ${
        isFollowing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}
