'use client';

import { useEffect, useState } from 'react';
import ScorePill from './ScorePill';
import Image from 'next/image';

export default function ReviewList({ albumId }: { albumId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function fetchReviews() {
      const res = await fetch(`/api/reviews?albumId=${albumId}`);
      const data = await res.json();
      setReviews(data);
    }
    fetchReviews();
  }, [albumId]);

  if (reviews.length === 0) {
    return <p className="text-gray-400 mt-6">No reviews yet. Wanna be the first?</p>;
  }

  return (
    <div className="mt-8 mb-24 space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-700">
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            <div className="shrink-0">
              {review.user?.image ? (
                <Image
                  src={review.user.image}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full object-cover w-12 h-12"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
                  {review.user?.firstName?.charAt(0) ?? 'A'}
                </div>
              )}
            </div>

            {/* Review Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  {review.user?.firstName ?? 'Anonymous'}
                </span>
                <ScorePill size="md" score={review.rating} />
              </div>
              {review.comment && (
                <p className="mt-1 text-gray-300 whitespace-pre-wrap">{review.comment}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{new Date(review.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
