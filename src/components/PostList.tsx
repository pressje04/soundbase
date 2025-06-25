'use client';

import { useEffect, useState } from 'react';
import PostItem from './PostItem';

export default function PostList({ albumId }: { albumId: string }) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch(`/api/posts?albumId=${albumId}`);
      const data = await res.json();
      setPosts(data);
    }
    fetchPosts();
  }, [albumId]);

  if (posts.length === 0) {
    return <p className="text-gray-400 mt-6">No reviews or comments yet.</p>;
  }

  return (
    <div className="mt-8 mb-24 space-y-6">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
    
  );
}
