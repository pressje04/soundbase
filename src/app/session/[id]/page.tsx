'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import AlbumSelector from '@/components/AlbumSelector';
import Navbar from '@/components/navbar';

type Album = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
};

type Session = {
  id: string;
  hostId: string;
  isLive: boolean;
  createdAt: string;
  host: { id: string; firstName: string };
};

type Participant = {
  id: string;
  name: string;
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [sessionRes, userRes] = await Promise.all([
        fetch(`/api/session/${id}`),
        fetch('/api/me'),
      ]);
  
      const sessionData = await sessionRes.json();
      const userData = await userRes.json();
  
      if (!sessionRes.ok || !userRes.ok || !userData.user) {
        setError('Failed to load session or user data');
        return;
      }
  
      setCurrentUserId(userData.user.id);
      setFirstName(userData.user.firstName);
      setSession(sessionData.session);
    }
  
    fetchData();
  }, [id]);
  

  useEffect(() => {
    if (session && currentUserId && firstName) {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        path: '/socket.io',
        transports: ['websocket', 'polling'], // fallback if websocket fails
        query: { sessionId: session.id, userId: currentUserId, firstName: firstName},
      });
      console.log("HERE", currentUserId);
      

      socketInstance.on('connect', () => {
        console.log('Connected to session socket');
      });

      socketInstance.on('album_selected', (album: Album) => {
        console.log('Received album:', album);
        setCurrentAlbum(album);
      });

      socketInstance.on('participants_update', (users: Participant[]) => {
        console.log("Particpants: ", users);
        setParticipants(users);
      })

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [session, currentUserId, firstName]);

  function handleAlbumSelect(album: Album) {
    setCurrentAlbum(album);
    socket?.emit('album_selected', album);
  }

  if (error) {
    return <div className="text-red-600 p-6">{error}</div>;
  }

  if (!session) {
    return <div className="p-6">Loading session...</div>;
  }

  const isHost = currentUserId === session.hostId;

  return (
    <div className="p-6">
      <div className="mb-20">
      <Navbar />
      </div>
      <h1 className="text-2xl font-bold">🎧 Listening Party</h1>
      <p className="text-gray-500">
        Host: {session.host.firstName} | Session ID: {session.id}
      </p>

      {isHost && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Select an Album:</h2>
          <AlbumSelector onSelect={handleAlbumSelect} />
        </div>
      )}

      {currentAlbum && (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold">{currentAlbum.name}</h2>
          <p className="text-gray-500">
            by {currentAlbum.artists.map((a) => a.name).join(', ')}
          </p>
          <img
            src={currentAlbum.images[0]?.url}
            alt="album cover"
            className="mx-auto mt-4 w-40 h-40 rounded"
          />
        </div>
      )}

      {!currentAlbum && (
        <div className="mt-6 text-center text-lg">
          Waiting for host to select an album...
        </div>
      )}

<div className="mt-4">
  <h2 className="text-lg font-semibold">Participants</h2>
  <ul className="list-disc list-inside text-white">
    {participants.map((user) => (
      <li key={user.id}>{user.name}</li>
    ))}
  </ul>
</div>
    </div>

    
  );
}
