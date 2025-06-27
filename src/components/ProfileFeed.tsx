/* Displays the actual content for a profile tab */
'use client';

import { useEffect, useState } from 'react';
import PostFeed from '@/components/PostFeed';

type FeedType = 'Posts' | 'Likes';

export default function UserActivityFeed({
  userId,
  type,
}: {
  userId: string;
  type: FeedType;
}) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`/api/user/${userId}/${type.toLowerCase()}`);
        const data = await res.json();
        setPosts(data || []);
      } catch (err) {
        console.error(`Failed to fetch ${type} feed:`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [userId, type]);

  if (loading) {
    return <div className="text-gray-400 mt-6">Loading {type.toLowerCase()}...</div>;
  }

  return <PostFeed posts={posts} />;
}
