'use client';

import {use} from 'react';
import useUser from "@/hooks/useUser";
import { useState, useEffect } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import Navbar from "@/components/navbar";
import FavAlbumProf from "@/components/FavAlbumProf";
import FollowModal from '@/components/FollowModal';

export default function ProfilePage({ params }: { params: Promise<{id: string}> }) {
  const { user } = useUser();
  const {id: profileUserId} = use(params);

  const isOwnProfile = user?.id === profileUserId;
  const [profileData, setProfileData] = useState<any | null>(null);
  const [favoriteAlbum, setFavoriteAlbum] = useState<any | null>(null);

  //This is for displaying follower/following modals of users
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  // Fetch profile data (for both self and others)
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/user?id=${profileUserId}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    }

    fetchProfile();
  }, [profileUserId]);

  // Fetch reviews and determine favorite album
  useEffect(() => {
    async function fetchReviewsAndAlbum() {
      try {
        const reviewRes = await fetch(`/api/reviews/user?id=${profileUserId}`);
        const reviews = await reviewRes.json();

        if (reviews.length === 0) return;

        const fav = reviews.reduce((max: any, r: any) =>
          r.rating > max.rating ? r : max,
          reviews[0]
        );

        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

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
      } catch (err) {
        console.error("Failed to load favorite album:", err);
      }
    }

    fetchReviewsAndAlbum();
  }, [profileUserId]);

  if (!profileData) {
    return (
      <div className="mt-24 text-white text-center">
        <h1 className="text-2xl font-semibold">Loading profile...</h1>
      </div>
    );
  }

  const followerCount = profileData?.followers?.length || 0;
  const followingCount = profileData?.following?.length || 0;

  return (
    <>
      <FollowModal
        title="Followers"
        users={profileData.followers.map((f: any) => f.follower)}
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
      />
      <FollowModal
        title="Following"
        users={profileData.following.map((f: any) => f.following)}
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
      />
      <Navbar />
      <div className="flex flex-col items-center max-w-4xl mx-auto mt-28 text-white px-6">
        <ProfileHeader
          name={profileData.firstName}
          createdAt={profileData.createdAt}
          favoriteAlbum={favoriteAlbum}
          followerCount={followerCount}
          followingCount={followingCount}
          onFollowersClick={() => setShowFollowers(true)}
          onFollowingClick={() => setShowFollowing(true)}
        />

        {!isOwnProfile && (
          <div className="mt-4">
            {/* Future follow/unfollow button goes here */}
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Follow
            </button>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4 mt-6">
          {isOwnProfile ? "Your Reviews" : `${profileData.firstName}'s Reviews`}
        </h2>
        {/* Add review list here later */}
      </div>

      <div className="flex flex-col items-center">
        {favoriteAlbum && (
          <div className="mt-6">
            <h1 className="flex font-bold text-xl">Favorite Album</h1>
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
