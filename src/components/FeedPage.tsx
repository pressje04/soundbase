"use client";
import PostList from '@/components/PostList';

export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto pt-2">
      <PostList endpoint="/api/feed" />
    </div>
  );
}
