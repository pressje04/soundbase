'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useUser from '@/hooks/useUser';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useUser();

  // --- PKCE Utils (inlined) ---
  function generateCodeVerifier(length = 128): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  const handleSpotifyLogin = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    sessionStorage.setItem('spotify_code_verifier', verifier);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!);
    authUrl.searchParams.set('scope', 'user-read-private user-read-email streaming');
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('code_challenge', challenge);

    window.location.href = authUrl.toString();
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-black bg-opacity-90 text-white z-10 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="soundbase logo"
            width={200}
            height={50}
            className="h-auto"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={handleSpotifyLogin}
            className="transition font-bold"
          >
            <img 
              src="/images/2024 Spotify Brand Assets/Spotify_green.png"
              alt="Connect with Spotify"
              className="h-6 w-auto hover"
            />
          </button>

          <Link href="/search" className="hover:text-blue-500 font-bold transition">
            Discover
          </Link>

          {user && (
            <Link
              href={`/profile/${user.id}`}
              className="hover:text-blue-500 font-bold transition"
            >
              Profile
            </Link>
          )}

          <Link href="/session">
            <button className="hover:text-blue-500 font-bold transition">
              Start Session
            </button>
          </Link>

          <Link href="/reviews" className="hover:text-blue-500 font-bold transition">
            Reviews
          </Link>

          {!loading && user ? (
            <form method="POST" action="/api/logout">
              <button className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition">
                Log Out
              </button>
            </form>
          ) : !loading && (
            <Link href="/signup">
              <button className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition">
                Sign Up
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
