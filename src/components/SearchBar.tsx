'use client';

import { useState } from 'react';

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex w-full max-w-xl overflow-hidden rounded-full border border-gray-600 bg-black">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search for artists or albums..."
        className="flex-grow px-4 py-2 bg-black text-white focus:outline-none"
      />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Search
      </button>
    </form>
  );
}
