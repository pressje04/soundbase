'use client';

import {useEffect, useState} from 'react';

type User = {
    id: string;
    firstName: string
};

export default function useUser() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/me');
                if (!res.ok) return;
                const data = await res.json();
                setUser(data.user);
            } catch {
                setUser(null);
            }
        }
        fetchUser();
    }, []);

    return user;
}