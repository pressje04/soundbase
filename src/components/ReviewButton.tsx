'use client';

import { useRouter } from 'next/navigation';

export default function AlbumReviewButton({ albumId }: { albumId: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/reviews?albumId=${albumId}`)}
      className="mt-4 text-xl ml-6 px-4 py-2 text-white font-bold border border-white rounded hover:bg-white hover:text-black transition"
    >
      +
    </button>
  );
}