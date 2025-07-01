'use client';

import { useEffect, useState } from 'react';
import PostItem from './PostItem';

type PostListProps = {
  albumId?: string;
  newPost?: any;
  endpoint?: string; // New prop
};

export default function PostList({ albumId, newPost, endpoint }: PostListProps) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const url = endpoint ?? `/api/posts?albumId=${albumId}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data);
    }

    fetchPosts();
  }, [albumId, endpoint]);

  // Add new post to top if one is passed in
  useEffect(() => {
    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
    }
  }, [newPost]);

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  if (posts.length === 0) {
    return <p className="text-gray-400 mt-6">No reviews or comments yet... Wanna be the first?</p>;
  }

  return (
    <div className="mt-8 mb-24 space-y-6 px-4">
      {posts.map((post) => (
        <div key={post.id} className="w-full max-w-screen-sm mx-auto overflow-hidden">
          <PostItem post={post} onDelete={handleDelete} showAlbumInfo/>
        </div>
      ))}
    </div>
  );
}
