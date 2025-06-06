/* Session landing page where users can:
   * start a session (they would be the host)
   * view invites to sessions
   * join sessions that they are invited to
*/
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';

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
    <div className="p-6">
      <div className="mb-20">
        <Navbar />
      </div>
      <h1 className="text-2xl font-bold mb-4">🎤 Session Lobby</h1>

      <button
        onClick={handleStartSession}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
      >
        {loading ? 'Starting...' : 'Start a New Session'}
      </button>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Your Invitations</h2>
        {invites.length === 0 ? (
          <p className="text-gray-500">No pending invites.</p>
        ) : (
          <ul className="space-y-2">
            {invites.map((invite) => (
              <li
                key={invite.session.id}
                className="bg-zinc-800 p-4 rounded text-white flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">Host: {invite.session.host.firstName}</p>
                  <p className="text-sm text-gray-400">
                    Created: {new Date(invite.session.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleJoin(invite.session.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
