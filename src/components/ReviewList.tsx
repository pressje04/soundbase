'use client';

import { useEffect, useState } from 'react';
import ScorePill from './ScorePill';
import Image from 'next/image';

export default function PostList({ albumId }: { albumId: string }) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch(`/api/posts?albumId=${albumId}`);
      const data = await res.json();
      setPosts(data.filter((p: any) => p.parentId === null)); // Only top-level
    }
    fetchPosts();
  }, [albumId]);

  if (posts.length === 0) {
    return <p className="text-gray-400 mt-6">No posts yet. Wanna be the first?</p>;
  }

  return (
    <div className="mt-8 mb-24 space-y-6">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className={`p-4 shadow-sm border-zinc-700 ${
            index !== 0 ? 'border-t border-gray-700' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            {/* Profile Image */}
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

            {/* Content */}
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
                {post.isReview && <ScorePill size="md" score={post.rating} />}
              </div>

              {post.comment && (
                <p className="mt-1 text-gray-300 whitespace-pre-wrap">{post.comment}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
