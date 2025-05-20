'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [form, setForm] = useState({
        identifier: "",
        password: "", 
        confirmPassword: ""}
    );
    const [error, setError] = useState('');
    const router = useRouter();

    /*Handles entering/deleting text from a field, really important for 
    react i/o

    params: React.ChangeEvent<HTMLInputElement> ==> essentially the element being changed
    */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
    }

    /*This handles a user submitting signup info to our app.
    If it fails for whatever reason (which it shouldn't even 
    if user entered/omitted info) it redirects back to signup page.
    */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        //Send a request to our custom signup API
        const res = await fetch('/api/signup', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(form),
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || 'Signup failed');
        } else {
            router.push('/');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="text"
                    name="identifier" 
                    placeholder="Email or phone number" 
                    value={form.identifier} 
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded'
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >Sign Up</button>
            </form>
        </div>
    )
    
}