'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {signIn} from 'next-auth/react';

export default function LoginPage() {
    /*We need this to dynamically change the values of form.identifier and form.password
    whenever the user makes a keystroke*/
    const [form, setForm] = useState({identifier: '', password: ''}); 
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setHasSubmitted(true);

        const res = await fetch('/api/login', {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(form)
        });

        const data = await res.json();

        if (!res.ok) {
            if (data.field && data.error) {
                setFieldErrors({[data.field]: data.error});
            } else {
                setFieldErrors({general:data.error || 'Login failed'});
            }
        } else {
            setFieldErrors({});
            router.push('/');
        }
    };


    return (
        <div className="flex flex-col items-center mt-10">
            {/*Soundbase Logo*/}
            <div className="mb-6">
                <Image
                    src="/images/logo.png"
                    alt="Soundbase Logo"
                    width={320}
                    height={100}
                    className="h-auto"
                />
            </div>

            <div className="w-full max-w-md p-6 rounded-lg bg-black bg-opacity-60">
                <h1 className="text-2xl font-bold mb-12 text-white text-center">Welcome back to Soundbase</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="identifier"
                        placeholder="Email or phone number"
                        value={form.identifier}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded bg-black text-white 
                            transition-all duration-350 ease-in-out 
                            focus:outline-none
                            ${hasSubmitted && fieldErrors.identifier
                                ? 'border border-red-500 focus:ring-red-500 ring-1'
                                : 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500 ring-0'}
                        `}
                        style={{WebkitBoxShadow: '0 0 0px 1000px #000 inset',
                                WebkitTextFillColor: 'white',
                        }}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded bg-black text-white
                            transition-all duration-350 ease-in-out
                            focus:outline-none
                            ${hasSubmitted && fieldErrors.password
                            ? 'border border-red-500 focus:border-red-500 focus:ring-red-500 ring-1'
                            : 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500 ring-0'}
                        `}
                        style={{
                            WebkitBoxShadow: '0 0 0px 1000px #000 inset',
                            WebkitTextFillColor: 'white',
                        }}
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 font-bold text-white py-2 rounded hover:bg-blue-700"
                    >Log In
                    </button>

                    {Object.values(fieldErrors).length > 0 && (
                        <div className="mt-4 space-y-1">
                            {Object.values(fieldErrors).map((msg, idx) => (
                                <p key={(idx)} className="text-red-500 text-sm text-center">{msg}</p>
                            ))}
                        </div>
                    )}
                </form>
                <button
            type="button"
            onClick={() => signIn('google')}
            className="w-full mt-4 p-0 bg-transparent border-none"
        >
        <img
            src="/images/light/google_signup.png"
            alt="Sign up with Google"
            className="mt-4 max-h-10 w-auto mx-auto block"
        />
        <h3 className='mt-8 mb-8'>OR</h3>
        </button>



        <p className="mt-4 text-sm text-center text-white">
            Don't have an account?{' '}
            <a href="/signup"
            className="text-blue-400 hover:text-blue-300 hover:underline transition"
            >Sign up here
            </a>
        </p>
            </div>
        </div>
    );
}