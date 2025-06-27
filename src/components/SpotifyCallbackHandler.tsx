'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SpotifyCallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  function fromUrlSafeBase64(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return atob(str);
  }

  useEffect(() => {
    async function fetchToken() {
      const code = params.get('code');
      const state = params.get('state');
      const codeVerifier = state ? fromUrlSafeBase64(state) : null;
      const errorFromSpotify = params.get('error'); // e.g., "access_denied"

      console.log('🔍 Callback Loaded');
      console.log('🎯 Redirect URI:', process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI);
      console.log('🎟️ code:', code);
      console.log('❓ error:', errorFromSpotify);
      console.log('🧾 code_verifier from localStorage:', codeVerifier);

      if (!code || !codeVerifier) {
        setError("Missing code or code verifier.");
        return;
      }

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
        client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
        code_verifier: codeVerifier,
      });

      try {
        const res = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });

        const text = await res.text();
        console.log('📦 Token response raw:', text);

        if (!res.ok) {
          setError('Spotify login failed. See console for details.');
          return;
        }

        const data = JSON.parse(text);
        localStorage.setItem('spotifyAccessToken', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('spotifyRefreshToken', data.refresh_token);
        }

        router.push('/');
      } catch (err) {
        console.error('❌ Unexpected error during token fetch:', err);
        setError('An unexpected error occurred.');
      }
    }

    fetchToken();
  }, [params, router]);

  return (
    <div className="text-white p-8">
      {error ? `⚠️ ${error}` : 'Logging you in with Spotify...'}
    </div>
  );
}
