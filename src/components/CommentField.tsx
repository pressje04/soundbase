'use client';

import { useState } from 'react';
import useUser from '@/hooks/useUser';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Props = {
  albumId: string;
  albumName: string;
  artistName: string;
  releaseYear: string;
  imageUrl: string;
  onCommentPosted?: () => void; // optional callback to refresh post list
};

export default function CommentComposer({
  albumId,
  albumName,
  artistName,
  releaseYear,
  imageUrl,
  onCommentPosted,
}: Props) {
  const { user } = useUser();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!user) {
      router.push('/signup');
      return;
    }

    if (!text.trim()) return;

    setIsSubmitting(true);

    const res = await fetch('/api/posts/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        albumId,
        albumName,
        artistName,
        releaseYear,
        imageUrl,
        comment: text,
        isReview: false,
        parentId: null,
      }),
    });

    setIsSubmitting(false);
    setText('');

    if (res.ok && onCommentPosted) onCommentPosted();
  };

  return (
    <div className="flex items-start gap-4 mt-6">
      {/* Profile or Placeholder */}
      {user ? (
        user.image ? (
          <Image
            src={user.image}
            alt="User"
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
            {user.firstName?.charAt(0) ?? 'U'}
          </div>
        )
      ) : (
        <div
          onClick={() => router.push('/signup')}
          className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white cursor-pointer hover:bg-gray-600"
        >
          Join
        </div>
      )}

      {/* Input */}
      <div className="flex-1">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? "Add a comment..." : "Sign up to comment"}
          className="w-full bg-zinc-800 text-white rounded-full px-4 py-2 resize-none border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!user || isSubmitting}
        />
        {user && (
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || text.trim().length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded-full font-semibold disabled:opacity-50"
            >
              Comment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
