'use client';

import { useSpotifyPlayerStore } from '@/hooks/useSpotifyPlayerStore';
import MusicPlayerBar from './MusicPlayerBar';

export default function AlbumPlayerClient({ albumId }: { albumId: string }) {
  const { deviceId, isConnected } = useSpotifyPlayerStore();

  const handlePlay = async () => {
    const token = localStorage.getItem('spotifyAccessToken');
    if (!token || !deviceId) {
      alert('Spotify not ready.');
      return;
    }

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context_uri: `spotify:album:${albumId}`,
      }),
    });
  };

  return (
    <div className="mt-4">
      <button
        onClick={handlePlay}
        disabled={!isConnected}
        className={`py-2 px-4 rounded-xl ${
          isConnected ? 'bg-black border border-top text-xl font-bold hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed '
        } text-white`}
      >
        {isConnected ? 'Play Album' : 'Loading...'}
      </button>
      <MusicPlayerBar />
    </div>
  );
}
