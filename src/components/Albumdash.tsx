'use client';

import { useEffect, useState } from 'react';
import ReviewForm from './ReviewForm';
import ScorePill from './ScorePill';
import useUser from '@/hooks/useUser';
import { useRouter } from 'next/navigation';

export default function AlbumReviewSection({ albumId }: { albumId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState<{ rating: number; comment: string }[]>([]);
  const {user} = useUser();
  const router = useRouter();

  // ✅ Fetch reviews once on mount
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

  // ✅ Called when new review is submitted
  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!user) {
      router.push('/signup');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId, rating, text: comment, userId: user.id }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [...prev, newReview]); // ✅ updates score
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
        {/* ✅ Will re-render automatically when averageRating updates */}
        <ScorePill score={averageRating} />
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-white font-bold border border-white rounded hover:bg-white hover:text-black transition"
        >
          +
        </button>
      </div>

      {showForm && (
        <ReviewForm
          userId={user?.id || null}
          onClose={() => setShowForm(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
