/**
 * Spotify OAuth Callback Page
 * 
 * This page handles the redirect from Spotify after user authorization.
 * 
 * FLOW:
 * 1. User clicks "Connect Spotify" → redirected to Spotify
 * 2. User authorizes app on Spotify
 * 3. Spotify redirects to /callback?code=... (or ?error=...)
 * 4. This page extracts the code and exchanges it for a token
 * 5. User is redirected back to home page
 * 
 * WHY THIS PAGE EXISTS:
 * - Spotify requires a redirect URI after authorization
 * - We can't handle the callback in the same page that initiated auth
 *   (navigation would lose context)
 * - This dedicated page ensures clean OAuth flow handling
 * 
 * SECURITY:
 * - Authorization code is single-use and short-lived
 * - Code is immediately exchanged for token (not stored)
 * - Error handling prevents code leakage in URL
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import spotifyAPI from '@/lib/spotify';

export default function SpotifyCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Handle OAuth callback
     * 
     * This runs once when the page loads after Spotify redirect.
     * It checks for either:
     * - Error parameter (user denied access, etc.)
     * - Authorization code (success - exchange for token)
     */
    const handleCallback = async () => {
      // Check for error in URL (user denied, app error, etc.)
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setError(`Spotify authorization failed: ${errorParam}`);
        // Redirect back to home after showing error
        setTimeout(() => router.replace('/'), 3000);
        return;
      }

      // Try to get access token
      // getAccessToken() will:
      // 1. Check URL for authorization code
      // 2. Get code_verifier from sessionStorage
      // 3. Exchange code for token via API route
      // 4. Store token in localStorage
      try {
        await spotifyAPI.getAccessToken();
        // Success - redirect to home page
        router.replace('/');
      } catch (e) {
        console.error('Error during callback:', e);
        setError('Failed to connect to Spotify. Please try again.');
        // Redirect after error message
        setTimeout(() => router.replace('/'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  // Show error state if authorization failed
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

  // Show loading state while processing callback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to Spotify...</p>
      </div>
    </div>
  );
}
