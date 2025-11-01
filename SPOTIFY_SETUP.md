# 🎵 Spotify API Setup Guide

## Overview

This app uses **Spotify Web API** with **PKCE (Proof Key for Code Exchange)** authentication. Spotify deprecated the implicit grant flow, so PKCE is now the recommended and required method for OAuth authentication.

## ✅ What's Available

- 🔍 **Search millions of songs** from Spotify's catalog
- 🎧 **30-second previews** of most tracks
- 🖼️ **High-quality album artwork** and metadata
- 📱 **Direct links** to open songs in Spotify app
- 🎵 **Featured playlists** and new releases
- 📊 **Complete song information** (artist, album, duration, popularity)
- 👤 **User profile** and listening history (when connected)

## 🚀 Setup Instructions

### Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create App"**
3. Fill in:
   - **App name**: Serenity (or your choice)
   - **App description**: Music discovery platform
   - **Website**: Your website URL (or localhost for dev)
   - **Redirect URI**: `http://127.0.0.1:3000/callback`
     - ⚠️ **IMPORTANT**: Use `http://127.0.0.1:3000` not `http://localhost:3000`
     - For production, add your production URL: `https://yourdomain.com/callback`
4. Accept the terms and create the app

### Step 2: Configure Environment Variables

1. Copy your **Client ID** from the app dashboard
2. Open `.env.local` (create from `env.example` if needed)
3. Add these variables:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
```

**⚠️ Critical Notes:**
- The redirect URI must **match exactly** what you set in Spotify Dashboard
- Use `127.0.0.1` (not `localhost`) for local development
- Include the full URL: `http://127.0.0.1:3000/callback`
- For production, use `https://` and your domain

### Step 3: Restart Development Server

After updating `.env.local`, restart your server:

```bash
# Stop the server (Ctrl+C), then:
npm run dev
```

### Step 4: Test the Connection

1. Navigate to the **Search** or **Discover** page
2. Click **"Connect Spotify"**
3. You'll be redirected to Spotify to authorize
4. After authorization, you'll be redirected back
5. You should now be able to search and browse music!

## 🔧 How PKCE Works (Technical Details)

**PKCE (Proof Key for Code Exchange)** is an OAuth 2.0 security extension that makes authorization more secure for public clients like SPAs.

### The Flow:

1. **Code Verifier Generation** (Client-side)
   - App generates a random 256-bit code verifier
   - Converts it to base64url format

2. **Code Challenge Creation** (Client-side)
   - App hashes the verifier with SHA-256
   - Converts hash to base64url format
   - This is the "challenge"

3. **Authorization Request** (Client → Spotify)
   - User clicks "Connect Spotify"
   - App redirects to Spotify with `code_challenge` parameter
   - Code verifier is stored in sessionStorage

4. **User Authorization** (User → Spotify)
   - User authorizes the app on Spotify
   - Spotify stores the code challenge

5. **Callback with Code** (Spotify → App)
   - Spotify redirects to `/callback?code=...`
   - App receives authorization code

6. **Token Exchange** (App → Server → Spotify)
   - App sends code + verifier to server-side API route
   - Server exchanges code+verifier for access token
   - Spotify validates verifier matches challenge

7. **Token Storage** (Client)
   - Access token stored in localStorage
   - Token used for all subsequent API requests

### Why This is More Secure:

- **Prevents Authorization Code Interception**: Even if someone intercepts the authorization code, they can't use it without the original verifier
- **No Client Secret Needed**: PKCE works without exposing client secrets
- **Recommended Standard**: OAuth 2.1 requires PKCE for public clients

## 🎯 Using the Spotify Integration

### Search for Music

```javascript
import spotifyAPI from '@/lib/spotify';

// Search for tracks
const results = await spotifyAPI.searchTracks('Bohemian Rhapsody', 20);
```

### Get User Data

```javascript
// Get user profile
const profile = await spotifyAPI.getUserProfile();

// Get top tracks
const topTracks = await spotifyAPI.getTopTracks('medium_term', 20);

// Get recently played
const recent = await spotifyAPI.getRecentlyPlayed(20);
```

### Browse Discovery

