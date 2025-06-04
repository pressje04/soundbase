import Image from "next/image";

export default function ProfileHeader({
    name,
    createdAt,
    favoriteAlbum,
    followerCount,
    followingCount,
    onFollowersClick,
    onFollowingClick,
  }: {
    name: string;
    createdAt: string;
    favoriteAlbum?: { name: string; id: string };
    followerCount?: number;
    followingCount?: number;
    onFollowersClick?: () => void;
    onFollowingClick?: () => void;
  }) {
    return (
      <div className="flex w-full items-center gap-x-12 mb-10 md:flex-row md:items-center">
        {/*Name, Join date, profile pic*/}
        <Image
          src="/images/pfp_default.png"
          alt="Avatar"
          width={240}
          height={240}
          className="rounded-full border border-white"
        />
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-white">{name}</h1>
          <p className="text-md text-gray-400">
            Member since {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-2xl text-center cursor-pointer" onClick={onFollowersClick}>
          <p className="font-bold">{followerCount}</p>
          <p className="font-bold">followers</p>
        </div>
        <div className="text-2xl text-center" onClick={onFollowingClick}>
          <p className="font-bold">{followingCount}</p>
          <p className="font-bold">following</p>
        </div>
      </div>
    );
  }
  