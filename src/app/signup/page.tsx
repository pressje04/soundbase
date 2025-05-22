'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react'; 
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignupPage() {
  const [form, setForm] = useState({
    identifier: "",
    firstName: "",
    password: "",
    confirmPassword: ""
  });

  // This is for when the text field becomes red if a user enters something incorrectly
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [hasSubmitted, setHasSubmitted] = useState(false); // Track if user has submitted
  const router = useRouter();

  /* Handles entering/deleting text from a field, really important for 
     react i/o

     params: React.ChangeEvent<HTMLInputElement> ==> essentially the element being changed
  */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* This handles a user submitting signup info to our app.
     If it fails for whatever reason (which it shouldn't even 
     if user entered/omitted info) it redirects back to signup page.
  */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true); // Enable red border check

    // Send a request to our custom signup API
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      if (data.field && data.error) {
        setFieldErrors({ [data.field]: data.error });
      } else {
        setFieldErrors({ general: data.error || 'Signup failed, check the information you have entered' });
      }
    } else {
      setFieldErrors({});
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      {/* Logo - above the form */}
      <div className="mb-6">
        <Image
          src="/images/logo.png"
          alt="Soundbase Logo"
          width={320}
          height={100}
          className="h-auto"
        />
      </div>

      {/* Signup form with border */}
      <div className="w-full max-w-md p-6 rounded-lg bg-black bg-opacity-60">
        <h1 className="text-2xl font-bold mb-16 text-white text-center">Sign Up For Soundbase</h1>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Identifier field */}
          <input
            type="text"
            name="identifier"
            placeholder="Email or phone number"
            value={form.identifier}
            onChange={handleChange}
            autoComplete="off"
            className={`w-full px-4 py-2 rounded bg-black text-white
              transition-all duration-350 ease-in-out
              focus:outline-none
              ${hasSubmitted && fieldErrors.identifier
                ? 'border border-red-500 focus:border-red-500 focus:ring-red-500 ring-1'
                : 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500 ring-0'}
            `}
            style={{
              WebkitBoxShadow: '0 0 0px 1000px #000 inset',
              WebkitTextFillColor: 'white',
            }}
          />

          {/*First Name Field */}
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            autoComplete="new-password"
            value={form.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded bg-black text-white
              transition-all duration-350 ease-in-out
              focus:outline-none
              ${hasSubmitted && fieldErrors.firstName
                ? 'border border-red-500 focus:border-red-500 focus:ring-red-500 ring-1'
                : 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500 ring-0'}
            `}
            style={{
              WebkitBoxShadow: '0 0 0px 1000px #000 inset',
              WebkitTextFillColor: 'white',
            }}
          />

          {/* Password field */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
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

          {/* Confirm password field */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded bg-black text-white
              transition-all duration-350 ease-in-out
              focus:outline-none
              ${hasSubmitted && fieldErrors.confirmPassword
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
            className="w-full font-bold bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>

          {/* Display all field errors together at bottom */}
          {Object.values(fieldErrors).length > 0 && (
            <div className="mt-4 space-y-1">
              {Object.values(fieldErrors).map((errorMsg, idx) => (
                <p key={idx} className="text-red-500 text-sm text-center">
                  {errorMsg}
                </p>
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
            Already have an account?{' '}
            <a href="/login"
            className="text-blue-400 hover:text-blue-300 hover:underline transition"
            >Log in here
            </a>
        </p>
      </div>
    </div>
  );
}
