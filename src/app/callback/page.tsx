/*Callback page that we use as middleware for Spotify login

This helps myself and the user to detect errors that occur when attempting to log in to Spotify through the app
*/
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
  
      console.log('Code:', code);
      console.log('Code Verifier:', codeVerifier);
  
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
  
        if (!res.ok) {
          const errText = await res.text();
          console.error('Failed to fetch token:', errText);
          setError('Spotify login failed. Please try again.');
          return;
        }
  
        const data = await res.json();
        localStorage.setItem('spotifyAccessToken', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('spotifyRefreshToken', data.refresh_token);
        }
  
        console.log("Navigating to /");
        await router.push('/');
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred.');
      }
    }
  
    fetchToken();
  }, [router]);
  
  return (
    <div className="text-white p-8">
      {error ? error : "Logging you in with Spotify..."}
    </div>
  );
  
}
