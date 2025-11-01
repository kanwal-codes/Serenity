"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import spotifyAPI from '@/lib/spotify';

export default function SpotifyCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error in URL
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setError(`Spotify authorization failed: ${errorParam}`);
        setTimeout(() => router.replace('/'), 3000);
        return;
      }

      // Try to get access token (this will exchange the code if present)
      try {
        await spotifyAPI.getAccessToken();
        router.replace('/');
      } catch (e) {
        console.error('Error during callback:', e);
        setError('Failed to connect to Spotify. Please try again.');
        setTimeout(() => router.replace('/'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-gray-500 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to Spotify...</p>
      </div>
    </div>
  );
}
