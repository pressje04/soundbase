'use client';

import {Dialog} from '@headlessui/react';
import { useState } from 'react';

export default function FollowModal({
    title,
    users,
    isOpen,
    onClose,
}: {
    title: string;
    users: {id: string; firstName: string}[];
    isOpen: boolean;
    onClose: () => void;
}) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 bg-black bg-opacity-60">
                <Dialog.Panel className="bg-white rounded-lg max-w-md w-full p-6">
                    <Dialog.Title className="text-lg font-bold mb-4">{title}</Dialog.Title>
                    {users.length === 0 ? (
                        <p className="text-gray-600">Nothing to see here</p>
                    ) : (
                        <ul className="space-y-2">
                            {users.map((user) => (
                                <li key={user.id} className="text-gray-800">
                                    {user.firstName}
                                </li>
                            ))}
                        </ul>
                    )}
                    <button 
                        onClick={onClose}
                        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Close</button>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}