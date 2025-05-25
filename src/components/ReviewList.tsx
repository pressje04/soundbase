'use client';

import {useEffect, useState} from 'react';

export default function ReviewList({albumId}: {albumId: string}) {
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
        <div className="mt-8 space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-900 rounded p-4 shadow">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-400">
                  {review.user?.firstName ?? 'Anonymous'}
                </span>
                <span className="text-yellow-400 font-bold">
                  {review.rating.toFixed(1)} / 10
                </span>
              </div>
              {review.comment && <p className="mt-2 text-gray-200">{review.comment}</p>}
            </div>
          ))}
        </div>
      );
}