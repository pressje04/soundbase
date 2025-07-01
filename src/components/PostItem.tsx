import { useEffect, useState } from 'react';
import ScorePill from './ScorePill';
import Image from 'next/image';
import useUser from '@/hooks/useUser';
import Link from 'next/link';
import ReviewForm from './ReviewForm';
import { Pencil, Heart, Repeat2, MessageCircle, Eye, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PostItem({
  post,
  onDelete,
  showAlbumInfo = false,
}: {
  post: any;
  onDelete: (id: string) => void;
  showAlbumInfo?: boolean;
}) {
  const [liked, setLiked] = useState(post.likedByCurrentUser || false);
  const [reposted, setReposted] = useState(post.repostedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [repostCount, setRepostCount] = useState(post._count?.reposts || 0);
  const [topTracks, setTopTracks] = useState<
    { id: string; name: string; imageUrl: string }[]
  >([]);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 500;

  const { user } = useUser();
  const router = useRouter();
  const isAuthor = user?.id === post.userId;

  useEffect(() => {
    const fetchTracks = async () => {
      if (!post.trackRanking || !post.albumId) return;

      try {
        const tokenRes = await fetch('/api/token');
        const tokenData = await tokenRes.json();

        const albumRes = await fetch(
          `https://api.spotify.com/v1/albums/${post.albumId}`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          }
        );

        const albumData = await albumRes.json();
        const allTracks = albumData.tracks.items;

        const ranked = post.trackRanking
          .map((id: string) => {
            const match = allTracks.find((track: any) => track.id === id);
            return match
              ? {
                  id: match.id,
                  name: match.name,
                  imageUrl: albumData.images?.[0]?.url || '',
                }
              : null;
          })
          .filter(Boolean)

        setTopTracks(ranked as { id: string; name: string; imageUrl: string }[]);
      } catch (err) {
        console.error('Failed to load track ranking:', err);
      }
    };

    fetchTracks();
  }, [post.trackRanking, post.albumId]);

  const handleLike = async () => {
    if (!user) return router.push('/signup');

    const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount((prev: number) => (data.liked ? prev + 1 : prev - 1));
  };

  const handleRepost = async () => {
    if (!user) return router.push('/signup');

    const res = await fetch(`/api/posts/${post.id}/repost`, { method: 'POST' });
    const data = await res.json();
    setReposted(data.reposted);
    setRepostCount((prev: number) => (data.reposted ? prev + 1 : prev - 1));
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete?.(post.id);
      } else {
        console.error('Failed to delete post');
      }
    } catch (err) {
      console.error('Error while deleting post', err);
    }
  };

  useEffect(() => {
    fetch(`/api/posts/${post.id}/view`, { method: 'POST' });
  }, [post.id]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-700 pt-4 pb-6">
      {post.repostedBy && (
        <p className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Repeat2 size={16} strokeWidth={2} />
          @{post.repostedBy.username} reposted
         </p>
      )}

      <div className="flex items-start gap-4">
        <Link href={`/profile/${post.user?.id}`} className="shrink-0">
          {post.user?.image ? (
            <Image
              src={post.user.image}
              alt="Profile"
              width={48}
              height={48}
              className="rounded-full object-cover w-12 h-12"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
              {post.user?.firstName?.charAt(0) ?? 'A'}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {post.user?.firstName ?? 'Anonymous'}
                <span className="ps-2 font-semibold text-gray-500">
                  @{post.user?.username ?? '@anonymous'}
                </span>
              </span>
              {post.isReview && (
                <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 mr-1 rounded-full">
                  Review
                </span>
              )}
            </div>
            {isAuthor && (
  <div className="flex items-center gap-2 ml-auto mr-2">
    <button
      onClick={() => setEditingPost(post)} // open edit modal
      className="text-md text-gray-500 hover:text-green-500 transition"
    >
      <Pencil size={24} strokeWidth={3} />
      
    </button>
    <button
      onClick={handleDelete}
      className="text-md text-gray-500 hover:text-red-500 transition"
    >
      <X size={28} strokeWidth={3} />
    </button>
  </div>
)}

            {post.rating !== null && post.rating !== undefined && (
              <span className="shrink-0">
              <ScorePill size="md" score={post.rating} />
            </span>            
            )}
          </div>

          <p className="mt-1 text-gray-300 whitespace-pre-wrap break-words">
  {post.comment?.length > MAX_LENGTH && !expanded
    ? `${post.comment.slice(0, MAX_LENGTH)}...`
    : post.comment}
</p>

{post.comment?.length > MAX_LENGTH && (
  <button
    onClick={() => setExpanded(!expanded)}
    className="text-blue-400 text-sm hover:underline mt-1"
  >
    {expanded ? 'Show less' : 'Read more'}
  </button>
)}

          <p className="mt-1 text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>

          {showAlbumInfo && post.albumId && (
  <Link href={`/albums/${post.albumId}`} className="block mt-3 mb-3">
    <div className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded transition">
      <img
        src={post.imageUrl}
        alt={post.albumName}
        className="w-12 h-12 rounded object-cover shadow flex-shrink-0"
      />
      <div className="truncate">
        <p className="text-sm font-semibold text-white truncate">
          {post.albumName}
        </p>
        <p className="text-xs text-gray-400 truncate">{post.artistName}</p>
      </div>
    </div>
  </Link>
)}
 
 {topTracks.length > 0 && (
  <div className="mt-4 bg-black rounded-xl shadow-md">
    <h4 className="text-base font-bold text-white mb-4 tracking-wide">
      Track Ranking
    </h4>

    <ol className="space-y-3">
      {(expanded ? topTracks : topTracks.slice(0, 5)).map((track, index) => (
        <li
          key={track.id}
          className="flex items-center gap-4 bg-zinc-800 hover:bg-zinc-700 transition-colors p-3 rounded-lg w-full overflow-hidden"
        >
          <div
            className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-semibold text-sm relative
            ${
          index === 0
        ? 'bg-gold shimmer'
        : index === 1
        ? 'bg-silver shimmer'
        : index === 2
        ? 'bg-bronze shimmer'
        : 'bg-zinc-700 text-gray-300'
    }
  `}
>
  {index + 1}
</div>

          <img
            src={track.imageUrl}
            alt={`${track.name} cover`}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />

          <span className="text-white text-sm font-medium truncate flex-1">
            {track.name}
          </span>
        </li>
      ))}
    </ol>

    {topTracks.length > 5 && (
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-2 text-sm text-blue-400 hover:underline"
      >
        {expanded ? 'Show Top 5 Only' : 'Show Full Ranking'}
      </button>
    )}
  </div>
)}


          

{editingPost && (
  <ReviewForm
    isEditing
    onClose={() => setEditingPost(null)}
    onSubmit={async (payload) => {
      await fetch(`/api/posts/${editingPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      post.comment = payload.text;
      post.rating = payload.score;
      post.trackRanking = payload.trackRanking;

      if (payload.trackRanking) {
        const ranked = payload.trackRanking
          .map((id) => topTracks.find((track) => track.id === id))
          .filter(Boolean)
        
        setTopTracks(ranked as {id: string; name: string; imageUrl: string}[]);
      }
      setEditingPost(null);
    }}
    userId={user?.id ?? null}
    albumName={editingPost.albumName}
    artistName={editingPost.artistName}
    releaseYear={editingPost.releaseYear}
    imageUrl={editingPost.imageUrl}
    tracklist={topTracks.length > 0 ? topTracks : []} // or fetch if needed
    initialScore={editingPost.rating}
    initialText={editingPost.comment}
    initialTrackRanking={editingPost.trackRanking}
  />
)}


<div className="flex flex-wrap justify-between gap-y-2 w-full mt-3 text-sm text-gray-400 px-2 overflow-hidden">
            <span className="flex items-center gap-2">
              <MessageCircle size={28} strokeWidth={1.5} />
              {post._count?.replies || 0}
            </span>
            <button
              onClick={handleRepost}
              className={`flex items-center gap-2 transition-colors duration-200 ${
                reposted ? 'text-blue-500' : 'hover:text-white'
              }`}
            >
              <Repeat2 size={28} strokeWidth={1.5} />
              {repostCount || 0}
            </button>
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors duration-200 ${
                liked ? 'text-red-500' : 'hover:text-white'
              }`}
            >
              <Heart size={28} strokeWidth={1.5} fill={liked ? 'currentColor' : 'none'} />
              {likeCount || 0}
            </button>
            <span className="flex items-center gap-2">
              <Eye size={28} strokeWidth={1.5} />
              {post.views}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
