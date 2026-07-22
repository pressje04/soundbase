"use client";

import { useEffect, useState } from 'react'; 
import Navbar from "../components/navbar";
import AlbumScroll from "@/components/albumscroll";
import useUser from '@/hooks/useUser';
import Link from 'next/link';
import SuggestedUserScroll from '@/components/SuggestedUserScroll';
import { ArrowRight, Headphones, Sparkles } from 'lucide-react';

type CarouselAlbumResponse = {
  albumId?: string;
  albumName?: string;
  imageUrl?: string;
  id?: string;
  name?: string;
  images?: { url?: string }[];
};

function formatCarouselAlbums(data: unknown) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((album: CarouselAlbumResponse) => {
    const id = album.albumId ?? album.id;
    const name = album.albumName ?? album.name;
    const imageUrl = album.imageUrl ?? album.images?.[0]?.url;

    return id && name && imageUrl ? [{ id, name, images: [{ url: imageUrl }] }] : [];
  });
}

export default function Page() {
  const [popularAlbums, setPopularAlbums] = useState<any[]>([]);
  const [topAlbums, setTopAlbums] = useState<any[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<any[]>([]);

  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const {user, loading} = useUser(); // Custom hook to see if user is logged in

  async function fetchFallbackAlbums() {
    const res = await fetch('/api/albums');
    const data = await res.json();

    if (!res.ok || !Array.isArray(data)) {
      throw new Error('Spotify fallback albums are unavailable');
    }

    return formatCarouselAlbums(data);
  }

  useEffect(() => {
    async function fetchPopularAlbums() {
      try {
        const res = await fetch('/api/albums/popular');
        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) {
          throw new Error('Popular albums are unavailable');
        }

        setPopularAlbums(formatCarouselAlbums(data));
      } catch (error) {
        console.error('Unable to load popular albums:', error);
      }
    }
    fetchPopularAlbums();
  }, []);

  useEffect(() => {
    async function fetchTopAlbums() {
      try {
        const res = await fetch('/api/albums/top10');
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setTopAlbums(formatCarouselAlbums(data));
          return;
        }

        setTopAlbums(await fetchFallbackAlbums());
      } catch (error) {
        console.error('Unable to load top albums or Spotify fallback:', error);
      }
    }
    fetchTopAlbums();
  }, []);

  useEffect(() => {
    async function fetchMostRecent() {
      try {
        const res = await fetch('/api/albums/mostrecent');
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setRecentAlbums(formatCarouselAlbums(data));
          return;
        }

        setRecentAlbums(await fetchFallbackAlbums());
      } catch (error) {
        console.error('Unable to load recently reviewed albums or Spotify fallback:', error);
      }
    }
    fetchMostRecent();
  }, []);

useEffect(() => {
  async function fetchSuggestedUsers() {
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/suggested?userId=${user.id}`);
      if (!res.ok) {
        console.error("Failed to fetch suggested users:", await res.json());
        return;
      }
      const data = await res.json();
      setSuggestedUsers(data);
    } catch (err) {
      console.error("Error fetching suggested users:", err);
    }
  }

  fetchSuggestedUsers();
}, [user]);

  

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-hidden bg-[#050505] pb-20 text-white">
        <section className="relative isolate flex min-h-[600px] items-center overflow-hidden px-6 pb-20 pt-36 sm:px-10 lg:min-h-[660px] lg:px-16">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_75%_20%,rgba(37,99,235,0.26),transparent_26%),radial-gradient(circle_at_22%_68%,rgba(168,85,247,0.18),transparent_27%),linear-gradient(180deg,#0a0a0a_0%,#050505_100%)]" />
          <div className="absolute right-[8%] top-28 -z-10 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px]" />
          <div className="absolute bottom-12 left-[12%] -z-10 h-56 w-56 rounded-full bg-violet-500/15 blur-[90px]" />

          <div className="mx-auto w-full max-w-6xl">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-blue-200 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Music lives better together
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
                {loading ? (
                  <>Find your next favorite album.</>
                ) : user ? (
                  <>Welcome back, <span className="text-blue-400">{user.firstName}.</span></>
                ) : (
                  <>More than music. <span className="text-blue-400">A shared taste.</span></>
                )}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
                Find the records worth your time, trade opinions with people who care, and turn every listen into a conversation.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]"
                >
                  Explore albums <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="/api/spotify/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08]"
                >
                  <Headphones className="h-4 w-4 text-green-400" />
                  Connect Spotify
                </a>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-zinc-500">
                <span>Rate albums</span>
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                <span>Find your people</span>
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                <span>Listen together</span>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
          <section className="border-t border-white/10 pt-12">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">Now playing</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">The Sound of 2026</h2>
                <p className="mt-2 text-base text-zinc-400">The year&apos;s biggest albums and essential new releases.</p>
              </div>
              <Link href="/search" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-white">
                Discover more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {popularAlbums.length > 0 && (
              <div className="mt-4 -mx-4">
                <AlbumScroll albums={popularAlbums} variant="featured" />
              </div>
            )}
          </section>

          <section className="mt-20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Top 10 Albums on Soundbase</h2>
            <p className="mt-2 text-zinc-400">The records earning the highest scores from the community.</p>
            {topAlbums.length > 0 && (
              <div className="mt-4 -mx-4">
                <AlbumScroll albums={topAlbums} />
              </div>
            )}
          </section>

          <section className="mt-20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Recently Reviewed <span aria-hidden="true">🔥</span></h2>
            <p className="mt-2 text-zinc-400">Fresh takes from the Soundbase community.</p>
            {recentAlbums.length > 0 && (
              <div className="mt-4 -mx-4">
                <AlbumScroll albums={recentAlbums} />
              </div>
            )}
          </section>

          {suggestedUsers.length > 0 && (
            <section className="mt-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Suggested Followers</h2>
              <p className="mt-2 text-zinc-400">People whose taste you may want to keep up with.</p>
              <div className="mt-4">
                <SuggestedUserScroll users={suggestedUsers} />
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
