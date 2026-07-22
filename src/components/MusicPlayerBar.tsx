'use client';

import { useEffect, useRef, useState } from 'react';
import { useSpotifyPlayerStore } from '@/hooks/useSpotifyPlayerStore';
import {Play, Pause, SkipForward, SkipBack} from 'lucide-react';

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

async function refreshSpotifyToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/spotify/token', { cache: 'no-store' });

    if (!res.ok) {
      console.error('Failed to refresh Spotify token:', await res.text());
      return null;
    }

    const data = await res.json();
    localStorage.setItem('spotifyAccessToken', data.accessToken);
    localStorage.setItem('spotifyAccessTokenExpiresAt', String(Date.now() + (Number(data.expiresIn) || 3600) * 1000));
    return data.accessToken;
  } catch (err) {
    console.error('Error refreshing Spotify token:', err);
    return null;
  }
}

async function getSpotifyAccessToken() {
  const token = localStorage.getItem('spotifyAccessToken');
  const expiresAt = Number(localStorage.getItem('spotifyAccessTokenExpiresAt'));

  if (token && expiresAt > Date.now() + 60_000) return token;
  return refreshSpotifyToken();
}

export default function MusicPlayerBar() {
  const setDeviceId = useSpotifyPlayerStore((state) => state.setDeviceId);
  const setIsConnected = useSpotifyPlayerStore((state) => state.setIsConnected);
  const setActivatePlayer = useSpotifyPlayerStore((state) => state.setActivatePlayer);

  const [shouldRender, setShouldRender] = useState(false);
  const [playerInstance, setPlayerInstance] = useState<any>(null);
  const [track, setTrack] = useState<any>(null);
  const [paused, setPaused] = useState(true);
  const [isControlling, setIsControlling] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializePlayer = async () => {
      const token = await getSpotifyAccessToken();
      if (!token) {
        console.warn('Spotify token unavailable. Skipping player render.');
        return;
      }

      const player = new window.Spotify.Player({
        name: 'Soundbase Player',
        getOAuthToken: (cb: (token: string) => void) => {
          void getSpotifyAccessToken().then((freshToken) => cb(freshToken ?? ''));
        },
        volume: 0.8,
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify player ready:', device_id);
        setDeviceId(device_id);
        setIsConnected(true);
        setActivatePlayer(() => player.activateElement());
        setPlayerInstance(player);
        setShouldRender(true);
      });

      player.addListener('player_state_changed', (state: any) => {
        if (!state) {
          setTrack(null);
          setPaused(true);
          return;
        }
        setTrack(state.track_window.current_track);
        setPaused(state.paused);
      });

      player.addListener('not_ready', () => {
        setDeviceId(null);
        setIsConnected(false);
        setActivatePlayer(null);
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
      

      player.connect().then((connected: boolean) => {
        console.info('Spotify player connection result:', connected);
      });
    };

    if (window.Spotify) {
      void initializePlayer();
      return;
    }

    // Register the callback before appending the script so a fast cached load cannot miss it.
    window.onSpotifyWebPlaybackSDKReady = () => void initializePlayer();
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);
  }, [setActivatePlayer, setDeviceId, setIsConnected]);

  const runPlayerCommand = async (command: () => Promise<void>) => {
    if (!playerInstance || isControlling) return;

    setIsControlling(true);
    try {
      await playerInstance.activateElement();
      await command();
    } catch (error) {
      console.error('Spotify player control failed:', error);
    } finally {
      setIsControlling(false);
    }
  };

  const handlePlayPause = () => runPlayerCommand(() => playerInstance.togglePlay());

  const handleSkipNext = () => runPlayerCommand(() => playerInstance.nextTrack());

  const handleSkipPrev = () => runPlayerCommand(() => playerInstance.previousTrack());

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
        <button onClick={handleSkipPrev} disabled={!playerInstance || isControlling} aria-label="Previous track">
          <SkipBack className="w-6 h-6"/>
        </button>
        <button onClick={handlePlayPause} disabled={!playerInstance || isControlling} aria-label={paused ? 'Play' : 'Pause'}>
          {paused ? (
            <Play className="w-6 h-6"/>
          ) : (
            <Pause className="w-6 h-6"/>
          )}
            </button>
        <button onClick={handleSkipNext} disabled={!playerInstance || isControlling} aria-label="Next track">
          <SkipForward className="w-6 h-6"/>
        </button>
      </div>
    </div>
  );
}
