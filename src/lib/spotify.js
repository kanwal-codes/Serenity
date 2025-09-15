// Spotify Web API integration
// You'll need to get these from https://developer.spotify.com/dashboard

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || 'your-client-id';
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback';

// Spotify Web API endpoints
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

class SpotifyAPI {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Get access token from URL hash or localStorage
  getAccessToken() {
    if (this.accessToken) return this.accessToken;

    // Check URL hash for access token
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    
    if (token) {
      this.accessToken = token;
      localStorage.setItem('spotify_access_token', token);
      return token;
    }

    // Check localStorage
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
      this.accessToken = storedToken;
      return storedToken;
    }

    return null;
  }

  // Redirect to Spotify authorization
  authorize() {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing'
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${SPOTIFY_CLIENT_ID}&` +
      `response_type=token&` +
      `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scopes)}`;

    window.location.href = authUrl;
  }

  // Make authenticated API request
  async makeRequest(endpoint, options = {}) {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available. Please authorize first.');
    }

    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, need to re-authorize
        this.accessToken = null;
        localStorage.removeItem('spotify_access_token');
        throw new Error('Token expired. Please re-authorize.');
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  }

  // Search for tracks with enhanced metadata
  async searchTracks(query, limit = 20) {
    try {
      const response = await this.makeRequest(
        `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=US`
      );
      
      return response.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        artists: track.artists.map(artist => artist.name),
        album: track.album.name,
        album_type: track.album.album_type,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        images: track.album.images,
        uri: track.uri,
        explicit: track.explicit,
        release_date: track.album.release_date,
        available_markets: track.available_markets,
        // Add formatted duration
        duration_formatted: this.formatDuration(track.duration_ms),
        // Add preview availability flag
        has_preview: !!track.preview_url
      }));
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  }

  // Get track details
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

  // Get user's top tracks
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

  // Get recently played tracks
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

  // Play track on user's device (requires Spotify Premium)
  async playTrack(trackUri) {
    try {
      await this.makeRequest('/me/player/play', {
        method: 'PUT',
        body: JSON.stringify({
          uris: [trackUri]
        })
      });
      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      return false;
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      return await this.makeRequest('/me');
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Format duration from milliseconds to MM:SS
  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Get featured playlists (for discovery)
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

  // Get new releases
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

  // Search for artists
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
        popularity: artist.popularity
      }));
    } catch (error) {
      console.error('Error searching artists:', error);
      return [];
    }
  }

  // Search for albums
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

// Create singleton instance
const spotifyAPI = new SpotifyAPI();

export default spotifyAPI;
export { SpotifyAPI };
