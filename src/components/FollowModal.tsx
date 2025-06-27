'use client';

import { Dialog } from '@headlessui/react';
import { User } from 'lucide-react';
import Link from 'next/link';

export default function FollowModal({
  title,
  users,
  isOpen,
  onClose,
}: {
  title: string;
  users: { id: string; firstName: string; image?: string }[];
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex flex-col items-center justify-start pt-24 min-h-screen px-4 bg-black bg-opacity-80">
        <div className="text-white text-2xl font-semibold mb-6">{title}</div>

        {users.length === 0 ? (
          <p className="text-gray-400">Nothing to see here.</p>
        ) : (
          <ul className="w-full max-w-md space-y-4">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-4 px-4 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <Link
                  href={`/profile/${user.id}`}
                  className="text-white font-medium font-semibold hover:text-blue-500 transition"
                >
                  {user.firstName}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-10 text-sm text-gray-300 hover:text-white underline"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}
