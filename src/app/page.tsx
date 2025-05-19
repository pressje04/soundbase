"use client";

import { useEffect, useState } from 'react'; 
import Navbar from "../components/navbar.jsx";
import AlbumScroll from "@/components/albumscroll";

export default function Page() {
  const [albums, setAlbums] = useState([]) //React state for setting albums and displaying them

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
  

  return (
    <>
    <Navbar />
    <div className="mt-12 flex flex-col items-center justify-center min-h-screen bg-black text-white px-6 text-center">
      <h1 className="text-5xl font-bold mb-4">
        Don't just listen.....
        <span className="text-blue-500"> Discover </span>
        music.
      </h1>
      <p className="text-lg max-w-2xl text-gray-400">
        Dive into fresh sounds, uncover hidden gems, and redefine your listening experience.
        Connect with others, host listening sessions, and share your insights through reviews.
      </p>
      <button className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold text-lg rounded-lg hover:bg-blue-600 transition">
        Start Exploring
      </button>

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