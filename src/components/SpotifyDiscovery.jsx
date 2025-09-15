"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import spotifyAPI from '@/lib/spotify';
import { 
  Music, 
  Play, 
  ExternalLink, 
  Clock,
  Users,
  Calendar,
  Star,
  Headphones
} from 'lucide-react';

export function SpotifyDiscovery() {
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  // Check Spotify connection on mount
  useEffect(() => {
    const token = spotifyAPI.getAccessToken();
    setIsSpotifyConnected(!!token);
  }, []);

  const loadFeaturedPlaylists = async () => {
    if (!isSpotifyConnected) return;
    
    setLoading(true);
    try {
      const playlists = await spotifyAPI.getFeaturedPlaylists(12);
      setFeaturedPlaylists(playlists);
    } catch (error) {
      console.error('Error loading featured playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNewReleases = async () => {
    if (!isSpotifyConnected) return;
    
    setLoading(true);
    try {
      const releases = await spotifyAPI.getNewReleases(12);
      setNewReleases(releases);
    } catch (error) {
      console.error('Error loading new releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSpotify = () => {
    spotifyAPI.authorize();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Headphones className="h-6 w-6 text-green-600" />
            <span>Spotify Discovery</span>
          </CardTitle>
          <CardDescription>
            Discover new music with Spotify's free features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSpotifyConnected ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Connect to Spotify for Music Discovery
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Get access to featured playlists, new releases, and personalized recommendations
                  </p>
                </div>
                <Button
                  onClick={handleConnectSpotify}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Connect Spotify
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Connected to Spotify
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isSpotifyConnected && (
        <Tabs defaultValue="playlists" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="playlists">Featured Playlists</TabsTrigger>
            <TabsTrigger value="releases">New Releases</TabsTrigger>
          </TabsList>

          <TabsContent value="playlists" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Featured Playlists</h3>
              <Button
                onClick={loadFeaturedPlaylists}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? 'Loading...' : 'Load Playlists'}
              </Button>
            </div>

            {featuredPlaylists.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredPlaylists.map((playlist) => (
                  <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={playlist.images[0]?.url || '/api/placeholder/60/60'}
                          alt={playlist.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate">{playlist.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {playlist.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                            <Users className="h-3 w-3" />
                            <span>{playlist.owner.display_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => window.open(playlist.external_urls.spotify, '_blank')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in Spotify
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {featuredPlaylists.length === 0 && !loading && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No playlists loaded yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click "Load Playlists" to discover featured content
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="releases" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Releases</h3>
              <Button
                onClick={loadNewReleases}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? 'Loading...' : 'Load New Releases'}
              </Button>
            </div>

            {newReleases.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newReleases.map((album) => (
                  <Card key={album.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={album.images[0]?.url || '/api/placeholder/60/60'}
                          alt={album.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate">{album.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {album.artists.join(', ')}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(album.release_date)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Music className="h-3 w-3" />
                              <span>{album.total_tracks} tracks</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => window.open(album.external_urls.spotify, '_blank')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in Spotify
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {newReleases.length === 0 && !loading && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No new releases loaded yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click "Load New Releases" to discover latest albums
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Free Features Info */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>What You Get with Spotify Free</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Search millions of songs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>30-second previews of most tracks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>High-quality album artwork</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Featured playlists and new releases</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Direct links to open in Spotify app</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Complete song metadata and info</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


