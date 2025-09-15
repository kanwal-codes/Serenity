"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Heart, 
  MoreHorizontal,
  Music,
  Star,
  TrendingUp,
  Clock,
  Shuffle
} from 'lucide-react';

export function AppleMusicDiscover() {
  const [playingTrack, setPlayingTrack] = useState(null);

  const featuredContent = [
    {
      id: 1,
      title: "Today's Hits",
      subtitle: "The biggest songs right now",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      type: "playlist",
      tracks: 50
    },
    {
      id: 2,
      title: "New Music Daily",
      subtitle: "Fresh tracks from your favorite artists",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
      type: "playlist",
      tracks: 30
    },
    {
      id: 3,
      title: "Chill Vibes",
      subtitle: "Relaxing music for any moment",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
      type: "playlist",
      tracks: 25
    }
  ];

  const newReleases = [
    {
      id: 1,
      title: "Midnights",
      artist: "Taylor Swift",
      year: "2022",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      type: "album"
    },
    {
      id: 2,
      title: "Harry's House",
      artist: "Harry Styles",
      year: "2022",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
      type: "album"
    },
    {
      id: 3,
      title: "Renaissance",
      artist: "Beyoncé",
      year: "2022",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      type: "album"
    },
    {
      id: 4,
      title: "Mr. Morale & The Big Steppers",
      artist: "Kendrick Lamar",
      year: "2022",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      type: "album"
    }
  ];

  const trendingSongs = [
    {
      id: 1,
      title: "As It Was",
      artist: "Harry Styles",
      album: "Harry's House",
      duration: "2:47",
      isPlaying: false
    },
    {
      id: 2,
      title: "Heat Waves",
      artist: "Glass Animals",
      album: "Dreamland",
      duration: "3:58",
      isPlaying: false
    },
    {
      id: 3,
      title: "Stay",
      artist: "The Kid LAROI & Justin Bieber",
      album: "F*CK LOVE 3: OVER YOU",
      duration: "2:21",
      isPlaying: false
    },
    {
      id: 4,
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      duration: "2:58",
      isPlaying: false
    },
    {
      id: 5,
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: "3:23",
      isPlaying: false
    }
  ];

  const togglePlay = (trackId) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse</h1>
        <p className="text-[#b3b3b3]">Discover new music and explore what's trending</p>
      </div>

      {/* Featured Content */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredContent.map((item) => (
            <Card key={item.id} className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a] transition-all duration-300 group cursor-pointer overflow-hidden">
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-[#b3b3b3] text-sm mb-2">{item.subtitle}</p>
                  <div className="flex items-center space-x-4 text-xs text-[#6b7280]">
                    <span>{item.tracks} songs</span>
                    <span>•</span>
                    <span>{item.type}</span>
                  </div>
                </div>
                <button className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-5 h-5 text-white" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* New Releases */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Releases</h2>
          <Button variant="outline" className="text-[#b3b3b3] border-[#2a2a2a] hover:text-white hover:border-[#404040]">
            See All
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {newReleases.map((album) => (
            <Card key={album.id} className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a] transition-all duration-300 group cursor-pointer">
              <CardContent className="p-4">
                <div className="relative mb-3">
                  <img 
                    src={album.image} 
                    alt={album.title}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#1db954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </button>
                </div>
                <h3 className="font-medium text-sm truncate mb-1">{album.title}</h3>
                <p className="text-xs text-[#b3b3b3] truncate">{album.artist}</p>
                <p className="text-xs text-[#6b7280]">{album.year}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trending Songs */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <Button variant="outline" className="text-[#b3b3b3] border-[#2a2a2a] hover:text-white hover:border-[#404040]">
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle All
          </Button>
        </div>
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardContent className="p-0">
            {trendingSongs.map((song, index) => (
              <div 
                key={song.id} 
                className="flex items-center space-x-4 p-4 hover:bg-[#2a2a2a] transition-colors group"
              >
                <div className="w-8 text-center text-[#6b7280] text-sm">
                  {playingTrack === song.id ? (
                    <div className="w-4 h-4 mx-auto">
                      <div className="w-full h-full bg-[#1db954] rounded-sm"></div>
                    </div>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{song.title}</h3>
                  <p className="text-xs text-[#b3b3b3] truncate">{song.artist}</p>
                </div>
                <div className="hidden md:block flex-1 min-w-0">
                  <p className="text-xs text-[#6b7280] truncate">{song.album}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-[#6b7280] hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <Heart className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-[#6b7280]">{song.duration}</span>
                  <button 
                    onClick={() => togglePlay(song.id)}
                    className="text-[#6b7280] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {playingTrack === song.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Genres */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: "Pop", color: "bg-gradient-to-br from-pink-500 to-rose-500" },
            { name: "Hip-Hop", color: "bg-gradient-to-br from-purple-500 to-indigo-500" },
            { name: "Rock", color: "bg-gradient-to-br from-red-500 to-orange-500" },
            { name: "Electronic", color: "bg-gradient-to-br from-cyan-500 to-blue-500" },
            { name: "Jazz", color: "bg-gradient-to-br from-amber-500 to-yellow-500" },
            { name: "Classical", color: "bg-gradient-to-br from-gray-500 to-slate-500" }
          ].map((genre) => (
            <Card key={genre.name} className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a] transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6">
                <div className={`w-16 h-16 mx-auto rounded-lg ${genre.color} flex items-center justify-center mb-3`}>
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-center font-medium text-sm">{genre.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
