"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Search, 
  MessageCircle, 
  Music, 
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  Heart,
  MoreHorizontal
} from 'lucide-react';

export function MainNavigation({ currentPage, onPageChange, currentTrack, onPlayPause, isPlaying, children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, description: 'Your music library' },
    { id: 'search', label: 'Search', icon: Search, description: 'Search for songs' },
    { id: 'discover', label: 'Discover', icon: Music, description: 'Find new music' },
    { id: 'feed', label: 'Feed', icon: Users, description: 'Community discussions' },
    { id: 'chat', label: 'Messages', icon: MessageCircle, description: 'Chat with friends' }
  ];

  return (
    <div className="flex h-screen bg-[#121212] text-white">
      {/* Sidebar - Enhanced */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-[#181818] to-[#1a1a1a] border-r border-[#2a2a2a] transition-all duration-300 flex flex-col shadow-xl`}>
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <Music className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Serenity
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg shadow-purple-500/50 border-l-2 border-purple-500'
                      : 'text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] hover:translate-x-1'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${currentPage === item.id ? 'text-purple-400' : ''}`} />
                  {!sidebarCollapsed && (
                    <span className={`font-medium ${currentPage === item.id ? 'text-purple-300' : ''}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Playlists Section */}
          {!sidebarCollapsed && (
            <div className="mt-6">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="text-sm font-semibold text-[#b3b3b3] uppercase tracking-wider">
                  Your Library
                </h3>
              </div>
              
              <div className="mt-4 space-y-1">
                {[
                  { name: "Liked Songs", songs: 42, color: "bg-gradient-to-br from-purple-500 to-pink-500" },
                  { name: "Recently Played", songs: 28, color: "bg-gradient-to-br from-blue-500 to-cyan-500" },
                  { name: "Discover Weekly", songs: 30, color: "bg-gradient-to-br from-green-500 to-emerald-500" },
                  { name: "Release Radar", songs: 25, color: "bg-gradient-to-br from-orange-500 to-red-500" }
                ].map((playlist, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-all duration-200 text-left group hover:translate-x-1"
                  >
                    <div className={`w-10 h-10 rounded-lg ${playlist.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Music className="w-5 h-5 text-white drop-shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-[#b3b3b3] group-hover:text-purple-300 transition-colors">{playlist.name}</p>
                      <p className="text-xs text-[#6b7280] group-hover:text-[#9ca3af] transition-colors">{playlist.songs} songs</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-[#2a2a2a]">
            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#2a2a2a] transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User</p>
                <p className="text-xs text-[#6b7280]">Free Plan</p>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <div className="p-3 border-t border-[#2a2a2a]">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-md text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Enhanced */}
        <header className="bg-gradient-to-r from-[#181818] to-[#1a1a1a] px-6 py-5 border-b border-[#2a2a2a] backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold capitalize bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {navigationItems.find(item => item.id === currentPage)?.label || 'Home'}
              </h1>
              <div className="h-6 w-px bg-[#2a2a2a]"></div>
              <p className="text-[#b3b3b3] text-sm font-medium">
                {navigationItems.find(item => item.id === currentPage)?.description || ''}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-all rounded-full"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Now Playing Bar - Enhanced Material Design */}
        {currentTrack && (
          <div className="bg-gradient-to-r from-[#181818] via-[#1a1a1a] to-[#181818] border-t border-[#2a2a2a] px-6 py-3 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              {/* Current Track Info */}
              <div className="flex items-center space-x-4 flex-[0_0_30%] min-w-0">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-md shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Music className="w-7 h-7 text-white drop-shadow-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate hover:text-purple-400 transition-colors cursor-pointer">
                    {currentTrack.name}
                  </p>
                  <p className="text-xs text-[#b3b3b3] truncate hover:text-white transition-colors cursor-pointer">
                    {currentTrack.artist}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#b3b3b3] hover:text-pink-400 hover:bg-[#2a2a2a] transition-all rounded-full"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-all rounded-full"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Player Controls - Center */}
              <div className="flex flex-col items-center flex-1 max-w-md">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-all rounded-full"
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-all rounded-full"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button 
                    onClick={onPlayPause}
                    className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 ml-0" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-all rounded-full"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-all rounded-full"
                  >
                    <Repeat className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Progress Bar - Interactive */}
                <div className="flex items-center space-x-3 w-full group">
                  <span className="text-xs text-[#b3b3b3] tabular-nums min-w-[40px] text-right">
                    {currentTrack.currentTime || '0:00'}
                  </span>
                  <div className="flex-1 h-1 bg-[#404040] rounded-full cursor-pointer group-hover:h-1.5 transition-all relative overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 relative group-hover:from-purple-400 group-hover:to-pink-400"
                      style={{ width: '33%' }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"></div>
                    </div>
                  </div>
                  <span className="text-xs text-[#b3b3b3] tabular-nums min-w-[40px]">
                    {currentTrack.duration || '0:00'}
                  </span>
                </div>
              </div>

              {/* Volume & Queue - Right */}
              <div className="flex items-center space-x-2 flex-[0_0_20%] justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-all rounded-full"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-all rounded-full"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <div className="w-24 h-1 bg-[#404040] rounded-full cursor-pointer hover:h-1.5 transition-all group relative overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: '75%' }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
