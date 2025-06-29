import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import Link from 'next/link';

export default function SuggestedUserScroll({ users }: { users: any[] }) {
  const { user } = useUser(); // current logged-in user
  const router = useRouter();
  const [following, setFollowing] = useState<{ [key: string]: boolean }>({});

  const handleFollow = async (targetId: string) => {
    if (!user?.id) return;

    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: user.id, followingId: targetId }),
      });

      if (res.ok) {
        setFollowing((prev) => ({ ...prev, [targetId]: true }));
      } else {
        const data = await res.json();
        console.error('Follow failed:', data.error);
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleUnfollow = async (targetId: string) => {
    if (!user?.id) return;

    try {
      const res = await fetch('/api/follow', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: user.id, followingId: targetId }),
      });

      if (res.ok) {
        setFollowing((prev) => ({ ...prev, [targetId]: false }));
      } else {
        const data = await res.json();
        console.error('Unfollow failed:', data.error);
      }
    } catch (err) {
      console.error('Unfollow error:', err);
    }
  };

  return (
    <div className="overflow-x-auto whitespace-nowrap flex gap-6 px-4">
      {users.map((u) => (
        <div
          key={u.id}
          className="bg-zinc-800 rounded-lg px-4 py-3 flex flex-col items-center shadow w-48 shrink-0"
        >
          <Link href={`/profile/${u?.id}`} className="shrink-0 mb-4">
          {u?.image ? (
            <Image
              src={u.image}
              alt="Profile"
              width={48}
              height={48}
              className="rounded-full object-cover w-12 h-12"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
              {u?.firstName?.charAt(0) ?? 'A'}
            </div>
          )}
        </Link>
          <p className="font-semibold text-white">@{u.username}</p>
          <p className="text-gray-400 text-sm">{u.firstName}</p>
          {user?.id !== u.id && (
            <button
              onClick={() =>
                following[u.id] ? handleUnfollow(u.id) : handleFollow(u.id)
              }
              className={`mt-3 px-3 py-1 rounded-full text-sm font-medium transition ${
                following[u.id]
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {following[u.id] ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