```javascript
// Get featured playlists
const playlists = await spotifyAPI.getFeaturedPlaylists(12);

// Get new releases
const releases = await spotifyAPI.getNewReleases(12);
```

## 🔐 Token Management

### Automatic Token Handling

The `SpotifyAPI` class automatically:
- Stores tokens in localStorage
- Checks token expiration
- Exchanges authorization codes
- Handles token refresh (when implemented)

### Token Expiration

- Access tokens expire after **1 hour** (3600 seconds)
- When expired, user needs to re-authorize
- Future: Refresh token flow will automate this

### Manual Token Check

```javascript
const token = await spotifyAPI.getAccessToken();
if (!token) {
  // User needs to authorize
  await spotifyAPI.authorize();
}
```

## 🐛 Troubleshooting

### "unsupported_response_type" Error

**Problem**: This means you're using old implicit grant code.

**Solution**: Ensure you're using the latest codebase with PKCE implementation. The code should use `response_type=code`, not `response_type=token`.

### Redirect URI Mismatch

**Problem**: "redirect_uri_mismatch" error from Spotify.

**Solutions**:
1. Check redirect URI in `.env.local` matches Spotify Dashboard exactly
2. Ensure using `http://127.0.0.1:3000` (not `localhost`)
3. Include full path: `/callback` at the end
4. For production, add production URL to Spotify Dashboard

### Token Not Persisting

**Problem**: Have to re-authorize every time.

**Solutions**:
1. Check browser allows localStorage
2. Check for errors in browser console
3. Verify token is being saved (check localStorage in DevTools)
4. Clear localStorage and try again: `localStorage.clear()`

### "Failed to exchange token"

**Problem**: Authorization code exchange fails.

**Solutions**:
1. Check code_verifier is in sessionStorage (should be there during callback)
2. Verify API route is accessible: `/api/spotify/token`
3. Check server logs for detailed error
4. Ensure redirect URI matches exactly

### 401 Unauthorized Errors

**Problem**: API calls return 401.

**Solutions**:
1. Token likely expired (1 hour lifetime)
2. Re-authorize to get new token
3. Check token exists: `localStorage.getItem('spotify_access_token')`
4. Clear and re-authorize if needed

## 📚 API Reference

### Available Methods

- `authorize()` - Start OAuth flow
- `getAccessToken()` - Get current token (or exchange code)
- `searchTracks(query, limit)` - Search for songs
- `searchArtists(query, limit)` - Search for artists
- `searchAlbums(query, limit)` - Search for albums
- `getTrack(trackId)` - Get track details
- `getUserProfile()` - Get user profile
- `getTopTracks(timeRange, limit)` - Get user's top tracks
- `getRecentlyPlayed(limit)` - Get recently played tracks
- `getFeaturedPlaylists(limit)` - Get featured playlists
- `getNewReleases(limit)` - Get new album releases
- `playTrack(trackUri)` - Play track (requires Premium)

### Scopes Requested

The app requests these permissions:
- `user-read-private` - Read user profile
- `user-read-email` - Read user email
- `user-top-read` - Read user's top tracks
- `user-read-recently-played` - Read listening history
- `playlist-read-private` - Read private playlists
- `playlist-read-collaborative` - Read collaborative playlists
- `user-library-read` - Read saved tracks/albums
- `user-read-playback-state` - Read playback state
- `user-modify-playback-state` - Control playback (Premium)
- `user-read-currently-playing` - Read current track

## 🆓 Free Tier Benefits

- No subscription required
- Access to millions of songs
- 30-second previews
- Complete metadata
- High-quality artwork

**Note**: Full playback requires Spotify Premium account and active device.

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - It contains your credentials
2. **Use environment variables** - Never hardcode client IDs
3. **Match redirect URIs exactly** - Small differences cause failures
4. **Store tokens securely** - localStorage is fine for this use case
5. **Handle token expiration** - Always check token validity

## 📖 Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [PKCE Specification (RFC 7636)](https://oauth.net/2/pkce/)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization/)
- [OAuth 2.0 Best Practices](https://oauth.net/2/)

---

**Questions?** Check the main [README.md](./README.md) or open an issue on GitHub.
