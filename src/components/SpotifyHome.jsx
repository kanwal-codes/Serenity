"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Music, 
  Play
} from 'lucide-react';

export function SpotifyHome() {
  const { user } = useAuth();

  const playlists = [
    { id: 1, name: "Liked Songs", songs: 42, color: "bg-gradient-to-br from-purple-500 to-pink-500" },
    { id: 2, name: "Recently Played", songs: 28, color: "bg-gradient-to-br from-blue-500 to-cyan-500" },
    { id: 3, name: "Discover Weekly", songs: 30, color: "bg-gradient-to-br from-green-500 to-emerald-500" },
    { id: 4, name: "Release Radar", songs: 25, color: "bg-gradient-to-br from-orange-500 to-red-500" },
    { id: 5, name: "Chill Vibes", songs: 35, color: "bg-gradient-to-br from-indigo-500 to-purple-500" },
    { id: 6, name: "Workout Mix", songs: 40, color: "bg-gradient-to-br from-red-500 to-pink-500" }
  ];

  const recentlyPlayed = [
    { id: 1, name: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", time: "2 hours ago" },
    { id: 2, name: "Blinding Lights", artist: "The Weeknd", album: "After Hours", time: "4 hours ago" },
    { id: 3, name: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", time: "1 day ago" },
    { id: 4, name: "Shape of You", artist: "Ed Sheeran", album: "÷ (Divide)", time: "2 days ago" },
    { id: 5, name: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", time: "3 days ago" }
  ];


  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
          {/* Recently Played */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Recently Played
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recentlyPlayed.map((track) => (
                <Card 
                  key={track.id} 
                  className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a] transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <CardContent className="p-4">
                    <div className="relative mb-3 overflow-hidden rounded-lg">
                      <div className="w-full aspect-square bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                        <Music className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                      <button className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-purple-500/50">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </button>
                    </div>
                    <h3 className="font-semibold text-sm truncate text-white group-hover:text-purple-400 transition-colors">{track.name}</h3>
                    <p className="text-xs text-[#b3b3b3] truncate mt-0.5 group-hover:text-[#d3d3d3] transition-colors">{track.artist}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Made for You */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Made for You
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.slice(0, 3).map((playlist) => (
                <Card 
                  key={playlist.id} 
                  className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a] transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-4 items-center">
                      <div className={`w-20 h-20 rounded-lg ${playlist.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Music className="w-10 h-10 text-white drop-shadow-md" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate text-white group-hover:text-purple-400 transition-colors">{playlist.name}</h3>
                        <p className="text-xs text-[#b3b3b3] mt-1 group-hover:text-[#d3d3d3] transition-colors">{playlist.songs} songs</p>
                        <p className="text-xs text-[#6b7280] mt-1">Made for you</p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 shadow-lg">
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
    </div>
  );
}
