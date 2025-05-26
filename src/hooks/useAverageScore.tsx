// hooks/useAverageScore.ts
'use client';
import { useEffect, useState } from 'react';

export default function useAverageScore(albumId: string) {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch(`/api/reviews?albumId=${albumId}`);
        const data = await res.json();
        if (data.length > 0) {
          const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length;
          setScore(avg);
        } else {
          setScore(null);
        }
      } catch (err) {
        setScore(null);
      }
    }

    fetchScore();
  }, [albumId]);

  return score;
}
