'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewForm({
  onClose,
  onSubmit,
  userId,
}: {
  onClose: () => void;
  onSubmit: (score: number, text: string) => void;
  userId: string | null;
}) {
  const [score, setScore] = useState<number>(0);
  const [text, setText] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      router.push('/signup');
      return;
    }

    if (score < 0 || score > 10) return alert('Score must be between 0 and 10');
    if (text.trim().length === 0) return alert('Review text cannot be empty');

    onSubmit(score, text);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black p-6 rounded-lg w-full max-w-md shadow-lg"
      >
        <h2 className="text-xl font-bold mb-4">Leave a Review</h2>

        <label className="block mb-2">Score (0 - 10)</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={score}
          onChange={(e) => setScore(parseFloat(e.target.value))}
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block mb-2">Your Thoughts</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full mb-4 p-2 border rounded h-24 resize-none"
        />

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
