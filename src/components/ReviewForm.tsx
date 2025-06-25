'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ScoreMeterPill from './ScoreMeterPill';
import Image from 'next/image';
import Navbar from './navbar';

type ReviewFormProps = {
  onClose: () => void;
  onSubmit: (payload: {
    score: number;
    text: string;
    albumName: string;
    artistName: string;
    releaseYear: string;
    imageUrl: string;
    isReview: boolean
  }) => void;
  userId: string | null;
  albumName: string;
  artistName: string;
  releaseYear: string;
  imageUrl: string;
};

export default function ReviewForm({
  onClose,
  onSubmit,
  userId,
  albumName,
  artistName,
  releaseYear,
  imageUrl,
}: ReviewFormProps) {
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

    onSubmit({ 
      score, 
      text, 
      albumName, 
      artistName, 
      releaseYear, 
      imageUrl,
      isReview: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <Navbar />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl mx-4 text-white p-8 space-y-6 backdrop-blur-md bg-black bg-opacity-70 rounded-lg"
      >
        <h1 className="font-bold text-3xl justify-center text-center">You are reviewing...</h1>
        <div className="justify-center flex flex-col md:flex-row gap-6 items-start">
          <img
            src={imageUrl}
            alt={albumName}
            className="w-28 h-28 rounded md:flex shadow"
          />
          <div>
            <h2 className="text-2xl font-bold">{albumName}</h2>
            <p className="text-lg text-gray-300">{artistName}</p>
            <p className="text-sm text-gray-400">{releaseYear}</p>
          </div>
        </div>
  
        <div>
          <label className="block text-lg font-bold mb-1">Your Rating</label>
          <ScoreMeterPill value={score} onChange={setScore} />
        </div>
  
        <div>
          <label className="block text-lg font-bold mb-1">Your Thoughts</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 h-32 bg-gray-800 text-white rounded resize-none border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your thoughts, favorite quotes, rank songs, etc..."
          />
        </div>
  
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold bg-gray-600 hover:bg-gray-500 rounded text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 font-bold bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
  
  
    
  
}
