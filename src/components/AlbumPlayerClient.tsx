'use client';

import { useSpotifyPlayerStore } from '@/hooks/useSpotifyPlayerStore';

export default function AlbumPlayerClient({ albumId }: { albumId: string }) {
  const { deviceId, isConnected, activatePlayer } = useSpotifyPlayerStore();

  const handlePlay = async () => {
    if (!deviceId) {
      alert('Spotify not ready.');
      return;
    }

    await activatePlayer?.();

    const response = await fetch('/api/spotify/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        albumId,
      }),
    });

    if (!response.ok) alert('Spotify could not start playback. Please reconnect and try again.');
  };

  return (
    <div className="mt-4">
      <button
        onClick={handlePlay}
        disabled={!isConnected}
        className={`py-2 px-4 rounded-xl ${
          isConnected ? 'bg-black border border-top text-xl font-bold hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600 transition font-semibold cursor-not-allowed '
        } text-white`}
      >
        Play Album
      </button>
    </div>
  );
}
