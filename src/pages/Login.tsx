import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { instance } = useMsal();

  // For demo: hardcode admin email
  const adminEmail = 'admin@leave.com';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, check credentials with backend
    const role = email === adminEmail ? 'admin' : 'user';
    dispatch(login({
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role,
      token: 'demo-token',
    }));
    navigate('/dashboard');
  };

  const handleMicrosoftLogin = async () => {
    try {
      window.location.href = 'https://severely-ace-wolf.ngrok-free.app/api/oauth2/authorization/microsoft';
    } catch (error) {
      // Handle error (show notification, etc.)
      console.error('Microsoft login failed', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Leave Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
          />
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in
          </button>
        </form>
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" fill="#F3F3F3"/>
              <rect x="3" y="3" width="8" height="8" fill="#F35325"/>
              <rect x="13" y="3" width="8" height="8" fill="#81BC06"/>
              <rect x="3" y="13" width="8" height="8" fill="#05A6F0"/>
              <rect x="13" y="13" width="8" height="8" fill="#FFBA08"/>
            </svg>
            Sign in with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}
