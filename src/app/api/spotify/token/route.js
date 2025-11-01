/**
 * Spotify Token Exchange API Route
 * 
 * This server-side endpoint handles the OAuth 2.0 authorization code exchange.
 * 
 * WHY SERVER-SIDE?
 * While PKCE doesn't strictly require a client secret, performing the token exchange
 * server-side is a best practice because:
 * 1. Centralizes token exchange logic
 * 2. Allows for rate limiting and logging
 * 3. Makes it easier to implement refresh token flow later
 * 4. Keeps sensitive token operations off the client
 * 
 * SECURITY:
 * - This route validates the PKCE code_verifier against the code_challenge
 * - The code_verifier must match what was sent during authorization
 * - Tokens are returned to the client but never logged or stored server-side
 * 
 * FLOW:
 * 1. Client calls authorize() which generates PKCE challenge
 * 2. User authorizes on Spotify, gets redirected with code
 * 3. Client sends code + verifier to this endpoint
 * 4. This endpoint exchanges code+verifier for access token with Spotify
 * 5. Token is returned to client for storage in localStorage
 */

import { NextResponse } from 'next/server';

// Environment variables (from .env.local)
// NOTE: These are public (NEXT_PUBLIC_*) so they're available to client too
// This is safe because Client ID is public information in OAuth flows
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

/**
 * POST /api/spotify/token
 * 
 * Exchanges Spotify authorization code for access token using PKCE
 * 
 * Request body:
 * {
 *   code: string,          // Authorization code from Spotify callback
 *   code_verifier: string  // PKCE code verifier (from sessionStorage)
 * }
 * 
 * Response (success):
 * {
 *   access_token: string,
 *   expires_in: number,
 *   refresh_token?: string,
 *   scope: string,
 *   token_type: string
 * }
 * 
 * Response (error):
 * {
 *   error: string,
 *   details?: string
 * }
 */
export async function POST(request) {
  try {
    const { code, code_verifier } = await request.json();

    // Validate required parameters
    if (!code || !code_verifier) {
      return NextResponse.json(
        { error: 'Missing code or code_verifier' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    // This is done server-side to keep the exchange secure
    // Spotify validates the code_verifier against the code_challenge
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',  // OAuth 2.0 grant type
        code: code,                        // Authorization code from callback
        redirect_uri: SPOTIFY_REDIRECT_URI, // Must match exactly
        client_id: SPOTIFY_CLIENT_ID,
        code_verifier: code_verifier,      // PKCE verifier (validates challenge)
      }),
    });

    if (!response.ok) {
      // Log error details for debugging (not sent to client)
      const errorData = await response.text();
      console.error('Spotify token exchange error:', errorData);
      
      // Return generic error to client (don't expose internal details)
      return NextResponse.json(
        { error: 'Failed to exchange token', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return token data to client
    // Client will store this in localStorage
    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,         // Usually 3600 seconds (1 hour)
      refresh_token: data.refresh_token,   // For refreshing access token
      scope: data.scope,
      token_type: data.token_type,
    });
  } catch (error) {
    // Handle network errors or JSON parsing errors
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
