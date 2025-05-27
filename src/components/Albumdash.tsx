'use client';

import { useEffect, useState } from 'react';
import ReviewForm from './ReviewForm';
import ScorePill from './ScorePill';
import useUser from '@/hooks/useUser';
import { useRouter } from 'next/navigation';

type Props = {
  albumId: string;
  albumName: string;
  artistName: string;
  releaseYear: string;
  imageUrl: string;
};

export default function AlbumReviewSection({
  albumId,
  albumName,
  artistName,
  releaseYear,
  imageUrl,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState<{ rating: number; comment: string }[]>([]);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?albumId=${albumId}`);
        const data = await res.json();
        setReviews(data || []);
      } catch (error) {
        console.error('Failed to load reviews:', error);
      }
    }

    fetchReviews();
  }, [albumId]);

  const handleReviewSubmit = async ({
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
    if (!user) {
      router.push('/signup');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumId,
          albumName,
          artistName,
          releaseYear,
          imageUrl,
          rating: score,
          text,
          userId: user.id,
        }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [...prev, newReview]);
      } else {
        const error = await res.json();
        console.error('Error submitting review:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <ScorePill score={averageRating} />
        <button
          onClick={() => setShowForm(true)}
          className="text-xl px-4 py-2 text-white font-bold border border-white rounded hover:bg-white hover:text-black transition"
        >
          +
        </button>
      </div>

      {showForm && (
        <ReviewForm
          userId={user?.id || null}
          onClose={() => setShowForm(false)}
          onSubmit={handleReviewSubmit}
          albumName={albumName}
          artistName={artistName}
          releaseYear={releaseYear}
          imageUrl={imageUrl}
        />
      )}
    </div>
  );
}
