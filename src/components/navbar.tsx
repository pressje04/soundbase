'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useUser from '@/hooks/useUser';
import { Menu, X } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';

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

  function toUrlSafeBase64(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
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
  
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!);
    authUrl.searchParams.set('scope', 'user-read-private user-read-email streaming');
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('code_challenge', challenge);
  
    // ✅ Send the code_verifier in the state param (base64-encoded)
    authUrl.searchParams.set('state', toUrlSafeBase64(verifier));
  
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
            <HamburgerMenu />
        </div>
      </div>
    </nav>
  );
}
