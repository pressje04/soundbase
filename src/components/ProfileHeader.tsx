import Image from "next/image";

export default function ProfileHeader({
    name,
    createdAt,
    favoriteAlbum,
  }: {
    name: string;
    createdAt: string;
    favoriteAlbum?: { name: string; id: string };
  }) {
    return (
      <div className="flex flex-col items-center gap-6 mb-10 md:flex-row md:items-center">
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
      </div>
    );
  }
  