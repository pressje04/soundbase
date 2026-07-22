'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SpotifyCallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function exchangeCode() {
      const errorFromSpotify = params.get('error');
      const code = params.get('code');
      const state = params.get('state');

      if (errorFromSpotify) {
        setError(`Spotify authorization was denied: ${errorFromSpotify}`);
        return;
      }
      if (!code || !state) {
        setError('Spotify did not return a valid authorization response.');
        return;
      }

      try {
        const res = await fetch(
          `/api/spotify/callback?${new URLSearchParams({ code, state })}`,
          { cache: 'no-store' }
        );
        const data = await res.json();

        if (!res.ok || !data.accessToken) {
          setError(data.error ?? 'Spotify login failed.');
          return;
        }

        localStorage.setItem('spotifyAccessToken', data.accessToken);
        localStorage.setItem(
          'spotifyAccessTokenExpiresAt',
          String(Date.now() + (Number(data.expiresIn) || 3600) * 1000)
        );
        localStorage.removeItem('spotifyRefreshToken');
        router.replace('/');
      } catch (error) {
        console.error('Spotify login failed:', error);
        setError('Spotify login failed. Please try again.');
      }
    }

    exchangeCode();
  }, [params, router]);

  return <div className="text-white p-8">{error ? `⚠️ ${error}` : 'Logging you in with Spotify...'}</div>;
}
