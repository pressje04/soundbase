'use client';

import Image from 'next/image';
import ScorePill from './ScorePill';

type FavoriteAlbumCardProps = {
  albumId: string;
  albumName: string;
  artistName: string;
  releaseYear: string;
  imageUrl: string;
  userRating: number;
};

export default function FavoriteAlbumCard({
  albumId,
  albumName,
  artistName,
  releaseYear,
  imageUrl,
  userRating,
}: FavoriteAlbumCardProps) {
  return (
    <a
      href={`/albums/${albumId}`}
      className="flex flex-col md:flex-row items-center gap-4 p-4 border bg-gray-900 border-gray-600 rounded hover:bg-gray-800 transition"
    >
      {/* Album Image */}
      <Image
        src={imageUrl}
        alt={albumName}
        width={160}
        height={160}
        className="rounded shadow"
      />

      {/* Album Info */}
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-xl font-bold text-white">{albumName}</h3>
        <p className="text-gray-400">{artistName}</p>
        <p className="text-gray-500 text-sm">{releaseYear}</p>
      </div>

      {/* User Rating */}
      <div className="mt-2 md:mt-0">
        <ScorePill score={userRating} />
      </div>
    </a>
  );
}
