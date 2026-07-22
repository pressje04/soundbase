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

function AlbumCardWithScore({ album, featured = false }: { album: Album; featured?: boolean }) {
    const score = useAverageScore(album.id);
    const cardSize = featured ? 'min-w-[184px] max-w-[184px] sm:min-w-[208px] sm:max-w-[208px]' : 'min-w-[160px] max-w-[160px]';
  
    return (
      <Link href={`/albums/${album.id}`} className={`group inline-block ${cardSize}`}>
        <div className={`inline-block ${cardSize}`}>
          <Image
            src={album.images[0].url}
            alt={album.name}
            width={160}
            height={160}
            className="aspect-square w-full rounded-xl object-cover shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:shadow-[0_14px_36px_rgba(59,130,246,0.25)]"
          />
          <p className="mt-3 w-full truncate text-center text-sm font-semibold text-zinc-100 transition group-hover:text-blue-300">{album.name}</p>
  
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

  export default function AlbumScroll({ albums, variant }: { albums: Album[]; variant?: 'featured' }) {
    return (
      <div className="overflow-x-auto whitespace-nowrap scrollbar-hide py-4">
        <div className="flex gap-4 px-4 sm:gap-5">
          {albums.map((album: any) => (
            <AlbumCardWithScore key={album.id} album={album} featured={variant === 'featured'} />
          ))}
        </div>
      </div>
    );
  }  
