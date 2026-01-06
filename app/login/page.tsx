'use client';

import { login, signup } from './actions';
import { useState } from 'react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        
        {/* Toggle Switch */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'login' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {mode === 'login' ? 'Enter your details to access your dashboard.' : 'Start tracking your website in seconds.'}
          </p>
        </div>

        <form className="space-y-4">
          
          {/* USERNAME FIELD (Only shows for Sign Up) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="username"
                placeholder="e.g. Zayar"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          <button
            formAction={mode === 'login' ? login : signup}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            {mode === 'login' ? 'Sign In' : 'Get Started'}
          </button>

          {/* Optional: Add message display if URL has ?message=... */}
        </form>
      </div>
    </div>
  );
}