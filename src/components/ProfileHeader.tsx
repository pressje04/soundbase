'use client';

import Image from 'next/image';

export default function ProfileHeader({
    name,
    createdAt,
    favoriteAlbum,
} : {
    name: string;
    createdAt: string;
    favoriteAlbum?: {name: string, id: string};
}) {

    return (
        <div className="flex flex-col items-center md:items-start md:flex-row gap-6 mb-10">
            <Image
                src="/images/pfp_default.png"
                alt="Avatar"
                width={120}
                height={120}
                className="rounded-full border border-white"
            />
            <div>
                <h1 className="text-3xl font-bold text-white">{name}</h1>
                <p className="text-sm text-gray-400">Member since {new Date(createdAt).toLocaleDateString()}</p>

                {favoriteAlbum && (
                    <p className="mt-2 text-white">
                        Favorite Album:{" "}
                        <a href={`/albums/${favoriteAlbum.id}`} className="text-blue-400 hover:underline">
                            {favoriteAlbum.name}
                        </a>
                    </p>
                )}
            </div>
        </div>
    )

}