'use client';

import {useState} from 'react';

export default function SearchBar({onSearch}: {onSearch: (query: string) => void }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
            <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for artists or albums..."
                className="flex-grow px-4 py-2 rounded bg-black text-white border border-gray-600"
            />

            <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >Search</button>
        </form>
    );
}