"use client";

import { useEffect, useState } from 'react'; 
import Navbar from "../components/navbar";
import AlbumScroll from "@/components/albumscroll";
import useUser from '@/hooks/useUser';

export default function Page() {
  const [albums, setAlbums] = useState([]) //React state for setting albums and displaying them
  const [topAlbums, setTopAlbums] = useState<any[]>([]);
  const {user, loading} = useUser(); // Custom hook to see if user is logged in

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const albumRes = await fetch("/api/albums");
        const albums = await albumRes.json();
        setAlbums(albums);
      } catch (error) {
        console.error("Failed to get albums:", error);
      }
    }
  
    fetchAlbums();
  }, []);

  useEffect(() => {
    async function fetchTopAlbums() {
      const res = await fetch('/api/albums/top10');
      const data = await res.json();

      const formattedData = data.map((album: any) => ({
        id: album.albumId,
        name: album.albumName,
        images: [{url: album.imageUrl}],
      }))
      setTopAlbums(formattedData);
    }
    fetchTopAlbums();
  }, []);
  

  return (
    <>
    <Navbar />
    <div className="pt-12 mt-24 flex flex-col items-center justify-center min-h-screen bg-black text-white px-6 text-center">
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
      <button className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold text-lg rounded-lg hover:bg-blue-600 transition">
        Start Exploring
      </button>

      <h3 className="mt-18 text-4xl font-bold mb-4">Top 10 Albums on Soundbase</h3>
      {/* Album Carousel */}
      {topAlbums.length > 0 && 
      <div className="mt-6 w-full">
        <AlbumScroll albums={topAlbums}/>
      </div>}

      <h3 className="mt-18 text-4xl font-bold mb-4">New Releases</h3>
      {/* Album Carousel */}
      {albums.length > 0 && 
      <div className="mt-6 w-full">
        <AlbumScroll albums={albums}/>
      </div>}
    </div>
    </>
  );
}