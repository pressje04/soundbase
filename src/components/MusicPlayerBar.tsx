'use client';

import { useEffect, useState } from 'react';
import { useSpotifyPlayerStore } from '@/hooks/useSpotifyPlayerStore';

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

async function refreshSpotifyToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('spotifyRefreshToken');
  if (!refreshToken) return null;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
  });

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      console.error('Failed to refresh Spotify token:', await res.text());
      return null;
    }

    const data = await res.json();
    localStorage.setItem('spotifyAccessToken', data.access_token);
    return data.access_token;
  } catch (err) {
    console.error('Error refreshing Spotify token:', err);
    return null;
  }
}

export default function MusicPlayerBar() {
  const setDeviceId = useSpotifyPlayerStore((state) => state.setDeviceId);
  const setIsConnected = useSpotifyPlayerStore((state) => state.setIsConnected);

  const [status, setStatus] = useState('Connecting Spotify Web Player...');
  const [playerInstance, setPlayerInstance] = useState<any>(null);
  const [track, setTrack] = useState<any>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    if (window.Spotify && window.onSpotifyWebPlaybackSDKReady) {
        window.onSpotifyWebPlaybackSDKReady();
        return;
    };

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = async () => {
      let token = localStorage.getItem('spotifyAccessToken');
      if (!token) {
        token = await refreshSpotifyToken();
        if (!token) {
          setStatus('Login to Spotify Premium to enable playback.');
          return;
        }
      }

      const player = new window.Spotify.Player({
        name: 'Soundbase Player',
        getOAuthToken: (cb: (token: string) => void) => cb(token!),
        volume: 0.8,
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify player ready:', device_id);
        setDeviceId(device_id);
        setIsConnected(true);
        setPlayerInstance(player);
        setStatus('');
      });

      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;
        setTrack(state.track_window.current_track);
        setPaused(state.paused);
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Initialization Error:', message);
        setStatus('Initialization error.');
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Authentication Error:', message);
        setStatus('Authentication error. Try re-logging in.');
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Account Error:', message);
        setStatus('Spotify Premium required for playback.');
      });

      player.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('Playback Error:', message);
        setStatus('Playback error occurred.');
      });

      player.connect();
    };
  }, [setDeviceId, setIsConnected]);

  const handlePlayPause = () => {
    if (playerInstance) {
      playerInstance.togglePlay();
    }
  };

  const handleSkipNext = () => {
    if (playerInstance) {
      playerInstance.nextTrack();
    }
  };

  const handleSkipPrev = () => {
    if (playerInstance) {
      playerInstance.previousTrack();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 z-50 flex justify-between items-center px-6">
      {status ? (
        <div>{status}</div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            {track?.album?.images?.[0]?.url && (
              <img
                src={track.album.images[0].url}
                alt="Album Art"
                className="w-12 h-12 rounded shadow"
              />
            )}
            <div>
              <div className="font-semibold">{track?.name}</div>
              <div className="text-sm text-gray-400">
                {track?.artists?.map((artist: any) => artist.name).join(', ')}
              </div>
            </div>
          </div>

          <div className="flex items-center text-3xl gap-6">
            <button onClick={handleSkipPrev}>⏮</button>
            <button onClick={handlePlayPause}>
              {paused ? '▶️' : '⏸'}
            </button>
            <button onClick={handleSkipNext}>⏭</button>
          </div>
        </>
      )}
    </div>
  );
}
