'use client';

import { useEffect, useState } from 'react';

export default function InviteModal({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const [mutuals, setMutuals] = useState<{ id: string; firstName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [invited, setInvited] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMutuals() {
      const res = await fetch('/api/session/mutuals');
      const data = await res.json();
      setMutuals(data.mutuals || []);
      setLoading(false);
    }

    fetchMutuals();
  }, []);

  async function handleInvite(userId: string) {
    const res = await fetch(`/api/session/${sessionId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      setInvited((prev) => [...prev, userId]);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Invite Mutuals</h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : mutuals.length === 0 ? (
          <p className="text-gray-400">No mutuals available.</p>
        ) : (
          <ul className="space-y-3">
            {mutuals.map((user) => (
              <li key={user.id} className="flex justify-between items-center">
                <span>{user.firstName}</span>
                <button
                  onClick={() => handleInvite(user.id)}
                  disabled={invited.includes(user.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    invited.includes(user.id)
                      ? 'bg-green-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {invited.includes(user.id) ? 'Invited' : 'Invite'}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button onClick={onClose} className="mt-6 text-gray-400 hover:text-white text-sm underline">
          Close
        </button>
      </div>
    </div>
  );
}
