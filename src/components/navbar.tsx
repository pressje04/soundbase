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

  const handleSpotifyLogin = async () => {
    window.location.assign('/api/spotify/login');
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
          {user && <Link href={`/feed/`} className="hover:text-blue-500 font-bold transition">Feed</Link>}
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
