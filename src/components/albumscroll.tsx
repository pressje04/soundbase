//This is a generic album scrollbar to display different albums
import Image from 'next/image';
import Link from 'next/link';

type Album = {
    id: string;
    name: string;
    images: { url: string}[];
};

export default function AlbumScroll({ albums }: { albums: Album[] }) {
    return (
        <div className="overflow-x-auto whitespace-nowrap scrollbar-hide py-4">
            <div className="flex gap-4 px-4">
            {albums.map((album: any) => (
                <Link key={album.id} href={`/albums/${album.id}`} className="inline-block min-w-[160px] max-w-[160px]">
                    <div key={album.id} className="inline-block min-w-[160px] max-w-[160px]">
                        <Image
                            src={album.images[0].url}
                            alt={album.name}
                            width={160}
                            height={160}
                            className="rounded-xl shadow-md"
                            />
                            <p className="mt-2 text-sm font-semibold text-center truncate w-full">{album.name}</p>
                    </div>
                </Link>
            ))}
            </div>
        </div> 
    );
}