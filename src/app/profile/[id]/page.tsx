'use client';

import { use } from 'react';
import useUser from "@/hooks/useUser";
import { useState, useEffect, useRef } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import Navbar from "@/components/navbar";
import FavAlbumProf from "@/components/FavAlbumProf";
import FollowModal from '@/components/FollowModal';
import ProfileTabs from '@/components/ProfileTabs';
import UserActivityFeed from '@/components/ProfileFeed';

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { id: profileUserId } = use(params);

  const isOwnProfile = user?.id === profileUserId;
  const [profileData, setProfileData] = useState<any | null>(null);
  const [favoriteAlbum, setFavoriteAlbum] = useState<any | null>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Posts' | 'Likes'>('Posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch('/api/user/avatar', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const updated = await res.json();
      setProfileData((prev: any) => ({ ...prev, image: updated.image }));
    } else {
      console.error('Failed to upload avatar');
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/user?id=${profileUserId}`);
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    }
    fetchProfile();
  }, [profileUserId]);

  useEffect(() => {
    async function fetchFavoriteAlbum() {
      try {
        const reviewRes = await fetch(`/api/reviews/user?id=${profileUserId}`);
        const reviews = await reviewRes.json();
        if (reviews.length === 0) return;

        const fav = reviews.reduce((max: any, r: any) => r.rating > max.rating ? r : max, reviews[0]);

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
    fetchFavoriteAlbum();
  }, [profileUserId]);

  useEffect(() => {
    async function fetchTabPosts() {
      try {
        const res = await fetch(`/api/user/${profileUserId}/${activeTab.toLowerCase()}`);
        const data = await res.json();
        // If needed: setPosts(data || []);
      } catch (err) {
        console.error(`Failed to fetch ${activeTab.toLowerCase()} posts:`, err);
      }
    }
    fetchTabPosts();
  }, [profileUserId, activeTab]);

  useEffect(() => {
    if (!user || !profileData) return;
    const alreadyFollowing = profileData.followers?.some((f: any) => f.followerId === user.id);
    setIsFollowing(alreadyFollowing);
  }, [profileData, user]);

  const handleFollowToggle = async () => {
    if (!user) return;

    const payload = {
      followerId: user.id,
      followingId: profileUserId,
    };

    const res = await fetch('/api/follow', {
      method: isFollowing ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsFollowing(!isFollowing);

      // Optimistically update UI
      setProfileData((prev: any) => {
        if (!prev) return prev;

        const updatedFollowers = isFollowing
          ? prev.followers.filter((f: any) => f.followerId !== user.id)
          : [...prev.followers, { followerId: user.id, follower: user }];

        return { ...prev, followers: updatedFollowers };
      });
    } else {
      console.error('Follow/unfollow failed:', await res.json());
    }
  };

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
          followerCount={followerCount}
          followingCount={followingCount}
          onFollowersClick={() => setShowFollowers(true)}
          onFollowingClick={() => setShowFollowing(true)}
          image={profileData.image}
          onAvatarClick={isOwnProfile ? () => fileInputRef.current?.click() : undefined}
          username={profileData.username}
        />

        {isOwnProfile && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            hidden
          />
        )}

        {/* Correct placement: follow button not tied to favorite album */}
        {user && !isOwnProfile && (
          <div className="mt-4">
            <button
              className={`px-4 py-2 rounded ${
                isFollowing
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              onClick={handleFollowToggle}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        )}

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

        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-6 w-full">
          <UserActivityFeed userId={profileUserId} type={activeTab} />
        </div>
      </div>
    </>
  );
}
