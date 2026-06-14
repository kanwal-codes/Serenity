/**
 * Spotify Web API Integration
 * 
 * IMPORTANT: This implementation uses PKCE (Proof Key for Code Exchange) authentication.
 * Spotify deprecated the implicit grant flow (response_type=token) in favor of PKCE
 * for better security, especially for single-page applications.
 * 
 * Flow:
 * 1. Generate PKCE code verifier and challenge (client-side)
 * 2. Redirect user to Spotify with code challenge
 * 3. User authorizes, Spotify redirects with authorization code
 * 4. Exchange authorization code for access token (server-side via API route)
 * 5. Store token in localStorage with expiration
 * 
 * Why PKCE?
 * - More secure than implicit grant (prevents authorization code interception)
 * - Recommended by OAuth 2.1 specification
 * - Works well for public clients (SPAs) without client secrets
 */

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || 'your-client-id';
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback';

// Spotify Web API base URL
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Generate a random code verifier for PKCE
 * 
 * The verifier is a cryptographically random string that will be used
 * to generate the code challenge. It must be:
 * - 43-128 characters long
 * - URL-safe (base64url encoded)
 * 
 * We use sessionStorage to store this between the authorization request
 * and the callback, then discard it after token exchange.
 * 
 * @returns {string} Base64URL-encoded random string
 */
