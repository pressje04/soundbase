'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useUser from '@/hooks/useUser';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useUser();

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

    localStorage.setItem('spotify_code_verifier', verifier);

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
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="soundbase logo"
            width={200}
            height={50}
            className="h-auto"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-8">
          <button onClick={handleSpotifyLogin}>
            <img 
              src="/images/2024 Spotify Brand Assets/Spotify_green.png"
              alt="Connect with Spotify"
              className="h-6 w-auto"
            />
          </button>

          <Link href="/search" className="hover:text-blue-500 font-bold transition">Discover</Link>
          {user && <Link href={`/profile/${user.id}`} className="hover:text-blue-500 font-bold transition">Profile</Link>}
          <Link href="/session" className="hover:text-blue-500 font-bold transition">Sessions</Link>

          {!loading && user ? (
            <form method="POST" action="/api/logout">
              <button className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition">Log Out</button>
            </form>
          ) : !loading && (
            <Link href="/signup">
              <button className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition">Sign Up</button>
            </Link>
          )}
        </div>

        {/* Hamburger (mobile only) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 rounded hover:bg-zinc-700 transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-20 right-6 w-48 bg-zinc-900 rounded border border-zinc-700 shadow-md z-50">
              <ul className="flex flex-col text-white divide-y divide-zinc-700">
                <li><Link href="/search" className="block px-4 py-2 hover:text-blue-400">Discover</Link></li>
                <li><Link href="/reviews" className="block px-4 py-2 hover:text-blue-400">Reviews</Link></li>
                <li><Link href="/session" className="block px-4 py-2 hover:text-blue-400">Sessions</Link></li>
                {user && <li><Link href={`/profile/${user.id}`} className="block px-4 py-2 hover:text-blue-400">Profile</Link></li>}
                {!loading && user ? (
                  <li>
                    <form method="POST" action="/api/logout">
                      <button className="w-full text-left px-4 py-2 hover:text-red-400">Log Out</button>
                    </form>
                  </li>
                ) : !loading && (
                  <li><Link href="/signup" className="block px-4 py-2 hover:text-blue-400">Sign Up</Link></li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
