// components/SearchAlbumCard.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScorePill from './ScorePill';

function useAverageScore(albumId: string) {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch(`/api/reviews?albumId=${albumId}`);
        const data = await res.json();
        if (data.length > 0) {
          const avg =
            data.reduce((acc: number, r: any) => acc + r.rating, 0) / data.length;
          setScore(avg);
        } else {
          setScore(null);
        }
      } catch {
        setScore(null);
      }
    }

    fetchScore();
  }, [albumId]);

  return score;
}

export default function SearchAlbumCard({ album }: { album: any }) {
  const score = useAverageScore(album.id);

  return (
    <Link href={`/albums/${album.id}`}>
      <div className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition relative">
        <Image
          src={album.images?.[0]?.url || ''}
          alt={album.name}
          width={200}
          height={200}
          className="rounded"
        />
        <p className="mt-2 font-semibold">{album.name}</p>
        <p className="text-sm text-gray-400">{album.artists?.[0]?.name}</p>

        {/* ScorePill in top-right corner */}
        <div className="absolute bottom-8 right-2">
          <ScorePill score={score} size="sm" />
        </div>
      </div>
    </Link>
  );
}