function generateCodeVerifier() {
  const array = new Uint8Array(32); // 256 bits = 32 bytes
  crypto.getRandomValues(array); // Cryptographically secure random
  
  // Convert to base64 and make URL-safe (RFC 4648 §5)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')  // Replace + with -
    .replace(/\//g, '_')  // Replace / with _
    .replace(/=/g, '');    // Remove padding
}

/**
 * Generate code challenge from code verifier using SHA-256
 * 
 * The challenge is the SHA-256 hash of the verifier, base64url encoded.
 * Spotify will verify this when we exchange the authorization code.
 * This ensures the code exchange is secure even if the authorization code
 * is intercepted (an attacker would need the original verifier).
 * 
 * @param {string} verifier - The code verifier string
 * @returns {Promise<string>} Base64URL-encoded SHA-256 hash
 */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  // Convert ArrayBuffer to base64url
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Spotify API Client
 * 
 * Handles all interactions with Spotify Web API including:
 * - PKCE authentication flow
 * - Token management (storage, expiration, refresh)
 * - API requests with automatic token injection
 * - Search, discovery, and playback operations
 */
class SpotifyAPI {
  constructor() {
    // In-memory cache for access token (avoids repeated localStorage reads)
    this.accessToken = null;
  }

  /**
   * Exchange authorization code for access token
   * 
   * This calls our server-side API route which performs the actual token exchange.
   * Why server-side? While PKCE doesn't strictly require it, this approach:
   * - Keeps token exchange logic centralized
   * - Allows for future refresh token handling
   * - Follows OAuth 2.0 best practices
   * - Makes it easier to add rate limiting or logging
   * 
   * @param {string} code - Authorization code from Spotify callback
   * @param {string} codeVerifier - The PKCE code verifier (from sessionStorage)
   * @returns {Promise<string>} Access token
   */
  async exchangeCodeForToken(code, codeVerifier) {
    try {
      const response = await fetch('/api/spotify/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to exchange code for token');
      }

      const data = await response.json();
      
      // Store token and expiration in memory and localStorage
      this.accessToken = data.access_token;
      localStorage.setItem('spotify_access_token', data.access_token);
      
      // Calculate expiration timestamp (Spotify tokens expire in 3600 seconds)
      if (data.expires_in) {
        const expiresAt = Date.now() + parseInt(data.expires_in, 10) * 1000;
        localStorage.setItem('spotify_expires_at', String(expiresAt));
      }

      // Store refresh token for future token refresh (not yet implemented)
      // Refresh tokens allow getting new access tokens without re-authorization
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
      }

      return data.access_token;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  /**
   * Refresh an expired access token using the stored refresh token
   */
  async refreshAccessToken() {
    if (typeof window === 'undefined') return null;

    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch('/api/spotify/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        localStorage.removeItem('spotify_refresh_token');
        return null;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      localStorage.setItem('spotify_access_token', data.access_token);

      if (data.expires_in) {
        const expiresAt = Date.now() + parseInt(data.expires_in, 10) * 1000;
        localStorage.setItem('spotify_expires_at', String(expiresAt));
      }

      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
      }

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Get access token from various sources
   * 
   * This method is async because it may need to exchange an authorization code
   * on first load (when user is redirected back from Spotify).
   * 
   * Priority order:
   * 1. In-memory cache (fastest)
   * 2. Authorization code in URL (from OAuth callback) - exchange for token
   * 3. Valid token in localStorage
   * 
   * @returns {Promise<string|null>} Access token or null if not available
   */
  async getAccessToken() {
    // Return cached token if available
    if (this.accessToken) return this.accessToken;

    // Check if we're in browser (SSR check)
    if (typeof window !== 'undefined') {
      // Check URL for authorization code (OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('Spotify authorization error:', error);
        // Clean URL to remove error parameter
        window.history.replaceState(null, '', window.location.pathname);
        return null;
      }

      // If we have an authorization code, exchange it for a token
      if (code) {
        // Get the code verifier we stored during authorization
        const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
        if (codeVerifier) {
          // Clean URL immediately to prevent re-processing on refresh
          window.history.replaceState(null, '', window.location.pathname);
          
          // Exchange code for token
          try {
            const token = await this.exchangeCodeForToken(code, codeVerifier);
            // Remove verifier after successful exchange (one-time use)
            sessionStorage.removeItem('spotify_code_verifier');
            return token;
          } catch (error) {
            console.error('Failed to exchange code:', error);
            return null;
          }
        }
      }
    }

    // Check localStorage for existing valid token
    const storedToken = localStorage.getItem('spotify_access_token');
    const expiresAt = parseInt(localStorage.getItem('spotify_expires_at') || '0', 10);
    if (storedToken) {
      // Verify token hasn't expired (with 60 second buffer)
      if (!expiresAt || Date.now() < (expiresAt - 60000)) {
        this.accessToken = storedToken;
        return storedToken;
      }
      // Token expired — try refresh before forcing re-login
      this.accessToken = null;
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_expires_at');

      const refreshed = await this.refreshAccessToken();
      if (refreshed) return refreshed;
    }

    // Access token missing but refresh token may still be valid
    if (typeof window !== 'undefined' && localStorage.getItem('spotify_refresh_token')) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) return refreshed;
    }

    return null;
  }

  /**
   * Initiate Spotify OAuth authorization flow with PKCE
   * 
   * This redirects the user to Spotify's authorization page.
   * After authorization, Spotify redirects back to our callback URL
   * with an authorization code.
   * 
   * Scopes requested:
   * - User profile and email access
   * - Top tracks and recently played
   * - Playlist access (private and collaborative)
   * - Playback control (requires Premium for actual playback)
   * 
   * @returns {Promise<void>}
   */
  async authorize() {
    // Guard: prevent errors when environment variables aren't configured
    const clientIdMissing = !SPOTIFY_CLIENT_ID || SPOTIFY_CLIENT_ID === 'your-client-id';
    const redirectMissing = !SPOTIFY_REDIRECT_URI;
    if (clientIdMissing || redirectMissing) {
      const message = 'Spotify is not configured. Set NEXT_PUBLIC_SPOTIFY_CLIENT_ID and NEXT_PUBLIC_SPOTIFY_REDIRECT_URI, then restart the dev server.';
      console.warn(message);
      if (typeof window !== 'undefined') {
        alert(message);
      }
      return;
    }

    // SSR guard - can't redirect in server-side rendering
    if (typeof window === 'undefined') {
      console.warn('authorize() must be called in the browser');
      return;
    }

    // Requested permissions (scopes)
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'user-library-modify',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing'
    ].join(' ');

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store verifier in sessionStorage - needed later when exchanging code
    // Using sessionStorage (not localStorage) because:
    // - More secure (cleared when tab closes)
    // - Only needed during OAuth flow
    // - Prevents accidental reuse across sessions
    sessionStorage.setItem('spotify_code_verifier', codeVerifier);

    // Build authorization URL with PKCE parameters
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${SPOTIFY_CLIENT_ID}&` +
      `response_type=code&` +  // Authorization Code flow (not token/implicit)
      `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;  // SHA-256 hashing

    // Redirect to Spotify (this will navigate away from the page)
    window.location.href = authUrl;
  }

  /**
   * Make authenticated request to Spotify API
   * 
   * Automatically injects the access token into the Authorization header.
   * Handles token expiration (returns 401) by clearing invalid tokens.
   * 
   * @param {string} endpoint - API endpoint (e.g., '/search?q=...')
   * @param {object} options - Fetch options (method, body, headers, etc.)
   * @returns {Promise<object>} JSON response from API
   */
  async makeRequest(endpoint, options = {}) {
    const { allowStatuses = [], ...fetchOptions } = options;
    const token = await this.getAccessToken(); // Async because token might need exchange
    if (!token) {
      throw new Error('No access token available. Please authorize first.');
    }

    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      if (allowStatuses.includes(response.status)) {
        return null;
      }
      if (response.status === 401) {
        // Token expired or invalid, clear it and prompt re-authorization
        this.accessToken = null;
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_expires_at');
        throw new Error('Token expired. Please re-authorize.');
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }

    // Spotify returns 204 No Content for play/pause/seek/device transfer
    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    if (!text) {
      return null;
    }

    return JSON.parse(text);
  }

  /**
   * Search for tracks
   * 
   * @param {string} query - Search query (song name, artist, etc.)
   * @param {number} limit - Maximum number of results (default: 20)
   * @returns {Promise<Array>} Array of track objects with enhanced metadata
   */
  async searchTracks(query, limit = 20) {
    try {
      const response = await this.makeRequest(
        `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=US`
      );
      
      // Transform Spotify API response to our simplified format
      return response.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        artists: track.artists.map(artist => artist.name),
        album: track.album.name,
        album_type: track.album.album_type,
        preview_url: track.preview_url, // 30-second preview (if available)
        external_urls: track.external_urls,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        images: track.album.images,
        uri: track.uri,
        explicit: track.explicit,
        release_date: track.album.release_date,
        available_markets: track.available_markets,
        // Add formatted duration for display
        duration_formatted: this.formatDuration(track.duration_ms),
        // Preview availability flag
        has_preview: !!track.preview_url
      }));
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  }

  /**
   * Get track details by ID
   * 
   * @param {string} trackId - Spotify track ID
   * @returns {Promise<object|null>} Track object or null if error
   */
  async getTrack(trackId) {
    try {
      const track = await this.makeRequest(`/tracks/${trackId}`);
      return {
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album.name,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        images: track.album.images,
        uri: track.uri
      };
    } catch (error) {
      console.error('Error getting track:', error);
      return null;
    }
  }

  /**
   * Get user's top tracks
   * 
   * @param {string} timeRange - 'short_term', 'medium_term', or 'long_term'
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of track objects
   */
  async getTopTracks(timeRange = 'medium_term', limit = 20) {
    try {
      const response = await this.makeRequest(
        `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
      );
      
      return response.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album.name,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        images: track.album.images,
        uri: track.uri
      }));
    } catch (error) {
      console.error('Error getting top tracks:', error);
      return [];
    }
  }

  /**
   * Get user's top artists
   *
   * @param {string} timeRange - 'short_term', 'medium_term', or 'long_term'
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of artist objects
   */
  async getTopArtists(timeRange = 'medium_term', limit = 20) {
    try {
      const response = await this.makeRequest(
        `/me/top/artists?time_range=${timeRange}&limit=${limit}`
      );

      return response.items.map((artist) => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres || [],
        images: artist.images,
        external_urls: artist.external_urls,
        popularity: artist.popularity,
      }));
    } catch (error) {
      console.error('Error getting top artists:', error);
      return [];
    }
  }

  /**
   * Get track recommendations based on seed artists and/or tracks
   */
  async getRecommendations({
    seedArtists = [],
    seedTracks = [],
    seedGenres = [],
    limit = 12,
  } = {}) {
    const mapTracks = (response) =>
      (response?.tracks || []).map((track) => ({
        id: track.id,
        name: track.name,
        artist: track.artists?.map((a) => a.name).join(', ') || 'Unknown Artist',
        album: track.album?.name || '',
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        images: track.album?.images || [],
        uri: track.uri,
      }));

    const attempts = [
      {
        artists: seedArtists.filter(Boolean).slice(0, 2),
        tracks: seedTracks.filter(Boolean).slice(0, 3),
        genres: [],
      },
      {
        artists: seedArtists.filter(Boolean).slice(0, 3),
        tracks: [],
        genres: [],
      },
      {
        artists: [],
        tracks: seedTracks.filter(Boolean).slice(0, 5),
        genres: [],
      },
      {
        artists: [],
        tracks: [],
        genres: seedGenres.filter(Boolean).slice(0, 2),
      },
    ];

    try {
      for (const attempt of attempts) {
        const seedCount =
          attempt.artists.length + attempt.tracks.length + attempt.genres.length;
        if (seedCount === 0 || seedCount > 5) continue;

        const params = new URLSearchParams({
          limit: String(limit),
          market: 'from_token',
        });
        if (attempt.artists.length) {
          params.set('seed_artists', attempt.artists.join(','));
        }
        if (attempt.tracks.length) {
          params.set('seed_tracks', attempt.tracks.join(','));
        }
        if (attempt.genres.length) {
          params.set('seed_genres', attempt.genres.join(','));
        }

        const response = await this.makeRequest(
          `/recommendations?${params.toString()}`,
          { allowStatuses: [404] }
        );
        if (response?.tracks?.length) {
          return mapTracks(response);
        }
      }

      return [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Get recently played tracks
   * 
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of track objects with played_at timestamp
   */
  async getRecentlyPlayed(limit = 20) {
    try {
      const response = await this.makeRequest(
        `/me/player/recently-played?limit=${limit}`
      );
      
      return response.items.map(item => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0]?.name || 'Unknown Artist',
        album: item.track.album.name,
        preview_url: item.track.preview_url,
        external_urls: item.track.external_urls,
        duration_ms: item.track.duration_ms,
        popularity: item.track.popularity,
        images: item.track.album.images,
        uri: item.track.uri,
        played_at: item.played_at
      }));
    } catch (error) {
      console.error('Error getting recently played:', error);
      return [];
    }
  }

  /**
   * List user's Spotify Connect devices
   */
  async getDevices() {
    try {
      const data = await this.makeRequest('/me/player/devices');
      return data.devices || [];
    } catch (error) {
      console.error('Error getting devices:', error);
      return [];
    }
  }

  /**
   * Activate a Spotify Connect device so playback commands work
   */
  async ensureActiveDevice() {
    const devices = await this.getDevices();
    if (devices.length === 0) return null;

    const active = devices.find((d) => d.is_active);
    if (active) return active.id;

    const preferred =
      devices.find((d) => d.type === 'Computer') ||
      devices.find((d) => d.type === 'Smartphone') ||
      devices[0];

    await this.makeRequest('/me/player', {
      method: 'PUT',
      body: JSON.stringify({
        device_ids: [preferred.id],
        play: false,
      }),
    });

    return preferred.id;
  }

  /**
   * Get full playback state including progress
   */
  async getPlayerState() {
    try {
      const token = await this.getAccessToken();
      if (!token) return null;

      const response = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 204 || !response.ok) return null;

      const data = await response.json();
      if (!data?.item) return null;

      const track = data.item;
      return {
        is_playing: data.is_playing,
        progress_ms: data.progress_ms,
        id: track.id,
        name: track.name,
        artist: track.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
        album: track.album?.name || "",
        duration_ms: track.duration_ms,
        uri: track.uri,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        images: track.album?.images || [],
        device: data.device?.name,
      };
    } catch (error) {
      console.error('Error getting player state:', error);
      return null;
    }
  }

  /**
   * Play track on user's active Spotify device
   *
   * Requires Spotify Premium and an available Connect device.
   * @param {string} trackUri
   * @param {number} [positionMs] - Start position in milliseconds (for resume)
   */
  async playTrack(trackUri, positionMs) {
    try {
      const deviceId = await this.ensureActiveDevice();
      const endpoint = deviceId
        ? `/me/player/play?device_id=${encodeURIComponent(deviceId)}`
        : '/me/player/play';

      const body = { uris: [trackUri] };
      if (positionMs != null && positionMs > 0) {
        body.position_ms = Math.floor(positionMs);
      }

      await this.makeRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      return false;
    }
  }

  /**
   * Pause Spotify playback
   */
  async pausePlayback() {
    try {
      await this.makeRequest('/me/player/pause', { method: 'PUT' });
      return true;
    } catch (error) {
      console.error('Error pausing playback:', error);
      return false;
    }
  }

  /**
   * Resume Spotify playback on the active device
   */
  async resumePlayback() {
    try {
      await this.makeRequest('/me/player/play', { method: 'PUT' });
      return true;
    } catch (error) {
      console.error('Error resuming playback:', error);
      return false;
    }
  }

  /**
   * Seek to position in the currently playing track
   */
  async seekPlayback(positionMs) {
    try {
      await this.makeRequest(
        `/me/player/seek?position_ms=${Math.floor(positionMs)}`,
        { method: 'PUT' }
      );
      return true;
    } catch (error) {
      console.error('Error seeking playback:', error);
      return false;
    }
  }

  /**
   * Set playback volume on the active Spotify Connect device (0–100)
   */
  async setDeviceVolume(volumePercent) {
    try {
      const v = Math.max(0, Math.min(100, Math.round(volumePercent)));
      await this.makeRequest(
        `/me/player/volume?volume_percent=${v}`,
        { method: 'PUT' }
      );
      return true;
    } catch (error) {
      console.error('Error setting device volume:', error);
      return false;
    }
  }

  /**
   * Skip to next track on the active device
   */
  async skipToNext() {
    try {
      await this.makeRequest('/me/player/next', { method: 'POST' });
      return true;
    } catch (error) {
      console.error('Error skipping to next:', error);
      return false;
    }
  }

  /**
   * Skip to previous track on the active device
   */
  async skipToPrevious() {
    try {
      await this.makeRequest('/me/player/previous', { method: 'POST' });
      return true;
    } catch (error) {
      console.error('Error skipping to previous:', error);
      return false;
    }
  }

  /**
   * Check whether tracks are saved in the user's library
   */
  async checkSavedTracks(trackIds) {
    try {
      const ids = trackIds.filter(Boolean).join(',');
      if (!ids) return [];
      const result = await this.makeRequest(`/me/tracks/contains?ids=${ids}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error checking saved tracks:', error);
      return trackIds.map(() => false);
    }
  }

  /**
   * Save a track to the user's Liked Songs
   */
  async saveTrack(trackId) {
    try {
      await this.makeRequest(`/me/tracks?ids=${trackId}`, { method: 'PUT' });
      return true;
    } catch (error) {
      console.error('Error saving track:', error);
      return false;
    }
  }

  /**
   * Remove a track from the user's Liked Songs
   */
  async removeSavedTrack(trackId) {
    try {
      await this.makeRequest(`/me/tracks?ids=${trackId}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('Error removing saved track:', error);
      return false;
    }
  }

  /**
   * Get current user's Spotify profile
   * 
   * @returns {Promise<object|null>} User profile object or null if error
   */
  async getUserProfile() {
    try {
      return await this.makeRequest('/me');
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Clear stored Spotify session (disconnect)
   */
  clearSession() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_expires_at');
      localStorage.removeItem('spotify_refresh_token');
      sessionStorage.removeItem('spotify_code_verifier');
    }
  }

  /**
   * Get current user's playlists
   *
   * @param {number} limit - Maximum number of playlists
   * @returns {Promise<Array>} Array of playlist objects
   */
  async getUserPlaylists(limit = 20) {
    try {
      const response = await this.makeRequest(`/me/playlists?limit=${limit}`);

      return response.items.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        images: playlist.images,
        external_urls: playlist.external_urls,
        tracks: playlist.tracks,
        owner: playlist.owner,
      }));
    } catch (error) {
      console.error('Error getting user playlists:', error);
      return [];
    }
  }

  /**
   * Get currently playing track from Spotify
   *
   * @returns {Promise<object|null>} Currently playing item or null
   */
  async getCurrentlyPlaying() {
    try {
      const token = await this.getAccessToken();
      if (!token) return null;

      const response = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204 || !response.ok) {
        return null;
      }

      const data = await response.json();
      if (!data?.item) return null;

      const track = data.item;
      return {
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album.name,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        duration_ms: track.duration_ms,
        images: track.album.images,
        uri: track.uri,
        duration_formatted: this.formatDuration(track.duration_ms),
        is_playing: data.is_playing,
      };
    } catch (error) {
      console.error('Error getting currently playing:', error);
      return null;
    }
  }

  /**
   * Format duration from milliseconds to MM:SS
   * 
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration string
   */
  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Normalize a Spotify API track object to app format
   */
  normalizeTrack(track) {
    if (!track?.id) return null;

    return {
      id: track.id,
      name: track.name,
      artist: track.artists?.map((a) => a.name).join(', ') || 'Unknown Artist',
      artists: track.artists?.map((a) => a.name) || [],
      album: track.album?.name || '',
      preview_url: track.preview_url,
      external_urls: track.external_urls,
      duration_ms: track.duration_ms,
      popularity: track.popularity,
      images: track.album?.images || [],
      uri: track.uri,
      explicit: track.explicit,
      duration_formatted: this.formatDuration(track.duration_ms),
      has_preview: !!track.preview_url,
    };
  }

  /**
   * Get a single playlist by ID
   */
  async getPlaylist(playlistId) {
    try {
      const playlist = await this.makeRequest(`/playlists/${playlistId}?market=US`);
      return {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        images: playlist.images,
        external_urls: playlist.external_urls,
        owner: playlist.owner,
        tracks: playlist.tracks,
      };
    } catch (error) {
      console.error('Error getting playlist:', error);
      return null;
    }
  }

  /**
   * Get tracks in a playlist (paginated)
   */
  async getPlaylistTracks(playlistId, limit = 50, offset = 0) {
    try {
      const response = await this.makeRequest(
        `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&market=US`
      );

      const items = response.items
        .map((item) => this.normalizeTrack(item.track))
        .filter(Boolean);

      return {
        items,
        total: response.total,
        hasMore: !!response.next,
      };
    } catch (error) {
      console.error('Error getting playlist tracks:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get all tracks in a playlist (auto-paginate up to maxTracks)
   */
  async getAllPlaylistTracks(playlistId, maxTracks = 200) {
    const allItems = [];
    let offset = 0;
    const pageSize = 50;

    while (allItems.length < maxTracks) {
      const { items, hasMore } = await this.getPlaylistTracks(playlistId, pageSize, offset);
      allItems.push(...items);
      if (!hasMore || items.length === 0) break;
      offset += pageSize;
    }

    return allItems.slice(0, maxTracks);
  }

  /**
   * Get user's saved (liked) tracks
   */
  async getSavedTracks(limit = 50, offset = 0) {
    try {
      const response = await this.makeRequest(
        `/me/tracks?limit=${limit}&offset=${offset}&market=US`
      );

      const items = response.items
        .map((item) => this.normalizeTrack(item.track))
        .filter(Boolean);

      return {
        items,
        total: response.total,
        hasMore: !!response.next,
      };
    } catch (error) {
      console.error('Error getting saved tracks:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get all saved tracks (auto-paginate)
   */
  async getAllSavedTracks(maxTracks = 200) {
    const allItems = [];
    let offset = 0;
    const pageSize = 50;

    while (allItems.length < maxTracks) {
      const { items, hasMore } = await this.getSavedTracks(pageSize, offset);
      allItems.push(...items);
      if (!hasMore || items.length === 0) break;
      offset += pageSize;
    }

    return allItems.slice(0, maxTracks);
  }

  /**
   * Get featured playlists (for discovery page)
   * 
   * @param {number} limit - Maximum number of playlists
   * @returns {Promise<Array>} Array of playlist objects
   */
  async getFeaturedPlaylists(limit = 20) {
    try {
      const response = await this.makeRequest(
        `/browse/featured-playlists?limit=${limit}`
      );
      
      return response.playlists.items.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        images: playlist.images,
        external_urls: playlist.external_urls,
        tracks: playlist.tracks,
        owner: playlist.owner
      }));
    } catch (error) {
      console.error('Error getting featured playlists:', error);
      return [];
    }
  }

  /**
   * Get new album releases
   * 
   * @param {number} limit - Maximum number of releases
   * @returns {Promise<Array>} Array of album objects
   */
  async getNewReleases(limit = 20) {
    try {
      const response = await this.makeRequest(
        `/browse/new-releases?limit=${limit}`
      );
      
      return response.albums.items.map(album => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map(artist => artist.name),
        album_type: album.album_type,
        images: album.images,
        external_urls: album.external_urls,
        release_date: album.release_date,
        total_tracks: album.total_tracks
      }));
    } catch (error) {
      console.error('Error getting new releases:', error);
      return [];
    }
  }

  /**
   * Search for artists
   * 
   * @param {string} query - Artist name
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of artist objects
   */
  async searchArtists(query, limit = 20) {
    try {
      const response = await this.makeRequest(
        `/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`
      );
      
      return response.artists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        images: artist.images,
        external_urls: artist.external_urls,
        followers: artist.followers.total,
        popularity: artist.popularity,
        uri: artist.uri,
      }));
    } catch (error) {
      console.error('Error searching artists:', error);
      return [];
    }
  }

  /**
   * Get a single artist by ID
   */
  async getArtist(artistId) {
    try {
      const artist = await this.makeRequest(`/artists/${artistId}`);
      return {
        id: artist.id,
        name: artist.name,
        genres: artist.genres || [],
        images: artist.images,
        external_urls: artist.external_urls,
        followers: artist.followers?.total ?? 0,
        popularity: artist.popularity,
        uri: artist.uri,
      };
    } catch (error) {
      console.error('Error getting artist:', error);
      return null;
    }
  }

  /**
   * Get an artist's top tracks
   */
  async getArtistTopTracks(artistId, limit = 10) {
    try {
      const response = await this.makeRequest(
        `/artists/${artistId}/top-tracks?market=from_token`
      );
      return (response.tracks || [])
        .slice(0, limit)
        .map((track) => this.normalizeTrack(track))
        .filter(Boolean);
    } catch (error) {
      console.error('Error getting artist top tracks:', error);
      return [];
    }
  }

  /**
   * Get an artist's albums and singles
   */
  async getArtistAlbums(artistId, limit = 20) {
    try {
      const response = await this.makeRequest(
        `/artists/${artistId}/albums?include_groups=album,single&limit=${limit}&market=from_token`
      );
      return (response.items || []).map((album) => ({
        id: album.id,
        name: album.name,
        album_type: album.album_type,
        images: album.images,
        release_date: album.release_date,
        total_tracks: album.total_tracks,
        external_urls: album.external_urls,
      }));
    } catch (error) {
      console.error('Error getting artist albums:', error);
      return [];
    }
  }

  /**
   * Get a single album by ID
   */
  async getAlbum(albumId) {
    try {
      const album = await this.makeRequest(
        `/albums/${albumId}?market=from_token`
      );
      return {
        id: album.id,
        name: album.name,
        artists: (album.artists || []).map((artist) => ({
          id: artist.id,
          name: artist.name,
        })),
        artist_names: (album.artists || []).map((artist) => artist.name).join(", "),
        album_type: album.album_type,
        images: album.images,
        release_date: album.release_date,
        total_tracks: album.total_tracks,
        external_urls: album.external_urls,
        label: album.label,
      };
    } catch (error) {
      console.error("Error getting album:", error);
      return null;
    }
  }

  /**
   * Get tracks on an album (paginated)
   */
  async getAlbumTracks(albumId, limit = 50, offset = 0, albumMeta = null) {
    try {
      const response = await this.makeRequest(
        `/albums/${albumId}/tracks?limit=${limit}&offset=${offset}&market=from_token`
      );

      const albumContext = albumMeta
        ? { name: albumMeta.name, images: albumMeta.images }
        : { name: "", images: [] };

      const items = (response.items || [])
        .map((track) =>
          this.normalizeTrack({
            ...track,
            album: albumContext,
          })
        )
        .filter(Boolean);

      return {
        items,
        total: response.total,
        hasMore: !!response.next,
      };
    } catch (error) {
      console.error("Error getting album tracks:", error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get all tracks on an album (auto-paginate)
   */
  async getAllAlbumTracks(albumId, maxTracks = 200) {
    const album = await this.getAlbum(albumId);
    if (!album) {
      return { album: null, tracks: [] };
    }

    const allItems = [];
    let offset = 0;
    const pageSize = 50;

    while (allItems.length < maxTracks) {
      const { items, hasMore } = await this.getAlbumTracks(
        albumId,
        pageSize,
        offset,
        album
      );
      allItems.push(...items);
      if (!hasMore || items.length === 0) break;
      offset += pageSize;
    }

    return {
      album,
      tracks: allItems.slice(0, maxTracks),
    };
  }

  /**
   * Search for albums
   * 
   * @param {string} query - Album name
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of album objects
   */
  async searchAlbums(query, limit = 20) {
    try {
      const response = await this.makeRequest(
        `/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}`
      );
      
      return response.albums.items.map(album => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map(artist => artist.name),
        album_type: album.album_type,
        images: album.images,
        external_urls: album.external_urls,
        release_date: album.release_date,
        total_tracks: album.total_tracks
      }));
    } catch (error) {
      console.error('Error searching albums:', error);
      return [];
    }
  }
}

// Create and export singleton instance
// Using singleton pattern ensures we maintain token state across components
const spotifyAPI = new SpotifyAPI();

export default spotifyAPI;
export { SpotifyAPI };
