'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ScoreMeterPill from './ScoreMeterPill';
import TrackRankingBox from './TrackRanking';
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
    isReview: boolean;
    trackRanking?: string[];
  }) => void;
  userId: string | null;
  albumName: string;
  artistName: string;
  releaseYear: string;
  imageUrl: string;
  tracklist: { id: string; name: string }[];
};

export default function ReviewForm({
  onClose,
  onSubmit,
  userId,
  albumName,
  artistName,
  releaseYear,
  imageUrl,
  tracklist,
}: ReviewFormProps) {
  const [score, setScore] = useState<number>(0);
  const [text, setText] = useState('');
  const [rankTracks, setRankTracks] = useState(false);
  const [rankedTracks, setRankedTracks] = useState(
    tracklist.map((track) => ({
      ...track,
      imageUrl, // attach album image
    }))
  );

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
      isReview: true,
      trackRanking: rankTracks ? rankedTracks.map((t) => t.id) : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-start overflow-y-auto min-h-screen pt-10">
      <Navbar />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl mx-4 text-white p-8 pt-12 space-y-6 backdrop-blur-md bg-black bg-opacity-70 rounded-lg"
      >
        <h1 className="font-bold text-3xl text-center">You are reviewing...</h1>

        {/* Album Info - Always Centered */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={imageUrl}
            alt={albumName}
            className="w-28 h-28 rounded shadow mb-2"
          />
          <h2 className="text-xl font-bold">{albumName}</h2>
          <p className="text-md text-gray-300">{artistName}</p>
          <p className="text-sm text-gray-400">{releaseYear}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Left Column: Review Input */}
          <div className="flex-1 space-y-6">
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
                placeholder="Write your thoughts, favorite moments, etc..."
              />
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="rankTracks"
                checked={rankTracks}
                onChange={() => setRankTracks(!rankTracks)}
              />
              <label htmlFor="rankTracks" className="text-sm text-gray-300">
                I want to rank the tracks
              </label>
            </div>

            {/* Track list for small screens */}
            {rankTracks && (
              <div className="block lg:hidden">
                <TrackRankingBox
                  tracks={rankedTracks}
                  setTracks={setRankedTracks}
                  imageUrl={imageUrl}
                />
              </div>
            )}

            <div className="flex justify-center gap-4 pt-1 mb-12">
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
          </div>

          {/* Right Column: Track list for large screens */}
          {rankTracks && (
            <div className="hidden lg:block w-full lg:w-1/2 flex-shrink-0 overflow-y-auto mb-8">
              <TrackRankingBox
                tracks={rankedTracks}
                setTracks={setRankedTracks}
                imageUrl={imageUrl}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
