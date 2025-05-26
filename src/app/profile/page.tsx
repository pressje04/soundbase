'use client';
import useUser from "@/hooks/useUser";
import { useState, useEffect } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import Navbar from "@/components/navbar";
import FavAlbumProf from "@/components/FavAlbumProf";


export default function ProfilePage() {
    const {user} = useUser();
    const [reviews, setReviews] = useState<any[]>([]);
    const [favoriteAlbum, setFavoriteAlbum] = useState<any | null>(null);
    //When u get to it, fav artist state goes here

    useEffect(() => {
        async function fetchReviewsAndAlbum() {
          if (!user) return;
      
          const reviewRes = await fetch('/api/reviews/user');
          const reviews = await reviewRes.json();
      
          if (reviews.length === 0) return;
      
          const fav = reviews.reduce((max: any, r: any) =>
            r.rating > max.rating ? r : max,
            reviews[0]
          );
      
          // 🔐 Fetch Spotify token
          const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              Authorization: `Basic ${btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
          });
      
          const tokenData = await tokenRes.json();
          const accessToken = tokenData.access_token;
      
          // 🎵 Fetch Spotify album details
          const albumRes = await fetch(`https://api.spotify.com/v1/albums/${fav.albumId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
      
          const albumData = await albumRes.json();
      
          setFavoriteAlbum({
            id: fav.albumId,
            name: fav.albumName,
            rating: fav.rating,
            artist: fav.artistName,
            releaseYear: fav.releaseYear.slice(0, 4),
            imageUrl: fav.imageUrl ?? '',
          });
        }
      
        fetchReviewsAndAlbum();
      }, [user]);
      

    if (user === null) {
        return (
            <div className="mt-24 text-red-500 text-center">
                <h1 className="text-2xl font-semibold">Please log in to view profile</h1>
            </div>
        );
    }

    return (
        <>
          <Navbar />
          <div className="flex flex-col items-center max-w-4xl mx-auto mt-28 text-white px-6">
            <ProfileHeader
              name={user.firstName}
              createdAt={user.createdAt}
              favoriteAlbum={favoriteAlbum}
              // favoriteArtist={favoriteArtist}
            />
            <h2 className="text-2xl font-semibold mb-4">Your Reviews</h2>
            {/*<ProfileReviewList reviews={reviews} />*/}
          </div>
          <div className="flex flex-col items-center">
          {favoriteAlbum && (
            <div className="mt-6">
                <h1 className="flex font-bold text-xl">Your Favorite Album</h1>
                <FavAlbumProf
                    albumId={favoriteAlbum.id}
                    albumName={favoriteAlbum.name}
                    artistName={favoriteAlbum.artist}
                    releaseYear={favoriteAlbum.releaseYear}
                    imageUrl={favoriteAlbum.imageUrl}
                    userRating={favoriteAlbum.rating}
                />
  </div>
)}

          </div>
        </>
    );
}