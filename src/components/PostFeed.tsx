'use client';

import PostItem from './PostItem';
import { useState } from 'react';

export default function PostFeed({ posts: initialPosts }: { posts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  if (posts.length === 0) {
    return (
      <div className="mt-6 text-gray-400 text-center">
        No posts to display.
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} onDelete={handleDelete} showAlbumInfo={true} />
      ))}
    </div>
  );
}
