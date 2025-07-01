'use client';

import Image from 'next/image';
import Link from 'next/link';
import Albumdash from './Albumdash';
import AlbumPlayerClient from './AlbumPlayerClient';
import PostList from './PostList';
import { useState } from 'react';
import CommentComposer from './CommentField';
import { useSpotifyPlayerStore } from '@/hooks/useSpotifyPlayerStore';

const { deviceId, isConnected } = useSpotifyPlayerStore();

const handlePlayTrack = async (trackUri: string) => {
  const token = localStorage.getItem('spotifyAccessToken');
  if (!token || !deviceId) {
    alert('Spotify not ready. Please wait a moment.');
    return;
  }

  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });
};


type Props = {
  albumId: string;
  albumName: string;
  artistName: string;
  releaseYear: string;
  imageUrl: string;
  tracklist: {
    id: string;
    name: string;
    duration_ms?: number;
    artists?: { name: string }[];
  }[];
};

export default function AlbumPageClient(props: Props) {
  const [newPost, setNewPost] = useState(null);

  const albumArtistSet = new Set(
    props.artistName.split(',').map((a) => a.trim().toLowerCase())
  );

  const handlePlayTrack = async (trackId: string) => {
    const tokenRes = await fetch('/api/token'); // Or however you get your token
    const { access_token } = await tokenRes.json();
  
    const deviceId = localStorage.getItem('spotifyDeviceId'); // Assuming you store it on load
    if (!access_token || !deviceId) return alert('Spotify not ready');
  
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [`spotify:track:${trackId}`],
      }),
    });
  };  

  return (
    <div className="mt-4">
      {/* Album Image and Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <Image
          src={props.imageUrl}
          alt={props.albumName}
          width={300}
          height={300}
          className="rounded-xl shadow-lg"
        />

        <div className="flex flex-col w-full text-center md:text-left items-center md:items-start gap-6 max-w-full">
          {/* Album Info */}
          <div className="max-w-2xl break-words">
            <p className="uppercase text-sm text-gray-400 tracking-wide">Album</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-2 leading-tight">
              {props.albumName}
            </h1>
            <div className="text-2xl font-bold mt-1 flex flex-wrap justify-center md:justify-start gap-2">
              {props.artistName.split(', ').map((name, idx) => (
                <Link key={idx} href="#" className="text-blue-500 hover:underline">
                  {name}
                </Link>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{props.releaseYear}</p>
          </div>

          {/* Play Button */}
          <div>
            <AlbumPlayerClient albumId={props.albumId} />
          </div>

          {/* Score + Review */}
          <div className="w-full flex justify-center md:justify-start">
            <Albumdash {...props} onPostSubmit={setNewPost} />
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Tracklist</h2>
        <ol className="mt-8 space-y-4">
          {props.tracklist.map((track, index) => {
            const trackArtistNames =
              track.artists?.map((a) => a.name.trim().toLowerCase()) || [];
            const isSameAsAlbum =
              trackArtistNames.length > 0 &&
              trackArtistNames.every((name) => albumArtistSet.has(name)) &&
              albumArtistSet.size === trackArtistNames.length;

            return (
              <li 
                key={track.id} 
                onClick={() => handlePlayTrack(`spotify:track:${track.id}`)} 
                className="flex justify-between items-start p-3 rounded-md transition cursor-pointer hover:border hover:border-gray-400">
                <div className="flex gap-4">
                  <span className="w-6 text-right text-sm text-gray-500">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-white text-base font-medium">
                      {track.name}
                    </p>
                    {!isSameAsAlbum && track.artists?.length && (
                      <p className="text-sm text-gray-400">
                        {track.artists.map((a) => a.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                {track.duration_ms && (
                  <span className="text-sm text-gray-400">
                    {Math.floor(track.duration_ms / 60000)}:
                    {String(
                      Math.floor((track.duration_ms % 60000) / 1000)
                    ).padStart(2, '0')}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Discussion */}
      <h2 id="discussion" className="text-2xl font-semibold mt-12 mb-4">Discussion</h2>

<CommentComposer
  albumId={props.albumId}
  albumName={props.albumName}
  artistName={props.artistName}
  imageUrl={props.imageUrl}
  releaseYear={props.releaseYear}
  onCommentPosted={setNewPost}
/>

<PostList albumId={props.albumId} newPost={newPost} />

    </div>
  );
}
