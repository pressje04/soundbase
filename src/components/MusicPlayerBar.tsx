'use client';

import { useEffect, useState } from 'react';
import { useSpotifyPlayerStore } from '@/hooks/useSpotifyPlayerStore';
import {Play, Pause, SkipForward, SkipBack} from 'lucide-react';

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

  const [shouldRender, setShouldRender] = useState(false);
  const [playerInstance, setPlayerInstance] = useState<any>(null);
  const [track, setTrack] = useState<any>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    if (window.Spotify && window.onSpotifyWebPlaybackSDKReady) {
      window.onSpotifyWebPlaybackSDKReady();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = async () => {
      let token = localStorage.getItem('spotifyAccessToken');
      if (!token) {
        token = await refreshSpotifyToken();
        if (!token) {
          console.warn('Spotify token unavailable. Skipping player render.');
          return; // Do not render anything
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
        setShouldRender(true);
      });

      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;
        setTrack(state.track_window.current_track);
        setPaused(state.paused);
      });

      player.addListener('initialization_error', (e: { message: string }) => {
        console.error('Init error:', e.message);
      });
      
      player.addListener('authentication_error', (e: { message: string }) => {
        console.warn('Auth error:', e.message);
      });
      
      player.addListener('account_error', (e: { message: string }) => {
        console.warn('Account error:', e.message);
      });
      
      player.addListener('playback_error', (e: { message: string }) => {
        console.warn('Playback error:', e.message);
      });
      

      player.connect();
    };
  }, [setDeviceId, setIsConnected]);

  const handlePlayPause = () => {
    if (playerInstance) playerInstance.togglePlay();
  };

  const handleSkipNext = () => {
    if (playerInstance) playerInstance.nextTrack();
  };

  const handleSkipPrev = () => {
    if (playerInstance) playerInstance.previousTrack();
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 z-50 flex justify-between items-center px-6">
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
        <button onClick={handleSkipPrev}>
          <SkipBack className="w-6 h-6"/>
        </button>
        <button onClick={handlePlayPause}>
          {paused ? (
            <Play className="w-6 h-6"/>
          ) : (
            <Pause className="w-6 h-6"/>
          )}
            </button>
        <button onClick={handleSkipNext}>
          <SkipForward className="w-6 h-6"/>
        </button>
      </div>
    </div>
  );
}
