/* Session landing page where users can:
   * start a session (they would be the host)
   * view invites to sessions
   * join sessions that they are invited to
*/
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import TopAlbumCarousel from '@/components/SessionCarousel';

type Invite = {
  session: {
    id: string;
    createdAt: string;
    host: { firstName: string };
  };
};

export default function SessionLandingPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInvites() {
      const res = await fetch('/api/session/invites');
      const data = await res.json();
      setInvites(data.invites || []);
    }
    fetchInvites();
  }, []);

  async function handleStartSession() {
    setLoading(true);
    const res = await fetch('/api/session/create', { method: 'POST' });
    const data = await res.json();
    if (data.session?.id) {
      router.push(`/session/${data.session.id}`);
    }
  }

  async function handleJoin(sessionId: string) {
    // mark session as joined if needed, or just navigate
    router.push(`/session/${sessionId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-6 py-10">
      <div className="mb-16">
        <Navbar />
      </div>

      <div className="mb-10">
        <TopAlbumCarousel />
      </div>
  
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold mb-6 tracking-tight">
          Welcome to Soundbase Sessions 🎤
        </h1>
        <p className="mb-6">
          Real-time. Real music. Real friends — stream fully synced music, no matter the miles in between.
          </p>
  
        <button
  onClick={handleStartSession}
  disabled={loading}
  className="relative overflow-hidden rounded-xl px-6 py-3 font-bold text-white transition-transform duration-300 hover:scale-105 shadow-xl bg-gradient-to-br from-orange-400 via-pink-400 to-red-400"
>
  {/* Background blobs */}
  <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
  <div className="absolute w-60 h-60 bg-pink-500 opacity-40 rounded-full blur-3xl animate-blob-motion -top-20 -left-20"></div>
<div className="absolute w-60 h-60 bg-orange-300 opacity-40 rounded-full blur-3xl animate-blob-motion delay-2000 top-10 left-32"></div>
<div className="absolute w-60 h-60 bg-yellow-300 opacity-30 rounded-full blur-3xl animate-blob-motion delay-4000 top-32 left-10"></div>
<div className="absolute w-60 h-60 bg-purple-300 opacity-30 rounded-full blur-3xl animate-blob-motion delay-[6s] -bottom-10 right-12"></div>
<div className="absolute w-60 h-60 bg-cyan-300 opacity-30 rounded-full blur-3xl animate-blob-motion delay-[8s] top-24 right-0"></div>
  </div>

  {/* Button text */}
  <span className="relative z-10">
    {loading ? 'Launching Session...' : 'Start a New Session'}
  </span>
</button>




      </div>
  
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-white">📨 Your Invitations</h2>
  
        {invites.length === 0 ? (
          <p className="text-gray-400">No pending invites.</p>
        ) : (
          <ul className="space-y-4">
            {invites.map((invite) => (
              <li
                key={invite.session.id}
                className="bg-zinc-700 rounded-xl p-5 shadow-md flex justify-between items-center hover:bg-zinc-600 transition"
              >
                <div>
                  <p className="text-lg font-semibold">
                    Host: {invite.session.host.firstName}
                  </p>
                  <p className="text-sm text-gray-300">
                    Created: {new Date(invite.session.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleJoin(invite.session.id)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-semibold transition"
                >
                  Join Session
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );  
}
