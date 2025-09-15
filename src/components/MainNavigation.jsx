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
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#181818] border-r border-[#2a2a2a] transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    currentPage === item.id
                      ? 'bg-[#1db954] text-white'
                      : 'text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
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
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded ${playlist.color} flex items-center justify-center`}>
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{playlist.name}</p>
                      <p className="text-xs text-[#6b7280]">{playlist.songs} songs</p>
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
        {/* Header */}
        <header className="bg-[#181818] px-6 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold capitalize">
                {navigationItems.find(item => item.id === currentPage)?.label || 'Home'}
              </h1>
              <p className="text-[#b3b3b3] text-sm">
                {navigationItems.find(item => item.id === currentPage)?.description || ''}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Now Playing Bar */}
        {currentTrack && (
          <div className="bg-[#181818] border-t border-[#2a2a2a] px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Current Track */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentTrack.name}</p>
                  <p className="text-xs text-[#b3b3b3] truncate">{currentTrack.artist}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              {/* Player Controls */}
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                  <Shuffle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={onPlayPause}
                  className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                  <SkipForward className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                  <Repeat className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <span className="text-xs text-[#b3b3b3]">{currentTrack.currentTime || '0:00'}</span>
                <div className="flex-1 h-1 bg-[#404040] rounded-full">
                  <div className="w-1/3 h-full bg-white rounded-full"></div>
                </div>
                <span className="text-xs text-[#b3b3b3]">{currentTrack.duration || '0:00'}</span>
              </div>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                  <Volume2 className="w-4 h-4" />
                </Button>
                <div className="w-20 h-1 bg-[#404040] rounded-full">
                  <div className="w-3/4 h-full bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
