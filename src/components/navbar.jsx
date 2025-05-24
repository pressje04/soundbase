"use client"
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useUser from '@/hooks/useUser';

export default function Navbar() {
    //React state variable!! useState() is a hook with an init value of false
    //isMenuOpen, initial state value will be 0
    //This highlights React's state management
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const user = useUser();

    return (
        <nav className="fixed top-0 left-0w-full bg-black bg-opacity-90 text-white z-10 px-6 py-4">
            <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/images/logo.png"
                        alt="soundbase logo"
                        width={200}
                        height={50}
                        className="h-auto" //This is for maintaining aspect ratio
                    />
                </Link>

                {/*Desktop Nav*/}
                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/search" className="hover:text-blue-500 transition">Discover</Link>
                    <Link href="/trending" className="hover:text-blue-500 transition">Trending</Link>
                    <Link href="/sessions" className="hover:text-blue-500 transition">Sessions</Link>
                    <Link href="/reviews" className="hover:text-blue-500 transition">Reviews</Link>
                    
                    {user ? (
                        <form method="POST" action="/api/logout">
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                                Log Out
                            </button>
                        </form>
                    ) : (
                        <Link href="/signup">
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                                Sign Up
                            </button>
                        </Link>
                    )}
                   
                </div>
            </div>
        </nav>
    );
}