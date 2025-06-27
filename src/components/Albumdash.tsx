'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
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
  tracklist: {id: string; name: string}[];
  onPostSubmit?: (post: any) => void;
};

export default function Albumdash(props: Props) {
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const { user } = useUser();
  const router = useRouter();

  const fetchReviews = async () => {
    const res = await fetch(`/api/reviews?albumId=${props.albumId}&_=${Date.now()}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    setReviews(data || []);
  };

  useEffect(() => {
    fetchReviews();
  }, [props.albumId]);

  const handleReviewSubmit = async ({
    score,
    text,
    isReview,
    trackRanking,
  }: {
    score: number;
    text: string;
    isReview: boolean;
    trackRanking?: string[];
  }) => {
    if (!user) return router.push('/signup');

    const res = await fetch('/api/posts/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        albumId: props.albumId,
        albumName: props.albumName,
        artistName: props.artistName,
        imageUrl: props.imageUrl,
        rating: score,
        comment: text,
        isReview,
        parentId: null,
        trackRanking,
      }),
    });

    if (res.ok) {
      const createdPost = await res.json();
      const fullPostRes = await fetch(`/api/posts/${createdPost.id}`);
      const fullPost = await fullPostRes.json();
    
      props.onPostSubmit?.(fullPost); // ✅ trigger the parent callback
      router.refresh(); // optional if you want to still refresh the page
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null;

  return (
    <div className="mt-4 md:mt-0">
      <div className="flex items-center gap-4">
        <ScorePill score={avgRating} />
        <button
          onClick={() => setShowForm(true)}
          className="text-xl px-4 py-2 text-white font-bold border border-white rounded hover:bg-white hover:text-black transition"
        >
          +
        </button>

        <button
  onClick={() => {
    const el = document.getElementById('discussion');
    el?.scrollIntoView({ behavior: 'smooth' });
  }}
  className="text-xl px-3 py-3 text-white font-bold border border-white rounded hover:bg-white hover:text-black transition flex items-center justify-center"
  aria-label="Jump to Discussion"
>
  <MessageCircle size={20} />
</button>


      </div>

      {showForm && (
        <ReviewForm
          userId={user?.id || null}
          onClose={() => setShowForm(false)}
          onSubmit={({ score, text, trackRanking }) => handleReviewSubmit({ score, text, isReview: true, trackRanking })}
          albumName={props.albumName}
          artistName={props.artistName}
          releaseYear={props.releaseYear}
          imageUrl={props.imageUrl}
          tracklist={props.tracklist}
        />
      )}
    </div>
  );
}
