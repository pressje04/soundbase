// components/HamburgerMenu.tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden fixed top-4 right-4 z-50">
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white p-2 bg-zinc-800 rounded hover:bg-zinc-700 transition"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black rounded shadow-lg border border-zinc-700">
          <ul className="text-white p-2 space-y-2">
            <li>
              <Link href="/profile" className="block hover:text-blue-400">Profile</Link>
            </li>
            <li>
              <Link href="/feed" className="block hover:text-blue-400">Feed</Link>
            </li>
            <li>
              <Link href="/logout" className="block hover:text-red-400">Log Out</Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
