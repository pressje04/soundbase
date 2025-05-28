'use client';

import {useEffect, useState} from 'react';
import ScorePill from './ScorePill';

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
        <div className="mt-8 mb-24 space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-black rounded p-4 shadow">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-600">
                  {review.user?.firstName ?? 'Anonymous'}
                </span>
                <ScorePill size={'md'} score={review.rating} />
              </div>
              {review.comment && <p className="mt-2 text-gray-200">{review.comment}</p>}
            </div>
          ))}
        </div>
      );
}