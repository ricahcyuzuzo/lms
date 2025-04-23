import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';
import { authApi } from '../services/api';
import { useSnackbar } from 'notistack';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { enqueueSnackbar } = useSnackbar();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      
      // Store the token
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        names: response.names,
        role: response.role,
        phone: response.phone,
        departmentId: response.departmentId,
        departmentName: response.departmentName,
        status: response.status,
        lastLogin: response.lastLogin,
        createdAt: response.createdAt,
      }));

      enqueueSnackbar('Login successful', { variant: 'success' });
      navigate('/dashboard');
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Login failed. Please check your credentials.',
        { variant: 'error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      // Use MSAL to login
      const loginResponse = await instance.loginPopup(loginRequest);
      const accessToken = loginResponse.accessToken;

      // Fetch user profile from Microsoft Graph
      const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await profileResponse.json();

      // Fetch user profile photo (as blob)
      const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      let photoUrl = undefined;
      if (photoResponse.ok) {
        const photoBlob = await photoResponse.blob();
        photoUrl = URL.createObjectURL(photoBlob);
      }

      // Store user info in localStorage
      const userToStore = {
        id: profile.id,
        names: profile.displayName,
        email: profile.mail || profile.userPrincipalName,
        role: 'USER', // Default role, adjust if needed
        avatar: photoUrl || (profile.givenName ? profile.givenName.charAt(0).toUpperCase() : profile.displayName.charAt(0).toUpperCase()),
        // Add more fields as needed
      };
      localStorage.setItem('user', JSON.stringify(userToStore));
      localStorage.setItem('token', accessToken);

      // Log user profile and photo URL
      console.log('Microsoft User Profile:', profile);
      if (photoUrl) {
        console.log('Profile Photo URL:', photoUrl);
      } else {
        console.log('No profile photo found. Dummy avatar:', userToStore.avatar);
      }
      enqueueSnackbar('Microsoft login successful', { variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Microsoft login failed', error);
      enqueueSnackbar('Microsoft login failed', { variant: 'error' });
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
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
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
