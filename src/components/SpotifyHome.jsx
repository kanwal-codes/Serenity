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
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Recently Played</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recentlyPlayed.map((track) => (
                <Card key={track.id} className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <div className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Music className="w-8 h-8 text-white" />
                      </div>
                      <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#1db954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </button>
                    </div>
                    <h3 className="font-medium text-sm truncate">{track.name}</h3>
                    <p className="text-xs text-[#b3b3b3] truncate">{track.artist}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Made for You */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Made for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.slice(0, 3).map((playlist) => (
                <Card key={playlist.id} className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className={`w-16 h-16 rounded ${playlist.color} flex items-center justify-center`}>
                        <Music className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{playlist.name}</h3>
                        <p className="text-xs text-[#b3b3b3]">{playlist.songs} songs</p>
                        <p className="text-xs text-[#6b7280] mt-1">Made for you</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
    </div>
  );
}
