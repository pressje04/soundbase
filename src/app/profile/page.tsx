'use client';
import useUser from "@/hooks/useUser";
import { useState, useEffect } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import Navbar from "@/components/navbar";


export default function ProfilePage() {
    const {user} = useUser();
    const [reviews, setReviews] = useState<any[]>([]);
    const [favoriteAlbum, setFavoriteAlbum] = useState<any | null>(null);
    //When u get to it, fav artist state goes here

    useEffect(() => {
        async function fetchReviews() {
            if (!user) return;

            const res = await fetch(`api/reviews/user`);
            const data = await res.json();
            setReviews(data || []);

            //Favorite Album logic here
            if (data.length > 0) {
                const fav = data.reduce((max: any, r: any) => 
                    r.rating > max.rating ? r : max,
                    data[0]
                );
                setFavoriteAlbum({name: fav.albumName, id: fav.albumId});
            }
        }
        fetchReviews();
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
          <div className="max-w-4xl mx-auto mt-24 text-white px-6">
            <ProfileHeader
              name={user.firstName}
              createdAt={user.createdAt}
              favoriteAlbum={favoriteAlbum}
              // favoriteArtist={favoriteArtist}
            />
            <h2 className="text-2xl font-semibold mb-4">Your Reviews</h2>
            {/*<ProfileReviewList reviews={reviews} />*/}
          </div>
        </>
    );
}