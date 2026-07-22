"use client";

import { useEffect, useState } from 'react'; 
import Navbar from "../components/navbar";
import AlbumScroll from "@/components/albumscroll";
import useUser from '@/hooks/useUser';
import Link from 'next/link';
import SuggestedUserScroll from '@/components/SuggestedUserScroll';

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
    <div className="pt-12 mt-24 mb-8 flex flex-col items-center justify-center min-h-screen bg-black text-white px-6 text-center">
    <h1 className="text-5xl font-bold mb-4">
  {loading ? (
    <>Loading...</>
  ) : user ? (
    <>Welcome to Soundbase, {user.firstName}!</>
  ) : (
    <>Don’t just listen... <span className="text-blue-500">Discover</span> music.</>
  )}
</h1>

      <p className="text-lg max-w-2xl text-gray-400">
        Dive into fresh sounds, uncover hidden gems, and redefine your listening experience.
        Connect with others, host listening sessions, and share your insights through reviews.
      </p>

      <Link href={"/search"}>
      <button className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold text-lg rounded-lg hover:bg-blue-600 transition">
        Start Exploring
      </button>
      </Link>

      <section className="mt-18">
        <h3 className="text-4xl font-bold">The Sound of 2026</h3>
        <p className="mt-2 text-base text-gray-400">
          The year&apos;s biggest albums and essential new releases.
        </p>
      </section>
      {popularAlbums.length > 0 &&
      <div className="mt-6 w-full">
        <AlbumScroll albums={popularAlbums}/>
      </div>}

      <h3 className="mt-18 text-4xl font-bold mb-4">Top 10 Albums on Soundbase</h3>
      {/* Album Carousel */}
      {topAlbums.length > 0 && 
      <div className="mt-6 w-full">
        <AlbumScroll albums={topAlbums}/>
      </div>}

      <h3 className="mt-18 text-4xl font-bold mb-4">Recently Reviewed 🔥</h3>
      {/* Album Carousel */}
      {recentAlbums.length > 0 && 
      <div className="mt-6 w-full">
        <AlbumScroll albums={recentAlbums}/>
      </div>}

      {suggestedUsers.length > 0 && (
          <>
            <h3 className="mt-12 text-4xl font-bold mb-4">Suggested Followers</h3>
            <div className="mt-6 w-full">
              <SuggestedUserScroll users={suggestedUsers} />
            </div>
          </>
        )}
    </div>
    </>
  );
}
