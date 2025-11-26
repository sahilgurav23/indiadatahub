'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import HomePage from './home';

const VALID_EMAIL = 'username@gmail.com';
const VALID_PASSWORD = 'Password123!';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*)';
    return '';
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setErrors({});

    // Check credentials
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  // Show loading state while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Home Page Component
  if (isLoggedIn) {
    return <HomePage onLogout={handleLogout} />;
  }

  // Login Page Component
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a1a4d] text-white">
        <div className="flex items-center justify-between px-6 py-3 gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="https://indiadatahub.com/static/svg/whitename.svg"
              alt="IndiaDataHub Logo"
              className="h-10 w-auto"
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center bg-white rounded text-sm">
              <svg className="w-5 h-5 text-gray-400 ml-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for data and analytics"
                className="flex-1 px-3 py-2 bg-white text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <button className="px-4 py-2 text-gray-400 hover:text-gray-600 transition font-medium">
                Search
              </button>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-6 flex-shrink-0 text-sm">
            <button className="hover:text-gray-300 transition">Database</button>
            <button className="hover:text-gray-300 transition">Calendar</button>
            <button className="hover:text-gray-300 transition">Help</button>
            <button className="hover:text-gray-300 transition">Login</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-sm">
          {/* Sign In Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2d1b4e] to-[#3d2563] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" width="30" height="30" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2M9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9zm9 14H6V10h12zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2"></path></svg>
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          </div>

          {/* Login Error */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {loginError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#2d1b4e] focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#2d1b4e] focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#1a1a3e] text-white py-2 rounded font-medium hover:bg-[#0f0f2e] transition mt-6"
            >
              Sign in
            </button>
          </form>

          {/* Footer Links */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">
              Forgot password?
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">
              Don't have an account? Sign up
            </a>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Email: username@gmail.com</p>
            <p>Password: Password123!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
