"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import spotifyAPI from '@/lib/spotify';
import { 
  Search, 
  Play, 
  Pause, 
  ExternalLink, 
  Music, 
  Clock,
  Users,
  Heart,
  LogIn
} from 'lucide-react';

export function MusicSearch({ onSongSelect, onShare }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isPlaying, setIsPlaying] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  // Check Spotify connection on mount
  useEffect(() => {
    const token = spotifyAPI.getAccessToken();
    setIsSpotifyConnected(!!token);
  }, []);

  // Mock search results (replace with real Spotify API)
  const mockSearchResults = [
    {
      id: '1',
      name: 'Bohemian Rhapsody',
      artist: 'Queen',
      album: 'A Night at the Opera',
      preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Mock preview
      external_urls: { spotify: 'https://open.spotify.com/track/4u7EnebtmKWnUHrv3oiiqO' },
      duration_ms: 355000,
      popularity: 95,
      images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a' }]
    },
    {
      id: '2',
      name: 'Midnight City',
      artist: 'M83',
      album: 'Hurry Up, We\'re Dreaming',
      preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      external_urls: { spotify: 'https://open.spotify.com/track/1FRzT4XgHrYgxkp6KEWRWH' },
      duration_ms: 244000,
      popularity: 78,
      images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273a4c5d5c35ad91f1d7173b3b6' }]
    },
    {
      id: '3',
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4Wl0ToT3Bk8BvB3d' },
      duration_ms: 200000,
      popularity: 88,
      images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' }]
    }
  ];

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      // Check if user is authenticated with Spotify
      const token = spotifyAPI.getAccessToken();
      
      if (!token) {
        // Use mock data if not authenticated
        setTimeout(() => {
          const filtered = mockSearchResults.filter(song => 
            song.name.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase()) ||
            song.album.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(filtered);
          setLoading(false);
        }, 1000);
        return;
      }

      // Use real Spotify API
      const results = await spotifyAPI.searchTracks(query, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data
      const filtered = mockSearchResults.filter(song => 
        song.name.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.album.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (song) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (isPlaying === song.id) {
      setIsPlaying(null);
      setCurrentAudio(null);
      return;
    }

    // Check if preview is available
    if (!song.preview_url) {
      console.log('No preview available for this song');
      // Open in Spotify instead
      window.open(song.external_urls.spotify, '_blank');
      return;
    }

    // Create new audio element
    const audio = new Audio(song.preview_url);
    
    audio.addEventListener('loadeddata', () => {
      audio.play();
      setIsPlaying(song.id);
      setCurrentAudio(audio);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(null);
      setCurrentAudio(null);
    });

    audio.addEventListener('error', () => {
      console.log('Preview not available for this song');
      // Fallback: open Spotify
      window.open(song.external_urls.spotify, '_blank');
    });
  };

  const handleShare = (song) => {
    onShare?.(song);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPreviewStatus = (song) => {
    if (song.has_preview === false) {
      return { available: false, message: 'No preview available' };
    }
    if (song.preview_url) {
      return { available: true, message: '30-second preview' };
    }
    return { available: false, message: 'Preview not available' };
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Music</span>
          </CardTitle>
          <CardDescription>
            Find songs, artists, or albums to play and share
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search for songs, artists, or albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSearch(searchQuery)}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {!isSpotifyConnected && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">
                      Connect to Spotify for Real Music Search
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Get access to millions of songs and play previews
                    </p>
                  </div>
                  <Button
                    onClick={() => spotifyAPI.authorize()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Connect Spotify
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Search Results ({searchResults.length})
          </h3>
          
          {searchResults.map((song) => (
            <Card key={song.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Album Art */}
                  <div className="relative">
                    <img
                      src={song.images[0]?.url || '/api/placeholder/60/60'}
                      alt={song.album}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <Button
                      size="sm"
                      className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/50 hover:bg-black/70"
                      onClick={() => handlePlay(song)}
                    >
                      {isPlaying === song.id ? (
                        <Pause className="h-4 w-4 text-white" />
                      ) : (
                        <Play className="h-4 w-4 text-white" />
                      )}
                    </Button>
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg truncate">{song.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400 truncate">
                      {song.artist} • {song.album}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{song.duration_formatted || formatDuration(song.duration_ms)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{song.popularity}% popular</span>
                      </span>
                      {song.explicit && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">
                          E
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      {(() => {
                        const previewStatus = getPreviewStatus(song);
                        return (
                          <span className={`text-xs px-2 py-1 rounded ${
                            previewStatus.available 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {previewStatus.message}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(song)}
                    >
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(song.external_urls.spotify, '_blank')}
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open in Spotify
                    </Button>
                    {!song.preview_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(song.external_urls.spotify, '_blank')}
                        className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Play Full Song
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No songs found for "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-1">
              Try searching for a different song, artist, or album
            </p>
          </CardContent>
        </Card>
      )}

      {/* Popular Searches */}
      {!searchQuery && searchResults.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Searches</CardTitle>
            <CardDescription>
              Try searching for these popular songs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['Bohemian Rhapsody', 'Midnight City', 'Blinding Lights', 'Shape of You', 'Levitating'].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(term);
                  }}
                >
                  {term}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
