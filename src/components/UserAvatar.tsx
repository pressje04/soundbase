'use client';

import { useEffect, useState } from 'react';

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  className?: string;
  alt?: string;
};

export default function UserAvatar({
  src,
  name,
  className = 'w-12 h-12',
  alt,
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = name?.trim().charAt(0).toUpperCase() || 'A';

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (!src || imageFailed) {
    return (
      <div
        className={`${className} rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold`}
        aria-label={alt ?? `${name ?? 'User'} avatar`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? `${name ?? 'User'} avatar`}
      onError={() => setImageFailed(true)}
      className={`${className} rounded-full object-cover`}
    />
  );
}
