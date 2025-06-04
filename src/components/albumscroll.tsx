//This is a generic album scrollbar to display different albums

'use client';
import Image from 'next/image';
import Link from 'next/link';
import useAverageScore from '@/hooks/useAverageScore';
import ScorePill from './ScorePill';

type Album = {
    id: string;
    name: string;
    images: { url: string}[];
};

function AlbumCardWithScore({ album }: { album: Album }) {
    const score = useAverageScore(album.id);
  
    return (
      <Link href={`/albums/${album.id}`} className="inline-block min-w-[160px] max-w-[160px]">
        <div className="inline-block min-w-[160px] max-w-[160px]">
          <Image
            src={album.images[0].url}
            alt={album.name}
            width={160}
            height={160}
            className="rounded-xl shadow-md"
          />
          <p className="mt-2 text-sm font-semibold text-center truncate w-full">{album.name}</p>
  
          {/* ScorePill shown below image */}
          <div className="mt-1 flex justify-center">
            <div className="scale-90">
              <ScorePill score={score} size="sm" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  export default function AlbumScroll({ albums }: { albums: Album[] }) {
    return (
      <div className="overflow-x-auto whitespace-nowrap scrollbar-hide py-4">
        <div className="flex gap-4 px-4">
          {albums.map((album: any) => (
            <AlbumCardWithScore key={album.id} album={album} />
          ))}
        </div>
      </div>
    );
  }  