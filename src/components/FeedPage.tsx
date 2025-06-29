"use client";
import PostList from '@/components/PostList';

export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto pt-10">
      <h1 className="text-center text-2xl font-bold mb-4 px-4">Your Feed</h1>
      <PostList endpoint="/api/feed" />
    </div>
  );
}
