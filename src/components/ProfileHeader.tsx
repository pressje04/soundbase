import Image from "next/image";

export default function ProfileHeader({
  name,
  createdAt,
  followerCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
  image,
  onAvatarClick,
}: {
  name: string;
  createdAt: string;
  followerCount?: number;
  followingCount?: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  image?: string;
  onAvatarClick?: () => void;
}) {
  return (
    <div className="w-full items-center flex flex-col sm:flex-row gap-6 sm:items-start mb-8">
      {/* Profile Image */}
      <div className="items-center shrink-0">
        <Image
          src={image ?? "/images/pfp_default.png"}
          alt="Avatar"
          width={96}
          height={96}
          onClick={onAvatarClick}
          className="rounded-full w-24 h-24 border border-white cursor-pointer hover:opacity-80 transition"
          title={onAvatarClick ? 'Click to change avatar' : 'Profile avatar'}
        />
      </div>

      {/* User Info */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-white">{name}</h1>
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
