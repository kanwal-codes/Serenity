"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ALBUMS, EXPLORE_MOODS } from '@/lib/musicData';
import spotifyAPI from '@/lib/spotify';
import { useSpotify } from '@/contexts/SpotifyContext';
import { usePlayer } from '@/contexts/PlayerContext';
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

export function SpotifyDiscovery({ onSelectLibrary }) {
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isConnected, connect } = useSpotify();
  const { playTrack } = usePlayer();

  const loadFeaturedPlaylists = async () => {
    if (!isConnected) return;
    
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
    if (!isConnected) return;
    
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

  useEffect(() => {
    if (isConnected) {
      loadFeaturedPlaylists();
      loadNewReleases();
    }
  }, [isConnected]);

  const handleConnectSpotify = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Authorization error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page-scroll">
      <div className="page-content space-y-6">
      <h1 className="font-display text-[28px] font-extrabold text-foreground">Explore</h1>

      {/* Moods & Moments */}
      <div>
        <h2 className="mb-3.5 font-display text-xl font-bold text-foreground">Moods & Moments</h2>
        <div className="grid grid-cols-3 gap-3">
          {EXPLORE_MOODS.map((mood) => (
            <div
              key={mood.label}
              className="relative h-[130px] cursor-pointer overflow-hidden rounded-[18px]"
              style={{ gridColumn: `span ${mood.span}` }}
              onClick={() => playTrack(ALBUMS[0].tracks[0])}
            >
              <img src={mood.img} alt={mood.label} className="h-full w-full object-cover" />
              <div
                className="absolute inset-0 flex flex-col justify-end p-4"
                style={{ background: `linear-gradient(to top, ${mood.tint} 0%, transparent 70%)` }}
              >
                <p className="font-display text-base font-bold" style={{ color: mood.accent }}>
                  {mood.label}
                </p>
                <p className="font-body text-xs text-white/70">{mood.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spotify connection */}
      <Card className="border-border bg-card py-0 shadow-none">
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
          {!isConnected ? (
            <div className="rounded-2xl border border-[var(--m3-teal)]/30 bg-[var(--m3-teal)]/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-display font-medium text-accent">
                    Connect to Spotify for Music Discovery
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get access to featured playlists, new releases, and personalized recommendations
                  </p>
                </div>
                <Button
                  onClick={handleConnectSpotify}
                  className="shrink-0 bg-[var(--spotify-green)] text-white hover:bg-[var(--spotify-green)]/90"
                >
                  Connect Spotify
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-[var(--spotify-green)]"></div>
                <span className="text-sm font-medium text-primary">
                  Connected to Spotify
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
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
                          src={playlist.images[0]?.url || '/vercel.svg'}
                          alt={playlist.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate">{playlist.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {playlist.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{playlist.owner.display_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            onSelectLibrary?.({
                              type: "playlist",
                              id: playlist.id,
                              name: playlist.name,
                              description: playlist.description,
                              images: playlist.images,
                              owner: playlist.owner,
                              tracks: playlist.tracks,
                              external_urls: playlist.external_urls,
                            })
                          }
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Open Playlist
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(playlist.external_urls.spotify, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Spotify
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
                  <Music className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No playlists loaded yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
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
                          <p className="text-sm text-muted-foreground">
                            {album.artists.join(', ')}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
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
                          className="bg-[var(--spotify-green)] text-white hover:bg-[var(--spotify-green)]/90"
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
                  <Music className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No new releases loaded yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click "Load New Releases" to discover latest albums
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h3 className="mb-4 flex items-center space-x-2 font-display text-lg font-semibold">
            <Star className="h-5 w-5 text-[var(--m3-tertiary)]" />
            <span>What You Get with Spotify Free</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-[var(--spotify-green)]"></div>
                <span className="text-muted-foreground">Search millions of songs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-[var(--spotify-green)]"></div>
                <span className="text-muted-foreground">30-second previews of most tracks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-[var(--spotify-green)]"></div>
                <span className="text-muted-foreground">High-quality album artwork</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-[var(--spotify-green)]"></div>
                <span className="text-muted-foreground">Featured playlists and new releases</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-[var(--spotify-green)]"></div>
                <span className="text-muted-foreground">Direct links to open in Spotify app</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-[var(--spotify-green)]"></div>
                <span className="text-muted-foreground">Complete song metadata and info</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


