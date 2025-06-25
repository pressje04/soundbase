import { useEffect } from 'react';
import ScorePill from './ScorePill';
import Image from 'next/image';
import {Heart, Repeat2, MessageCircle, Eye} from 'lucide-react';

export default function PostItem({ post }: { post: any }) {
  useEffect(() => {
    fetch(`/api/posts/${post.id}/view`, {
      method: 'POST',
    });
  }, [post.id]);

  return (
    <div className="border-t border-gray-700 pt-4 pb-4">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
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
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {post.user?.firstName ?? 'Anonymous'}
              </span>
              {post.isReview && (
                <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Review
                </span>
              )}
            </div>
            {post.rating !== null && post.rating !== undefined && (
              <ScorePill size="md" score={post.rating} />
            )}
          </div>

          <p className="mt-1 text-gray-300 whitespace-pre-wrap">{post.comment}</p>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>

          {/* ✅ Metrics bar */}
          <div className="flex justify-between w-full mt-3 text-sm text-gray-400">
  <div className="flex-1 text-center">
    <span className="flex justify-center items-center gap-1">
      <Heart size={32} strokeWidth={1.5} /> {post._count?.likes || 0}
    </span>
  </div>
  <div className="flex-1 text-center">
    <span className="flex justify-center items-center gap-1">
      <Repeat2 size={32} strokeWidth={1.5} /> {post._count?.reposts || 0}
    </span>
  </div>
  <div className="flex-1 text-center">
    <span className="flex justify-center items-center gap-1">
      <MessageCircle size={32} strokeWidth={1.5} /> {post._count?.replies || 0}
    </span>
  </div>
  <div className="flex-1 text-center">
    <span className="flex justify-center items-center gap-1">
      <Eye size={32} strokeWidth={1.5} /> {post.views}
    </span>
  </div>
</div>


        </div>
      </div>
    </div>
  );
}
