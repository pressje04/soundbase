'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import useUser from '@/hooks/useUser';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const {user, loading} = useUser();

  const handleSpotifyLogin = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const authUrl = new URL('https://accounts.spotify.com/authorize');

    authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!);
    authUrl.searchParams.set('scope', 'user-read-private user-read-email streaming');
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('state', btoa(verifier));

    window.location.href = authUrl.toString();
  };

  function generateCodeVerifier(length = 128): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async function generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  return (
    <div className="lg:hidden fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white p-2 bg-zinc-900 rounded-full hover:bg-zinc-700 transition"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Slide-in Menu */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-56 bg-black rounded-xl shadow-xl border border-zinc-800 py-4 px-4 space-y-4">
          <button onClick={handleSpotifyLogin} className="w-full text-left">
            <Image
              src="/images/2024 Spotify Brand Assets/Spotify_green.png"
              alt="Spotify"
              width={100}
              height={30}
              className="h-auto"
            />
          </button>

          <Link href="/search" className="block text-white px-4 py-2 rounded hover:bg-zinc-800">
    Discover
  </Link>

          {user && (
  <Link
    href={`/profile/${user.id}`}
    className="block text-white px-4 py-2 rounded hover:bg-zinc-800"
  >
    Profile
  </Link>
)}

          <Link href="/session" className="block text-white px-4 py-2 rounded hover:bg-zinc-800">
            Sessions
          </Link>
          {user ? (
  <form method="POST" action="/api/logout">
    <button className="w-full text-left text-red-400 px-4 py-2 rounded hover:bg-zinc-800">
      Log Out
    </button>
  </form>
) : (
  <Link href="/signup" className="block text-white px-4 py-2 rounded hover:bg-zinc-800">
    Sign Up
  </Link>
)}

        </div>
      )}
    </div>
  );
}
