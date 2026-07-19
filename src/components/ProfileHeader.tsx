'use client';

import Image from "next/image";
import { useEffect, useState } from 'react';

export default function ProfileHeader({
  name,
  createdAt,
  followerCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
  image,
  onAvatarClick,
  username,
}: {
  name: string;
  createdAt: string;
  followerCount?: number;
  followingCount?: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  image?: string;
  onAvatarClick?: () => void;
  username: string;
}) {
  const [imageSrc, setImageSrc] = useState(image || null);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  useEffect(() => {
    setImageSrc(image || null);
  }, [image]);

  return (
    <div className="w-full items-center flex flex-col sm:flex-row gap-6 sm:items-start mb-8">
      {/* Profile Image */}
      <div className="items-center shrink-0">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`${name}'s avatar`}
            width={96}
            height={96}
            onClick={onAvatarClick}
            onError={() => setImageSrc(null)}
            className="rounded-full w-24 h-24 border border-white cursor-pointer hover:opacity-80 transition"
            title={onAvatarClick ? 'Click to change avatar' : 'Profile avatar'}
          />
        ) : (
          <button
            type="button"
            onClick={onAvatarClick}
            disabled={!onAvatarClick}
            className="w-24 h-24 rounded-full border border-white bg-gray-700 text-4xl font-semibold text-white flex items-center justify-center disabled:cursor-default"
            title={onAvatarClick ? 'Click to change avatar' : 'Profile avatar'}
            aria-label={onAvatarClick ? 'Change profile avatar' : `${name}'s avatar`}
          >
            {initial}
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-white">{name}</h1>
        <h2 className="text-lg text-gray-500">@{username}</h2>
        <p className="text-sm text-gray-400 mb-2">
          Joined {new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
        </p>

        <div className="flex gap-6 text-sm text-gray-300 mt-2">
          <button onClick={onFollowingClick} className="hover:underline">
            <span className="font-semibold text-white">{followingCount}</span> Following
          </button>
          <button onClick={onFollowersClick} className="hover:underline">
            <span className="font-semibold text-white">{followerCount}</span> Followers
          </button>
        </div>
      </div>
    </div>
  );
}
