'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import AlbumSelector from '@/components/AlbumSelector';
import Navbar from '@/components/navbar';
import VideoCall from '@/components/VideoCall';
import { Users, UserPlus, MessageSquareText, DoorOpen } from 'lucide-react';
import InviteModal from '@/components/InviteModal';

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
  const [messages, setMessages] = useState<
    {user: string; message: string; timestamp: number}[]
  >([]);
  const [newMessage, setNewMessage] = useState('');

  //Bottom bar
  const [chatOpen, setChatOpen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const[showParticipants, setShowParticipants] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);


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

      socketInstance.on('chat_message', (msg) => {
        console.log("DEBUG: ", msg);
        setMessages((prev) => [...prev, msg]);
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

  /* For the session page (at least initially), I wrap it in a 
  flex container to that I can partition the page essentially having 
  the chat as its on panel on the right partition of the screen */
  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white">
      {/* Left side: main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-20">
          <Navbar />
        </div>
  
        {isHost && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Select an Album:</h2>
            <AlbumSelector onSelect={handleAlbumSelect} />
          </div>
        )}
  
        {currentAlbum ? (
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
        ) : (
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
      <div className="mt-10">
      <VideoCall sessionId={session.id}/>
      </div>
      </div>
{chatOpen && (
  <div className="fixed inset-0 z-40 flex justify-end">
    {/* Background blur overlay */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setChatOpen(false)} />

    {/* Chat panel */}
    <div className="relative w-80 h-full bg-zinc-900 p-4 pb-32 border-l border-zinc-700 flex flex-col z-50 shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-white">Chat</h2>
        <button
          onClick={() => setChatOpen(false)}
          className="text-white hover:text-red-500 text-xl font-bold"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-scroll text-white space-y-2">
        {messages.map((msg, idx) => (
          <p key={idx}>
            <strong>{msg.user}:</strong> {msg.message}
          </p>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newMessage.trim()) return;
          socket?.emit('chat_message', {
            user: firstName,
            message: newMessage.trim(),
            timestamp: Date.now(),
          });
          setNewMessage('');
        }}
        className="mt-4"
      >
        <input
          className="w-full px-3 py-2 rounded bg-zinc-800 text-white"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
      </form>
    </div>
  </div>
)}
   {/* Fixed Bottom Bar */}
<div className="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-700 py-3 px-6 flex justify-between items-center z-50">
  <div className="flex flex-grow ml-4 justify-between max-w-xs">
    {/* Participants */}
    <button
      onClick={() => setShowParticipants(true)}
      className="text-white hover:text-blue-400 transition"
    >
      <Users />
    </button>

    {/* Chat */}
    <button
      onClick={() => setChatOpen(true)}
      className="text-white hover:text-blue-400 transition"
    >
      <MessageSquareText />
    </button>

    {/* Host-only Invite button */}
    {isHost && (
      <button
        onClick={() => setShowInviteModal(true)}
        className="text-white hover:text-green-400 transition"
      >
        <UserPlus />
      </button>
    )}
  </div>

  {/* Leave button */}
  {isHost && (
          <button
            onClick={async () => {
            const confirmed = confirm('Are you sure you want to end this session?');
            if (!confirmed) return;

            const res = await fetch(`/api/session/${session.id}/end`, {
              method: 'DELETE',
            });

            if (res.ok) {
              alert('Session ended.');
              window.location.href = '/session'; // Redirect to landing
            } else {
              const data = await res.json();
              alert(`Failed to end session: ${data.error}`);
            }
         }}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-md text-sm font-medium"
        >
        End Session
        </button>
      )}
  <button
    onClick={() => router.push('/session')}
    className="hover:text-red-500"
  >
    <DoorOpen />
  </button>
  {showInviteModal && (
  <InviteModal
    sessionId={session.id}
    onClose={() => setShowInviteModal(false)}
  />
)}

</div>
</div>
  );
  
}
