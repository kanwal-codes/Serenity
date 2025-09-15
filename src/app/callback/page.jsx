"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SpotifyCallback() {
  const router = useRouter();

  useEffect(() => {
    // The access token will be in the URL hash
    // The SpotifyAPI class will handle extracting it
    // Redirect back to the main app
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to Spotify...</p>
      </div>
    </div>
  );
}
